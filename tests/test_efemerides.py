"""Pruebas del parser de scripts/efemerides.py con respuestas sinteticas que
imitan el CSV de JPL Horizons (sin red). Correr: python3 -m unittest discover tests"""

import importlib.util
import json
import sys
import tempfile
import unittest
from pathlib import Path
from unittest import mock

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


class Main(unittest.TestCase):
    """main() con Horizons simulado: escribe los sitios solo si todo salio bien."""

    def preparar(self, d):
        sitios = Path(d) / "sitios.json"
        sitios.write_text(json.dumps({"sitios": [
            {"id": "s1", "lat": -89.0, "lon": 126.0, "elev_km": 0},
            {"id": "s2", "lat": -86.0, "lon": 357.0, "elev_km": 0},
        ]}), encoding="utf-8")
        datos = Path(d) / "data"
        return mock.patch.multiple(ef, SITIOS_PATH=sitios, DATA_DIR=datos), datos

    def correr(self):
        argv = ["efemerides.py", "--todos", "--inicio", "2026-12-01", "--dias", "1"]
        with mock.patch.object(sys, "argv", argv), mock.patch("sys.stdout"), mock.patch("sys.stderr"):
            ef.main()

    def test_escribe_todos_los_sitios_sin_temporales(self):
        fila = [" 2026-Dec-01 00:00, *, , 10.0, 1.0,"]
        with tempfile.TemporaryDirectory() as d:
            parche, datos = self.preparar(d)
            with parche, mock.patch.object(ef, "descargar", return_value={"result": respuesta(fila)}):
                self.correr()
            self.assertEqual(sorted(p.name for p in datos.iterdir()), ["s1.json", "s2.json"])
            doc = json.loads((datos / "s1.json").read_text(encoding="utf-8"))
            self.assertEqual(doc["horas"][0]["t"], "2026-12-01T00:00")
            self.assertEqual(doc["meta"]["escala_tiempo"], "UT")

    def test_fallo_en_un_sitio_no_escribe_nada(self):
        buena = {"result": respuesta([" 2026-Dec-01 00:00, *, , 10.0, 1.0,"])}
        respuestas = [buena, buena, {"result": "sin datos"}]
        with tempfile.TemporaryDirectory() as d:
            parche, datos = self.preparar(d)
            with parche, mock.patch.object(ef, "descargar", side_effect=respuestas), self.assertRaises(SystemExit) as fin:
                self.correr()
            self.assertEqual(fin.exception.code, 1)
            self.assertFalse(datos.exists() and any(datos.iterdir()))

    def test_error_de_disco_borra_temporales(self):
        fila = [" 2026-Dec-01 00:00, *, , 10.0, 1.0,"]
        with tempfile.TemporaryDirectory() as d:
            parche, datos = self.preparar(d)
            original = json.dump
            llamadas = []

            def roto(*a, **k):
                llamadas.append(1)
                if len(llamadas) == 2:
                    raise OSError(28, "No space left on device")
                return original(*a, **k)

            with parche, mock.patch.object(ef, "descargar", return_value={"result": respuesta(fila)}), \
                    mock.patch.object(ef.json, "dump", side_effect=roto), self.assertRaises(SystemExit):
                self.correr()
            self.assertEqual(list(datos.iterdir()), [])


class PublicarConjunto(unittest.TestCase):
    def test_fallo_en_el_segundo_reemplazo_restaura_el_primero(self):
        with tempfile.TemporaryDirectory() as d:
            carpeta = Path(d)
            (carpeta / "a.json").write_text('"viejo-a"', encoding="utf-8")
            (carpeta / "b.json").write_text('"viejo-b"', encoding="utf-8")
            original = Path.replace
            llamadas = []

            def replace_roto(self_ruta, destino):
                if self_ruta.name.endswith(".tmp"):
                    llamadas.append(self_ruta.name)
                    if len(llamadas) == 2:
                        raise OSError(13, "Permission denied")
                return original(self_ruta, destino)

            with mock.patch.object(Path, "replace", replace_roto), self.assertRaises(OSError):
                ef.publicar_conjunto(carpeta, {"a.json": "nuevo-a", "b.json": "nuevo-b"})
            self.assertEqual((carpeta / "a.json").read_text(encoding="utf-8"), '"viejo-a"')
            self.assertEqual((carpeta / "b.json").read_text(encoding="utf-8"), '"viejo-b"')
            self.assertEqual(sorted(p.name for p in carpeta.iterdir()), ["a.json", "b.json"])

    def test_archivo_nuevo_se_borra_si_el_conjunto_falla(self):
        with tempfile.TemporaryDirectory() as d:
            carpeta = Path(d)
            (carpeta / "b.json").write_text('"viejo-b"', encoding="utf-8")
            original = Path.replace
            def replace_roto(self_ruta, destino):
                if self_ruta.name == "b.json.tmp":
                    raise OSError(28, "No space left on device")
                return original(self_ruta, destino)
            with mock.patch.object(Path, "replace", replace_roto), self.assertRaises(OSError):
                ef.publicar_conjunto(carpeta, {"a.json": 1, "b.json": 2})
            self.assertEqual(sorted(p.name for p in carpeta.iterdir()), ["b.json"])


class Intervalo(unittest.TestCase):
    def test_un_dia_son_24_horas_semiabiertas(self):
        urls = []
        fila = [" 2026-Dec-01 00:00, *, , 10.0, 1.0,"]
        def falso(url):
            urls.append(url)
            return {"result": respuesta(fila)}
        sitio = {"id": "s", "lat": -89.0, "lon": 126.0, "elev_km": 0}
        from datetime import datetime
        with mock.patch.object(ef, "descargar", side_effect=falso):
            ef.generar_para_sitio(sitio, datetime(2026, 12, 1), 1)
        self.assertTrue(all("STOP_TIME=%272026-12-01+23%3A00%27" in u for u in urls), urls[0])


if __name__ == "__main__":
    unittest.main()
