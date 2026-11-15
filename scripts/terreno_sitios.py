"""
Variables de terreno de cada sitio a partir de productos LOLA de NASA PGDA
(producto 90, Barker et al. 2023), a 20 m por pixel:

- elevación del sitio (m sobre la esfera de 1737.4 km),
- pendiente media y máxima en un círculo de 100 m de radio (método de Horn
  sobre el DEM de 20 m) y % del área con menos de 10° en 500 m,
- rugosidad a 100 m de base (mapa LDRM de 50 m/px: dispersión de alturas
  alrededor de un plano; si no se puede leer, se estima del DEM),
- distancia a la región en sombra permanente (PSR) más cercana, del mapa
  LPSR de 20 m (donde puede haber hielo),
- ruta de aproximación: para 8 direcciones de llegada, el ángulo máximo del
  terreno visto desde el sitio en los últimos 2 km. Un ángulo bajo es una
  llegada despejada.

Lee solo ventanas alrededor de cada sitio; con rutas /vsicurl/ los GeoTIFF
optimizados para la nube se leen por partes, sin descargarlos completos.

Uso:
    python3 scripts/terreno_sitios.py \\
        --dem /vsicurl/https://pgda.gsfc.nasa.gov/data/LOLA_20mpp/LDEM_80S_20MPP_ADJ.TIF \\
        --psr /vsicurl/https://pgda.gsfc.nasa.gov/data/LOLA_20mpp/LPSR_80S_20MPP_ADJ.TIF \\
        --rugosidad /vsicurl/https://pgda.gsfc.nasa.gov/data/LOLA_20mpp/LDRM_80S_50MPP_ADJ_ROUGH_100M.TIF
"""

import argparse
import json
import math
import sys
from datetime import datetime, timezone
from pathlib import Path

import numpy as np
import rasterio
from rasterio.windows import Window
from pyproj import CRS, Geod, Transformer

RAIZ = Path(__file__).resolve().parent.parent
ESCENARIO = RAIZ / "data" / "escenario_demo.json"
SALIDA = RAIZ / "data" / "terreno_sitios.json"

RADIO_MOON_M = 1737400.0
RADIO_PENDIENTE_M = 100.0
RADIO_LLANO_M = 500.0
PENDIENTE_LLANA_DEG = 10.0
APROX_MIN_M = 100.0
APROX_MAX_M = 2000.0
APROX_AZIMUTS = tuple(range(0, 360, 45))
RADIO_PSR_M = 25000.0


# ---------------------------------------------------------------- funciones puras

def pendiente_horn(alturas, paso_m):
    """Pendiente en grados por el método de Horn (3x3). Bordes: NaN."""
    z = np.asarray(alturas, dtype="float64")
    p = np.full(z.shape, np.nan)
    if z.shape[0] < 3 or z.shape[1] < 3:
        return p
    a, b, c = z[:-2, :-2], z[:-2, 1:-1], z[:-2, 2:]
    d, f = z[1:-1, :-2], z[1:-1, 2:]
    g, h, i = z[2:, :-2], z[2:, 1:-1], z[2:, 2:]
    dzdx = ((c + 2 * f + i) - (a + 2 * d + g)) / (8 * paso_m)
    dzdy = ((g + 2 * h + i) - (a + 2 * b + c)) / (8 * paso_m)
    p[1:-1, 1:-1] = np.degrees(np.arctan(np.hypot(dzdx, dzdy)))
    return p


def mascara_circulo(forma, centro, radio_px):
    filas, cols = np.ogrid[:forma[0], :forma[1]]
    return (filas - centro[0]) ** 2 + (cols - centro[1]) ** 2 <= radio_px ** 2


def estadisticas_pendiente(pend, centro, paso_m):
    """Media y máxima en 100 m; % del área con menos de 10° en 500 m."""
    dentro = mascara_circulo(pend.shape, centro, RADIO_PENDIENTE_M / paso_m) & np.isfinite(pend)
    amplio = mascara_circulo(pend.shape, centro, RADIO_LLANO_M / paso_m) & np.isfinite(pend)
    if not dentro.any() or not amplio.any():
        raise ValueError("sin datos de pendiente alrededor del sitio")
    return {
        "pendiente_media_deg": round(float(pend[dentro].mean()), 2),
        "pendiente_max_deg": round(float(pend[dentro].max()), 2),
        "pct_llano_500m": round(100.0 * float((pend[amplio] < PENDIENTE_LLANA_DEG).mean()), 1),
    }


def rugosidad_plano(alturas, centro, paso_m, diametro_m=100.0):
    """Dispersión (m) de las alturas alrededor de un plano ajustado en un círculo."""
    m = mascara_circulo(alturas.shape, centro, diametro_m / 2 / paso_m) & np.isfinite(alturas)
    filas, cols = np.nonzero(m)
    if len(filas) < 4:
        return None
    a = np.column_stack([filas * paso_m, cols * paso_m, np.ones(len(filas))])
    z = alturas[filas, cols]
    coef, *_ = np.linalg.lstsq(a, z, rcond=None)
    return round(float(np.std(z - a @ coef)), 2)


