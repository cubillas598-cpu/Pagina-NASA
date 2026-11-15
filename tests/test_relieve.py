"""Pruebas de las funciones puras de scripts/relieve_3d.py (sin DEM real)."""

import importlib.util
import struct
import tempfile
import unittest
import zlib
from pathlib import Path

try:
    import numpy as np
    import rasterio  # noqa: F401  (relieve_3d lo importa al cargar)
except ImportError as err:  # la Action de efemerides no instala requirements.txt
    raise unittest.SkipTest(f"falta {err.name}; instala requirements.txt") from err

RUTA = Path(__file__).resolve().parent.parent / "scripts" / "relieve_3d.py"
spec = importlib.util.spec_from_file_location("relieve_3d", RUTA)
rel = importlib.util.module_from_spec(spec)
spec.loader.exec_module(rel)


class Sombreado(unittest.TestCase):
    def test_plano_depende_solo_de_la_altura_del_sol(self):
        h = rel.sombreado(np.zeros((5, 5)), 100.0, sol_alt=30.0)
        self.assertTrue(np.allclose(h, 0.5))

    def test_ladera_hacia_el_sol_mas_clara(self):
        # Terreno que sube hacia la derecha: su cara mira a la izquierda (oeste).
        rampa = np.tile(np.arange(10.0) * 50, (10, 1))
        oeste = rel.sombreado(rampa, 100.0, sol_az=270.0)
        este = rel.sombreado(rampa, 100.0, sol_az=90.0)
        self.assertGreater(oeste.mean(), este.mean())
        self.assertTrue(((oeste >= 0) & (oeste <= 1)).all())


class Png(unittest.TestCase):
    def test_png_gris_alfa_valido(self):
        gris = np.array([[0, 128], [255, 64]])
        alfa = np.array([[255, 0], [10, 20]])
        datos = rel.png_gris_alfa(gris, alfa)
        self.assertEqual(datos[:8], b"\x89PNG\r\n\x1a\n")
        ancho, alto, bits, tipo = struct.unpack(">IIBB", datos[16:26])
        self.assertEqual((ancho, alto, bits, tipo), (2, 2, 8, 4))
        largo = struct.unpack(">I", datos[33:37])[0]
        crudo = zlib.decompress(datos[41:41 + largo])
        self.assertEqual(crudo, bytes([0, 0, 255, 128, 0, 0, 255, 10, 64, 20]))


class EscrituraAtomica(unittest.TestCase):
    def test_escribe_y_no_deja_temporales(self):
        with tempfile.TemporaryDirectory() as d:
            ruta = Path(d) / "sub" / "a.js"
            rel.escribir_atomico(ruta, "hola")
            rel.escribir_atomico(ruta, b"\x00\x01")
            self.assertEqual(ruta.read_bytes(), b"\x00\x01")
            self.assertEqual(sorted(p.name for p in ruta.parent.iterdir()), ["a.js"])

    def test_error_borra_el_temporal(self):
        with tempfile.TemporaryDirectory() as d:
            destino = Path(d) / "dir"
            destino.mkdir()  # replace() sobre un directorio falla
            (destino / "x").write_text("ocupado")
            with self.assertRaises(OSError):
                rel.escribir_atomico(destino, "datos")
            self.assertEqual(sorted(p.name for p in Path(d).iterdir()), ["dir"])


if __name__ == "__main__":
    unittest.main()
