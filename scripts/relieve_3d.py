"""
Relieve real del polo sur para los visores 3D de docs/.

Lee el DEM de LOLA (NASA PGDA producto 90, LDEM_80S_80MPP_ADJ.TIF, 80 m/px,
estereografica polar sur) y lo remuestrea a una malla cuadrada en el mismo
sistema que usan los visores: plano polar azimutal equidistante con
1 grado de colatitud = 30.32 km, 0 grados E hacia -Z.

Cada nodo de la malla es el promedio del DEM en un bloque de ~2 km (no un
pixel suelto), para no inventar detalle ni perder el que hay. Fuera de 80 S
el DEM no tiene datos: esos nodos (esquinas de la malla) se rellenan con el
nodo valido mas cercano y se cuentan en `nodos_rellenos`.

Uso:
    python scripts/relieve_3d.py                     # DEM en dem/LDEM_80S_80MPP_ADJ.TIF
    python scripts/relieve_3d.py --dem otra/ruta.tif

Escribe docs/datos/relieve-lola-sur.js (window.RELIEVE_LOLA = {...}): asi los
visores funcionan tambien abiertos con doble clic, sin servidor.
"""

import argparse
import base64
import json
import math
import sys
from datetime import datetime, timezone
from pathlib import Path

import numpy as np
import rasterio
from pyproj import CRS, Transformer

RAIZ = Path(__file__).resolve().parent.parent
DEM_DEFECTO = RAIZ / "dem" / "LDEM_80S_80MPP_ADJ.TIF"
SALIDA_DEFECTO = RAIZ / "docs" / "datos" / "relieve-lola-sur.js"
SITIOS_PATH = RAIZ / "sitios.json"

RADIO_MOON_M = 1737400.0
KM_POR_GRADO = 30.32      # misma escala que latLonToXZ en los visores
SIN_DATO = -32768


def nodo_a_latlon(x_km, z_km):
    """Inverso de latLonToXZ de los visores (x = r sen(lon), z = -r cos(lon))."""
    r = np.hypot(x_km, z_km)
    lat = -(90.0 - r / KM_POR_GRADO)
    lon = np.degrees(np.arctan2(x_km, -z_km))
    return lat, lon