def obstaculo(alturas_m, distancias_m, h0_m):
    """Ángulo máximo (grados) del terreno visto desde el sitio en el tramo dado."""
    h = np.asarray(alturas_m, dtype="float64")
    d = np.asarray(distancias_m, dtype="float64")
    ok = np.isfinite(h) & (d > 0)
    if not ok.any():
        return None
    # Corrección por curvatura: el terreno lejano baja d²/2R respecto al plano local.
    ang = np.degrees(np.arctan((h[ok] - h0_m - d[ok] ** 2 / (2 * RADIO_MOON_M)) / d[ok]))
    return round(float(ang.max()), 2)


def distancia_minima_km(mascara, centro, paso_m):
    """Distancia en km del centro al pixel verdadero más cercano; None si no hay."""
    filas, cols = np.nonzero(mascara)
    if len(filas) == 0:
        return None
    d2 = (filas - centro[0]) ** 2 + (cols - centro[1]) ** 2
    return round(math.sqrt(float(d2.min())) * paso_m / 1000.0, 2)


def mascara_psr(valores, nodata):
    """El mapa LPSR marca con un valor distinto de 0 los pixeles en sombra permanente."""
    v = np.asarray(valores)
    m = np.isfinite(v) & (v != 0)
    if nodata is not None:
        m &= v != nodata
    return m


# ---------------------------------------------------------------- lectura de rasters

class Raster:
    def __init__(self, ruta):
        self.ds = rasterio.open(ruta)
        if self.ds.crs is None:
            raise RuntimeError(f"{ruta} no trae sistema de referencia.")
        geo = CRS.from_proj4(f"+proj=longlat +R={RADIO_MOON_M} +no_defs")
        self.a_raster = Transformer.from_crs(geo, self.ds.crs, always_xy=True)
        self.paso_m = abs(self.ds.transform.a)

    def fila_col(self, lat, lon):
        x, y = self.a_raster.transform(lon, lat)
        fila, col = self.ds.index(x, y)
        return fila, col

    def ventana(self, lat, lon, radio_m):
        """Ventana cuadrada centrada en el sitio; devuelve (datos float, centro)."""
        fila, col = self.fila_col(lat, lon)
        r = int(math.ceil(radio_m / self.paso_m))
        w = Window(col - r, fila - r, 2 * r + 1, 2 * r + 1)
        datos = self.ds.read(1, window=w, boundless=True, fill_value=self.ds.nodata if self.ds.nodata is not None else 0)
        datos = datos.astype("float64")
        if self.ds.nodata is not None:
            datos[datos == self.ds.nodata] = np.nan
        self.origen = (fila - r, col - r)
        return datos, (r, r)

    def cerrar(self):
        self.ds.close()


def perfil(dem, alturas, origen, geod, lat, lon, az):
    """Alturas a lo largo de la dirección de llegada, tomadas de la ventana ya leída."""
    pasos = np.arange(APROX_MIN_M, APROX_MAX_M + 1, dem.paso_m)
    h = np.full(len(pasos), np.nan)
    for k, d in enumerate(pasos):
        lon2, lat2, _ = geod.fwd(lon, lat, az, d)
        fila, col = dem.fila_col(lat2, lon2)
        fr, cr = fila - origen[0], col - origen[1]
        if 0 <= fr < alturas.shape[0] and 0 <= cr < alturas.shape[1]:
            h[k] = alturas[fr, cr]
    return h, pasos


def variables_sitio(sitio, dem, psr, rug, geod):
    lat, lon = sitio["lat"], sitio["lon"]
    alt, centro = dem.ventana(lat, lon, APROX_MAX_M + 4 * dem.paso_m)
    origen = dem.origen
    h0 = float(alt[centro])
    if not math.isfinite(h0):
        raise ValueError(f"{sitio['id']}: el DEM no tiene altura en el sitio")
    out = {"elevacion_m": round(h0, 1)}
    out.update(estadisticas_pendiente(pendiente_horn(alt, dem.paso_m), centro, dem.paso_m))

    rug_m, rug_fuente = None, None
    if rug is not None:
        v, c = rug.ventana(lat, lon, 0)
        if math.isfinite(v[c]):
            rug_m, rug_fuente = round(float(v[c]), 2), "LDRM 100 m (LOLA)"
    if rug_m is None:
        rug_m, rug_fuente = rugosidad_plano(alt, centro, dem.paso_m), "estimada del DEM de 20 m (plano en 100 m)"
    out["rugosidad_100m_m"] = rug_m
    out["rugosidad_fuente"] = rug_fuente

    por_az = []
    for az in APROX_AZIMUTS:
        h, d = perfil(dem, alt, origen, geod, lat, lon, az)
        por_az.append({"az_deg": az, "obstaculo_deg": obstaculo(h, d, h0)})
    validos = [p for p in por_az if p["obstaculo_deg"] is not None]
    mejor = min(validos, key=lambda p: p["obstaculo_deg"])
    peor = max(validos, key=lambda p: p["obstaculo_deg"])
    out["aproximacion"] = {"mejor_az_deg": mejor["az_deg"], "mejor_obstaculo_deg": mejor["obstaculo_deg"],
                           "peor_az_deg": peor["az_deg"], "peor_obstaculo_deg": peor["obstaculo_deg"],
                           "por_azimut": por_az}

    if psr is not None:
        v, c = psr.ventana(lat, lon, RADIO_PSR_M)
        m = mascara_psr(np.nan_to_num(v, nan=0.0), None)
        km = distancia_minima_km(m, c, psr.paso_m)
        out["dist_psr_km"] = km
        out["en_psr"] = bool(m[c])
        out["dist_psr_nota"] = None if km is not None else f"sin sombra permanente en {RADIO_PSR_M / 1000:.0f} km"
    return out


