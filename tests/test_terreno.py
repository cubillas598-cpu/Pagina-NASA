"""Pruebas de scripts/terreno_sitios.py con rasters sintéticos (sin productos LOLA reales)."""

import importlib.util
import math
import tempfile
import unittest
from pathlib import Path

try:
    import numpy as np
    import rasterio
    from rasterio.transform import from_origin
    from pyproj import Geod
except ImportError as err:
    raise unittest.SkipTest(f"falta {err.name}; instala requirements.txt") from err

RUTA = Path(__file__).resolve().parent.parent / "scripts" / "terreno_sitios.py"
spec = importlib.util.spec_from_file_location("terreno_sitios", RUTA)
ter = importlib.util.module_from_spec(spec)
spec.loader.exec_module(ter)

CRS_POLAR = "+proj=stere +lat_0=-90 +lon_0=0 +k=1 +x_0=0 +y_0=0 +R=1737400 +units=m +no_defs"


def escribir(ruta, datos, paso, x0, y0, nodata=None):
    with rasterio.open(ruta, "w", driver="GTiff", height=datos.shape[0], width=datos.shape[1], count=1,
                       dtype=datos.dtype, crs=CRS_POLAR, transform=from_origin(x0, y0, paso, paso),
                       nodata=nodata) as ds:
        ds.write(datos, 1)


class FuncionesPuras(unittest.TestCase):
    def test_pendiente_de_un_plano(self):
        paso = 20.0
        cols = np.arange(30) * paso
        z = np.tile(cols * math.tan(math.radians(5)), (30, 1))
        p = ter.pendiente_horn(z, paso)
        self.assertTrue(np.isnan(p[0, 0]))
        self.assertAlmostEqual(float(np.nanmean(p)), 5.0, places=6)

    def test_obstaculo_pared_y_llano(self):
        d = np.array([500.0, 1000.0, 1500.0])
        self.assertAlmostEqual(ter.obstaculo([0, 100, 0], d, 0), math.degrees(math.atan((100 - 1000 ** 2 / (2 * 1737400)) / 1000)), places=2)
        self.assertLess(ter.obstaculo([0, 0, 0], d, 0), 0)  # la curvatura hace bajar el horizonte
        self.assertIsNone(ter.obstaculo([np.nan, np.nan], [100, 200], 0))

    def test_distancia_minima(self):
        m = np.zeros((11, 11), bool)
        self.assertIsNone(ter.distancia_minima_km(m, (5, 5), 20))
        m[5, 9] = True
        self.assertAlmostEqual(ter.distancia_minima_km(m, (5, 5), 20), 0.08)

    def test_mascara_psr_ignora_cero_y_sin_dato(self):
        self.assertEqual(ter.mascara_psr(np.array([0, 1, 255, 3]), 255).tolist(), [False, True, False, True])

    def test_rugosidad_plano_cero_en_un_plano(self):
        z = np.add.outer(np.arange(21) * 2.0, np.arange(21) * 3.0)
        self.assertAlmostEqual(ter.rugosidad_plano(z, (10, 10), 20.0), 0.0, places=6)


class SitioSintetico(unittest.TestCase):
    def test_variables_de_un_sitio_en_una_ladera(self):
        paso = 20.0
        n = 400  # 8 km de lado
        x0, y0 = -4000.0, 4000.0
        cols = x0 + (np.arange(n) + 0.5) * paso
        # Ladera de 6° que sube hacia +x, y un muro de 200 m en x > 1.5 km.
        z = np.tile(cols * math.tan(math.radians(6)), (n, 1)).astype("float32")
        z[:, cols > 1500] += 200
        psr = np.zeros((n, n), "uint8")
        filas_y = y0 - (np.arange(n) + 0.5) * paso
        psr[np.ix_(np.abs(filas_y) < 100, (cols > -1600) & (cols < -1400))] = 1
        with tempfile.TemporaryDirectory() as d:
            dem_r, psr_r = Path(d) / "dem.tif", Path(d) / "psr.tif"
            escribir(dem_r, z, paso, x0, y0, nodata=-99999.0)
            escribir(psr_r, psr, paso, x0, y0)
            dem, ps = ter.Raster(str(dem_r)), ter.Raster(str(psr_r))
            try:
                sitio = {"id": "prueba", "lat": -90.0 + 1e-9, "lon": 0.0}
                v = ter.variables_sitio(sitio, dem, ps, None, Geod(a=1737400, b=1737400))
            finally:
                dem.cerrar(); ps.cerrar()
        self.assertAlmostEqual(v["pendiente_media_deg"], 6.0, delta=0.05)
        self.assertEqual(v["pct_llano_500m"], 100.0)
        self.assertAlmostEqual(v["rugosidad_100m_m"], 0.0, places=2)
        self.assertEqual(v["rugosidad_fuente"], "estimada del DEM de 20 m (plano en 100 m)")
        self.assertAlmostEqual(v["dist_psr_km"], 1.41, delta=0.03)
        self.assertFalse(v["en_psr"])
        ap = v["aproximacion"]
        self.assertEqual(len(ap["por_azimut"]), 8)
        self.assertGreater(ap["peor_obstaculo_deg"], 6.0)  # hacia el muro y cuesta arriba
        self.assertLess(ap["mejor_obstaculo_deg"], 0.5)     # cuesta abajo, despejado


if __name__ == "__main__":
    unittest.main()
