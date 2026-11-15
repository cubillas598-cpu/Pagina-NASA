"""Pruebas del parser de scripts/efemerides.py con respuestas sinteticas que
imitan el CSV de JPL Horizons (sin red). Correr: python3 -m unittest discover tests"""

import importlib.util
import unittest
from pathlib import Path

RUTA = Path(__file__).resolve().parent.parent / "scripts" / "efemerides.py"
spec = importlib.util.spec_from_file_location("efemerides", RUTA)
ef = importlib.util.module_from_spec(spec)
spec.loader.exec_module(ef)


def respuesta(filas, encabezado=" Date__(UT)__HR:MN, , , Azi_(a-app), Elev_(a-app),"):
    return (
        "Target body name: Sun (10)\n"
        "*******************************************************************************\n"
        f"{encabezado}\n"
        "*******************************************************************************\n"
        "$$SOE\n" + "\n".join(filas) + "\n$$EOE\n"
        "*******************************************************************************\n"
    )


class ParsearBloque(unittest.TestCase):
    def test_columnas_por_encabezado(self):
        texto = respuesta([" 2026-Dec-01 00:00, *, , 153.798584, 0.588174,"])
        self.assertEqual(ef.parsear_bloque(texto), [("2026-Dec-01 00:00", 0.588174, 153.798584)])

    def test_encabezado_con_columnas_en_otro_orden(self):
        texto = respuesta([" 2026-Dec-01 00:00, 0.5, 150.0,"], " Date__(UT)__HR:MN, Elev_(a-app), Azi_(a-app),")
        self.assertEqual(ef.parsear_bloque(texto), [("2026-Dec-01 00:00", 0.5, 150.0)])

    def test_sin_bloque_de_datos(self):
        with self.assertRaises(ValueError):
            ef.parsear_bloque("No ephemeris for target")

    def test_fila_ilegible(self):
        with self.assertRaises(ValueError):
            ef.parsear_bloque(respuesta([" 2026-Dec-01 00:00, *, , n.a., n.a.,"]))

    def test_bloque_vacio(self):
        with self.assertRaises(ValueError):
            ef.parsear_bloque(respuesta([]))


class Emparejar(unittest.TestCase):
    sol = [("2026-Dec-01 00:00", 1.0, 10.0), ("2026-Dec-01 01:00", 2.0, 20.0)]

    def test_une_por_marca_de_tiempo(self):
        tierra = [("2026-Dec-01 01:00", -2.0, 200.0), ("2026-Dec-01 00:00", -1.0, 100.0)]
        horas = ef.emparejar(self.sol, tierra, "x")
        self.assertEqual(horas[0], {"t": "2026-12-01T00:00", "sol_el": 1.0, "sol_az": 10.0,
                                    "tierra_el": -1.0, "tierra_az": 100.0})
        self.assertEqual(horas[1]["tierra_el"], -2.0)

    def test_falta_una_hora(self):
        with self.assertRaises(RuntimeError):
            ef.emparejar(self.sol, [("2026-Dec-01 00:00", -1.0, 100.0)], "x")

    def test_horas_distintas(self):
        tierra = [("2026-Dec-01 00:00", -1.0, 100.0), ("2026-Dec-01 02:00", -2.0, 200.0)]
        with self.assertRaises(RuntimeError):
            ef.emparejar(self.sol, tierra, "x")


if __name__ == "__main__":
    unittest.main()