def promediar_bloques(banda, factor):
    """Promedio por bloques factor x factor ignorando NaN."""
    alto = (banda.shape[0] // factor) * factor
    ancho = (banda.shape[1] // factor) * factor
    b = banda[:alto, :ancho].reshape(alto // factor, factor, ancho // factor, factor)
    validos = np.isfinite(b).sum(axis=(1, 3))
    suma = np.nansum(b, axis=(1, 3))
    with np.errstate(invalid="ignore", divide="ignore"):
        media = suma / validos
    media[validos < (factor * factor) // 2] = np.nan
    return media


def bilineal(grid, filas, cols):
    """Interpolacion bilineal en coordenadas de pixel (NaN si cae fuera)."""
    f0 = np.floor(filas).astype(int)
    c0 = np.floor(cols).astype(int)
    dentro = (f0 >= 0) & (c0 >= 0) & (f0 + 1 < grid.shape[0]) & (c0 + 1 < grid.shape[1])
    out = np.full(filas.shape, np.nan)
    f0d, c0d = f0[dentro], c0[dentro]
    tf = filas[dentro] - f0d
    tc = cols[dentro] - c0d
    a = grid[f0d, c0d]
    b = grid[f0d, c0d + 1]
    c = grid[f0d + 1, c0d]
    d = grid[f0d + 1, c0d + 1]
    out[dentro] = (a * (1 - tc) + b * tc) * (1 - tf) + (c * (1 - tc) + d * tc) * tf
    return out


def rellenar_cercano(m):
    """Rellena NaN con el vecino valido mas cercano (dilatacion por pasos)."""
    m = m.copy()
    rellenos = int(np.isnan(m).sum())
    for _ in range(max(m.shape)):
        faltan = np.isnan(m)
        if not faltan.any():
            break
        acum = np.zeros_like(m)
        cuenta = np.zeros_like(m)
        for df, dc in ((1, 0), (-1, 0), (0, 1), (0, -1)):
            v = np.roll(m, (df, dc), axis=(0, 1))
            if df == 1: v[0, :] = np.nan
            if df == -1: v[-1, :] = np.nan
            if dc == 1: v[:, 0] = np.nan
            if dc == -1: v[:, -1] = np.nan
            ok = np.isfinite(v)
            acum[ok] += v[ok]
            cuenta[ok] += 1
        nuevos = faltan & (cuenta > 0)
        m[nuevos] = acum[nuevos] / cuenta[nuevos]
    if np.isnan(m).any():
        raise RuntimeError("El DEM no tiene datos validos dentro de la malla.")
    return m, rellenos


def generar(dem_path, nodos, semilado_km):
    with rasterio.open(dem_path) as ds:
        if ds.crs is None:
            raise RuntimeError("El DEM no trae sistema de referencia.")
        banda = ds.read(1).astype("float64")
        if ds.nodata is not None:
            banda[banda == ds.nodata] = np.nan
        paso_px_m = abs(ds.transform.a)
        paso_malla_m = 2 * semilado_km * 1000 / (nodos - 1)
        factor = max(1, int(round(paso_malla_m / paso_px_m)))
        media = promediar_bloques(banda, factor)
        # Transformada de la malla promediada: mismo origen, pixel factor veces mayor.
        t = ds.transform * rasterio.Affine.scale(factor, factor)
        geo = CRS.from_proj4(f"+proj=longlat +R={RADIO_MOON_M} +no_defs")
        a_dem = Transformer.from_crs(geo, ds.crs, always_xy=True)

        coord = np.linspace(-semilado_km, semilado_km, nodos)
        x_km, z_km = np.meshgrid(coord, coord)          # fila -> z, columna -> x
        lat, lon = nodo_a_latlon(x_km, z_km)
        xs, ys = a_dem.transform(lon.ravel(), lat.ravel())
        inv = ~t
        cols, filas = inv * (np.asarray(xs), np.asarray(ys))
        # Centros de pixel: el pixel (0,0) cubre [0,1); su centro esta en 0.5.
        alturas = bilineal(media, np.asarray(filas) - 0.5, np.asarray(cols) - 0.5).reshape(nodos, nodos)
        alturas, rellenos = rellenar_cercano(alturas)

        sitios = []
        if SITIOS_PATH.exists():
            with open(SITIOS_PATH, encoding="utf-8") as f:
                for s in json.load(f)["sitios"]:
                    sx, sy = a_dem.transform(s["lon"], s["lat"])
                    fila, col = ds.index(sx, sy)
                    if 0 <= fila < ds.height and 0 <= col < ds.width and np.isfinite(banda[fila, col]):
                        sitios.append({"id": s["id"], "lat": s["lat"], "lon": s["lon"], "altura_m": round(float(banda[fila, col]), 1)})

    enteros = np.clip(np.round(alturas), -32767, 32767).astype("<i2")
    return {
        "fuente": "LOLA, NASA PGDA producto 90 (LDEM_80S_80MPP_ADJ.TIF, 80 m/px)",
        "cita": "Barker et al. 2023, Planetary Science Journal 4, 183. doi:10.3847/PSJ/acf3e1",
        "doi_datos": "10.60903/gsfcpgda-lola-spole",
        "generado_utc": datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%MZ"),
        "proyeccion": "azimutal equidistante polar sur, 30.32 km por grado, 0 E hacia -Z",
        "nodos": nodos,
        "semilado_km": semilado_km,
        "paso_km": round(2 * semilado_km / (nodos - 1), 4),
        "bloque_promedio_m": round(factor * paso_px_m, 1),
        "orden": "filas de z = -semilado a +semilado; columnas de x = -semilado a +semilado",
        "unidad": "m sobre la esfera de 1737.4 km",
        "min_m": int(enteros.min()),
        "max_m": int(enteros.max()),
        "nodos_rellenos": rellenos,
        "relleno": "Fuera de 80 S (esquinas) el DEM no tiene datos: se rellena con el nodo valido mas cercano.",
        "sitios": sitios,
        "alturas_i16_b64": base64.b64encode(enteros.tobytes()).decode("ascii"),
    }


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--dem", type=Path, default=DEM_DEFECTO)
    ap.add_argument("--salida", type=Path, default=SALIDA_DEFECTO)
    ap.add_argument("--nodos", type=int, default=241, help="nodos por lado (los visores usan 240 segmentos)")
    ap.add_argument("--semilado-km", type=float, default=240.0, help="mitad del lado de la malla en km")
    args = ap.parse_args()

    if not args.dem.exists():
        print(f"Falta el DEM en {args.dem}. Descargalo de https://pgda.gsfc.nasa.gov/products/90", file=sys.stderr)
        sys.exit(1)
    if not 2 <= args.nodos <= 1025 or args.semilado_km <= 0:
        print("--nodos debe estar entre 2 y 1025 y --semilado-km debe ser positivo.", file=sys.stderr)
        sys.exit(1)
    try:
        datos = generar(args.dem, args.nodos, args.semilado_km)
    except (rasterio.errors.RasterioError, RuntimeError, MemoryError) as err:
        print(f"No se pudo procesar el DEM: {err}", file=sys.stderr)
        sys.exit(1)
    except (OSError, json.JSONDecodeError, KeyError, TypeError) as err:
        print(f"No se pudo leer {SITIOS_PATH}: {err}", file=sys.stderr)
        sys.exit(1)

    texto = ("// Generado por scripts/relieve_3d.py. No editar a mano.\n"
             f"window.RELIEVE_LOLA = {json.dumps(datos, ensure_ascii=False)};\n")
    tmp = args.salida.with_suffix(".js.tmp")
    try:
        args.salida.parent.mkdir(parents=True, exist_ok=True)
        tmp.write_text(texto, encoding="utf-8")
        tmp.replace(args.salida)
    except OSError as err:
        tmp.unlink(missing_ok=True)
        print(f"No se pudo escribir {args.salida}: {err}", file=sys.stderr)
        sys.exit(1)
    print(f"Escrito {args.salida} ({len(texto) // 1024} KB): {datos['nodos']}x{datos['nodos']} nodos, "
          f"{datos['min_m']} a {datos['max_m']} m, {datos['nodos_rellenos']} nodos rellenos.")
    for s in datos["sitios"]:
        print(f"  {s['id']}: {s['altura_m']} m")


if __name__ == "__main__":
    main()
