"""
Prueba de sensibilidad: compara el horizonte real (LOLA) calculado con el
radio actual de produccion (30 km, scripts/horizonte.py) contra radios mas
grandes (100 km, 150 km), para los 3 sitios. NO escribe nada en
escenario_demo.json - es solo una medicion de contraste, pendiente del README
("Sensibilidad del horizonte al radio de 30 km... puede cambiar los % de
Malapert").

Uso: python sensibilidad_horizonte.py
"""

import json
import sys
from pathlib import Path

import numpy as np
import rasterio
from pyproj import CRS, Geod, Transformer

RAIZ_DATOS = Path(__file__).resolve().parent.parent
SITIOS_PATH = RAIZ_DATOS / "sitios.json"
DEM_PATH = RAIZ_DATOS / "dem" / "LDEM_80S_80MPP_ADJ.TIF"

RADIO_MOON_M = 1737400.0
PASO_DISTANCIA_M = 240.0
RADIOS_KM = [30.0, 100.0, 150.0]


def cargar_sitios():
    with open(SITIOS_PATH, "r", encoding="utf-8") as f:
        doc = json.load(f)
    return doc["sitios"]


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


def horizonte_a_radio(dataset, banda, transformador, geod, lon0, lat0, radio_km):
    z0 = muestrear_elevaciones(dataset, transformador, banda, [lon0], [lat0])[0]
    distancias = np.arange(PASO_DISTANCIA_M, radio_km * 1000 + 1, PASO_DISTANCIA_M)
    azimutes = np.arange(0, 360, 1)

    elevacion_deg = []
    huecos = 0
    for az in azimutes:
        az_arr = np.full(distancias.shape, float(az))
        lons2, lats2, _ = geod.fwd(
            np.full(distancias.shape, lon0), np.full(distancias.shape, lat0),
            az_arr, distancias,
        )
        elevaciones = muestrear_elevaciones(dataset, transformador, banda, lons2, lats2)
        validas = ~np.isnan(elevaciones)
        if not validas.any():
            elevacion_deg.append(None)
            huecos += 1
            continue
        d_validas = distancias[validas]
        z_validas = elevaciones[validas]
        caida_curvatura = (d_validas ** 2) / (2 * RADIO_MOON_M)
        angulo = np.degrees(np.arctan2(z_validas - z0 - caida_curvatura, d_validas))
        elevacion_deg.append(round(float(np.max(angulo)), 2))
    return elevacion_deg, huecos


def main():
    if not DEM_PATH.exists():
        print(f"Falta el DEM en {DEM_PATH}", file=sys.stderr)
        sys.exit(1)

    sitios = cargar_sitios()
    geod = Geod(a=RADIO_MOON_M, b=RADIO_MOON_M)

    with rasterio.open(DEM_PATH) as dataset:
        transformador = construir_transformador(dataset.crs)
        banda = dataset.read(1)

        print(f"{'sitio':<14} {'radio_km':>9} {'min_deg':>9} {'max_deg':>9} {'huecos':>7}")
        for sitio in sitios:
            lon0, lat0 = sitio["lon"], sitio["lat"]
            resultados = {}
            for radio in RADIOS_KM:
                elevacion_deg, huecos = horizonte_a_radio(
                    dataset, banda, transformador, geod, lon0, lat0, radio
                )
                validos = [v for v in elevacion_deg if v is not None]
                resultados[radio] = (min(validos), max(validos), huecos)
                print(f"{sitio['id']:<14} {radio:>9.0f} {min(validos):>9.2f} "
                      f"{max(validos):>9.2f} {huecos:>7}")

            base = resultados[30.0]
            for radio in RADIOS_KM[1:]:
                r = resultados[radio]
                delta_min = r[0] - base[0]
                delta_max = r[1] - base[1]
                print(f"  -> {sitio['id']} a {radio:.0f}km vs 30km: "
                      f"delta_min={delta_min:+.2f} deg, delta_max={delta_max:+.2f} deg")
            print()


if __name__ == "__main__":
    main()
