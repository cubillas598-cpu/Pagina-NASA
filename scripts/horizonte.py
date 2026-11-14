"""
Script P2: perfil de horizonte real por azimut para cada sitio, a partir del
DEM real de LOLA (polo sur, 80 m/pixel, NASA PGDA producto 90).

Escribe el resultado DIRECTO en data/escenario_demo.json (repo Pagina-NASA),
reemplazando el campo "horizonte" de cada sitio que coincida por id, en el
formato EXACTO que la demo de Irvin ya espera (ver su README, seccion
"Que es real y que es supuesto"):
  horizonte.fuente = "lola_skyline"
  horizonte.resolucion_deg = 1
  horizonte.referencia_az = "norte local, sentido horario"
  horizonte.elevacion_deg = [360 valores, indice 0 = azimut 0, sentido horario]

Metodo: para cada sitio y cada azimut (0 a 359, igual convencion que Horizons:
norte=0, sentido horario), se tira un rayo sobre la ESFERA lunar usando
geodesia real (pyproj.Geod), no una formula de proyeccion hecha a mano -
asi se evita el error clasico de invertir el sentido de una estereografica
polar sur, que se veria bien y daria el horizonte rotado sin avisar.

Para cada punto del rayo (lon, lat a distancia d) se transforma al CRS nativo
del DEM (pyproj.Transformer, tomado del propio GeoTIFF) y se muestrea la
elevacion ahi. El angulo de elevacion del terreno incluye la correccion por
curvatura (d^2 / (2R)), relevante a estas distancias (decenas de km).

Uso:
    python horizonte.py --todos
    python horizonte.py --sitio malapert
"""

import argparse
import json
import sys
from pathlib import Path

import numpy as np
import rasterio
from pyproj import CRS, Geod, Transformer

RAIZ_DATOS = Path(__file__).resolve().parent.parent
SITIOS_PATH = RAIZ_DATOS / "sitios.json"
DEM_PATH = RAIZ_DATOS / "dem" / "LDEM_80S_80MPP_ADJ.TIF"

REPO_PAGINA = Path(r"D:/PROYECTOS CLAUDE/Pagina-NASA")
ESCENARIO_PATH = REPO_PAGINA / "data" / "escenario_demo.json"

RADIO_MOON_M = 1737400.0
RADIO_MAX_KM = 30.0
PASO_DISTANCIA_M = 240.0  # 3 pixeles del DEM de 80 m


def cargar_sitios():
    with open(SITIOS_PATH, "r", encoding="utf-8") as f:
        doc = json.load(f)
    return {s["id"]: s for s in doc["sitios"]}


def construir_transformador(dem_crs):
    geo_crs = CRS.from_proj4(f"+proj=longlat +R={RADIO_MOON_M} +no_defs")
    return Transformer.from_crs(geo_crs, dem_crs, always_xy=True)


def muestrear_elevaciones(dataset, transformador, banda, lons, lats):
    xs, ys = transformador.transform(lons, lats)
    filas, cols = rasterio.transform.rowcol(dataset.transform, xs, ys)
    filas = np.asarray(filas)
    cols = np.asarray(cols)
    nodata = dataset.nodata
    dentro = (
        (filas >= 0) & (filas < dataset.height) &
        (cols >= 0) & (cols < dataset.width)
    )
    elevaciones = np.full(len(lons), np.nan)
    elevaciones[dentro] = banda[filas[dentro], cols[dentro]]
    if nodata is not None:
        elevaciones[elevaciones == nodata] = np.nan
    return elevaciones


def horizonte_de_sitio(dataset, banda, transformador, geod, sitio):
    lon0, lat0 = sitio["lon"], sitio["lat"]
    z0 = muestrear_elevaciones(dataset, transformador, banda, [lon0], [lat0])[0]
    if np.isnan(z0):
        raise RuntimeError(
            f"El sitio {sitio['id']} cae fuera de la cobertura del DEM o en "
            f"un pixel sin dato. Revisar coordenadas."
        )

    distancias = np.arange(PASO_DISTANCIA_M, RADIO_MAX_KM * 1000 + 1,
                            PASO_DISTANCIA_M)
    azimutes = np.arange(0, 360, 1)  # 1 grado, 360 puntos, az 0 = norte

    elevacion_deg = []
    for az in azimutes:
        az_arr = np.full(distancias.shape, float(az))
        lons2, lats2, _ = geod.fwd(
            np.full(distancias.shape, lon0),
            np.full(distancias.shape, lat0),
            az_arr,
            distancias,
        )
        elevaciones = muestrear_elevaciones(dataset, transformador, banda, lons2, lats2)
        validas = ~np.isnan(elevaciones)
        if not validas.any():
            elevacion_deg.append(None)
            continue

        d_validas = distancias[validas]
        z_validas = elevaciones[validas]
        caida_curvatura = (d_validas ** 2) / (2 * RADIO_MOON_M)
        angulo = np.degrees(
            np.arctan2(z_validas - z0 - caida_curvatura, d_validas)
        )
        elevacion_deg.append(round(float(np.max(angulo)), 2))

    return elevacion_deg


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--sitio")
    ap.add_argument("--todos", action="store_true")
    args = ap.parse_args()

    if not DEM_PATH.exists():
        print(f"Falta el DEM en {DEM_PATH}. Descargalo primero.", file=sys.stderr)
        sys.exit(1)
    if not ESCENARIO_PATH.exists():
        print(f"No encuentro {ESCENARIO_PATH}. Revisar que el repo este clonado ahi.",
              file=sys.stderr)
        sys.exit(1)

    sitios = cargar_sitios()
    if args.todos:
        objetivo = list(sitios.values())
    elif args.sitio:
        if args.sitio not in sitios:
            print(f"Sitio desconocido: {args.sitio}", file=sys.stderr)
            sys.exit(1)
        objetivo = [sitios[args.sitio]]
    else:
        print("Especifica --sitio <id> o --todos", file=sys.stderr)
        sys.exit(1)

    geod = Geod(a=RADIO_MOON_M, b=RADIO_MOON_M)

    with open(ESCENARIO_PATH, "r", encoding="utf-8") as f:
        escenario = json.load(f)

    sitios_por_id = {s["id"]: s for s in escenario["sitios"]}

    with rasterio.open(DEM_PATH) as dataset:
        transformador = construir_transformador(dataset.crs)
        banda = dataset.read(1)
        for sitio in objetivo:
            if sitio["id"] not in sitios_por_id:
                print(f"[{sitio['id']}] no esta en escenario_demo.json, se omite",
                      file=sys.stderr)
                continue
            print(f"[{sitio['id']}] calculando horizonte real desde LOLA...",
                  file=sys.stderr)
            elevacion_deg = horizonte_de_sitio(dataset, banda, transformador, geod, sitio)

            destino = sitios_por_id[sitio["id"]]
            destino["horizonte"] = {
                "fuente": "lola_skyline",
                "resolucion_deg": 1,
                "referencia_az": "norte local, sentido horario",
                "elevacion_deg": elevacion_deg,
            }
            validos = [v for v in elevacion_deg if v is not None]
            print(f"[{sitio['id']}] horizonte real: min={min(validos):.2f} deg, "
                  f"max={max(validos):.2f} deg, {len(validos)}/360 puntos validos")

    with open(ESCENARIO_PATH, "w", encoding="utf-8") as f:
        json.dump(escenario, f, ensure_ascii=False, indent=2)
    print(f"Guardado: {ESCENARIO_PATH}")


if __name__ == "__main__":
    main()