def coordenadas_sitios():
    esc = json.loads(ESCENARIO.read_text(encoding="utf-8"))
    sitios = []
    for s in esc["sitios"]:
        doc = json.loads((RAIZ / s["efemerides"]).read_text(encoding="utf-8"))
        sitios.append({"id": s["id"], "lat": doc["sitio"]["lat"], "lon": doc["sitio"]["lon"]})
    return sitios


def escribir_atomico(ruta, texto):
    tmp = ruta.with_name(ruta.name + ".tmp")
    try:
        tmp.write_text(texto, encoding="utf-8")
        tmp.replace(ruta)
    except OSError:
        if tmp.is_file():
            tmp.unlink()
        raise


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--dem", required=True, help="LDEM_80S_20MPP_ADJ.TIF (ruta local o /vsicurl/URL)")
    ap.add_argument("--psr", help="LPSR_80S_20MPP_ADJ.TIF")
    ap.add_argument("--rugosidad", help="LDRM_80S_50MPP_ADJ_ROUGH_100M.TIF")
    ap.add_argument("--salida", type=Path, default=SALIDA)
    args = ap.parse_args()

    try:
        sitios = coordenadas_sitios()
    except (OSError, KeyError, json.JSONDecodeError) as err:
        print(f"No se pudieron leer las coordenadas de los sitios: {err}", file=sys.stderr)
        sys.exit(1)

    abiertos = []
    try:
        dem = Raster(args.dem); abiertos.append(dem)
        psr = Raster(args.psr) if args.psr else None
        if psr: abiertos.append(psr)
        rug = None
        if args.rugosidad:
            try:
                rug = Raster(args.rugosidad); abiertos.append(rug)
            except (rasterio.errors.RasterioError, RuntimeError) as err:
                print(f"Aviso: no se pudo abrir la rugosidad ({err}); se estima del DEM.", file=sys.stderr)
        geod = Geod(a=RADIO_MOON_M, b=RADIO_MOON_M)
        resultado = {}
        for s in sitios:
            print(f"[{s['id']}] calculando terreno...", file=sys.stderr)
            resultado[s["id"]] = variables_sitio(s, dem, psr, rug, geod)
            print(f"[{s['id']}] {json.dumps({k: v for k, v in resultado[s['id']].items() if k != 'aproximacion'})}", file=sys.stderr)
    except (rasterio.errors.RasterioError, RuntimeError, ValueError, MemoryError) as err:
        print(f"Error al leer los productos LOLA: {err}", file=sys.stderr)
        sys.exit(1)
    finally:
        for r in abiertos:
            r.cerrar()

    doc = {
        "meta": {
            "fuente": "LOLA, NASA PGDA producto 90 (Barker et al. 2023, PSJ 4, 183, doi:10.3847/PSJ/acf3e1)",
            "productos": [p for p in (args.dem, args.psr, args.rugosidad) if p],
            "generado_utc": datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%MZ"),
            "metodo": (f"Pendiente de Horn sobre el DEM de 20 m: media y máxima en {RADIO_PENDIENTE_M:.0f} m de radio, "
                       f"% < {PENDIENTE_LLANA_DEG:.0f}° en {RADIO_LLANO_M:.0f} m. Rugosidad a 100 m de base. "
                       f"Aproximación: ángulo máximo del terreno visto desde el sitio entre {APROX_MIN_M:.0f} y "
                       f"{APROX_MAX_M:.0f} m, en 8 direcciones. Sombra permanente: distancia al pixel PSR más cercano "
                       f"(búsqueda hasta {RADIO_PSR_M / 1000:.0f} km)."),
        },
        "sitios": resultado,
    }
    try:
        escribir_atomico(args.salida, json.dumps(doc, ensure_ascii=False, indent=2) + "\n")
    except OSError as err:
        print(f"No se pudo escribir {args.salida}: {err}", file=sys.stderr)
        sys.exit(1)
    print(f"Escrito {args.salida}")


if __name__ == "__main__":
    main()
