"""
Script P1: elevacion y azimut del Sol y la Tierra, hora por hora, para un sitio
en la superficie lunar y un rango de fechas. Usa la API de JPL Horizons.

Uso:
    python efemerides.py --sitio shackleton --inicio 2026-12-01 --dias 30
    python efemerides.py --todos --inicio 2026-12-01 --dias 30

Guarda un JSON por sitio en data/<id>.json con esta forma:
{
  "sitio": {...},
  "horas": [
    {"t": "2026-12-01T00:00", "sol_el": -3.2, "sol_az": 180.1,
     "tierra_el": 1.4, "tierra_az": 90.3},
    ...
  ]
}

IMPORTANTE (R37/R4): este script asume elevacion del sitio en 0 km hasta que
P2 confirme la elevacion real contra el DEM de LOLA (ver sitios.json, campo
elev_km). Los numeros de Sol/Tierra NO cambian casi nada con esa correccion
(la distancia Tierra-Luna es ~384000 km; unos km de altura de sitio no mueven
el angulo de forma medible), pero el horizonte local SI depende del relieve
real y esta script NO lo calcula: solo da el angulo del Sol/Tierra en el
cielo, sin compararlo todavia contra el horizonte real del sitio (eso es
P2, con LOLA skyline).

Antes de seguir con el pipeline completo: comprobar un sitio a mano contra
https://ssd.jpl.nasa.gov/horizons/app.html (seleccionar Sun/Earth como
target, Center = coordenada lunar manual) y verificar que los numeros aqui
coinciden.
"""

import argparse
import json
import sys
import urllib.parse
import urllib.request
from datetime import datetime, timedelta
from pathlib import Path

HORIZONS_URL = "https://ssd.jpl.nasa.gov/api/horizons.api"

CUERPOS = {
    "sol": "10",
    "tierra": "399",
}

RAIZ = Path(__file__).resolve().parent.parent
SITIOS_PATH = RAIZ / "sitios.json"
DATA_DIR = RAIZ / "data"


def cargar_sitios():
    with open(SITIOS_PATH, "r", encoding="utf-8") as f:
        doc = json.load(f)
    return {s["id"]: s for s in doc["sitios"]}


def consultar_horizons(cuerpo_id, sitio, inicio, fin):
    """Consulta Horizons para un cuerpo (Sol o Tierra) visto desde un sitio
    lunar dado. Devuelve lista de (timestamp_iso, elevacion_deg, azimut_deg).
    """
    site_coord = f"{sitio['lon']},{sitio['lat']},{sitio['elev_km']}"
    params = {
        "format": "json",
        "COMMAND": f"'{cuerpo_id}'",
        "OBJ_DATA": "NO",
        "MAKE_EPHEM": "YES",
        "EPHEM_TYPE": "OBSERVER",
        "CENTER": "coord@301",
        "COORD_TYPE": "GEODETIC",
        "SITE_COORD": f"'{site_coord}'",
        "START_TIME": f"'{inicio}'",
        "STOP_TIME": f"'{fin}'",
        "STEP_SIZE": "'1h'",
        "QUANTITIES": "'4'",
        "ANG_FORMAT": "DEG",
        "CSV_FORMAT": "YES",
    }
    url = HORIZONS_URL + "?" + urllib.parse.urlencode(params)
    with urllib.request.urlopen(url, timeout=30) as resp:
        body = json.loads(resp.read().decode("utf-8"))

    texto = body.get("result", "")
    if "$$SOE" not in texto or "$$EOE" not in texto:
        raise RuntimeError(
            f"Horizons no devolvio un bloque de datos valido para {cuerpo_id} "
            f"en {sitio['id']}. Respuesta cruda (primeros 500 car.): "
            f"{texto[:500]!r}"
        )

    bloque = texto.split("$$SOE")[1].split("$$EOE")[0].strip()
    filas = []
    for linea in bloque.splitlines():
        linea = linea.strip()
        if not linea:
            continue
        partes = [p.strip() for p in linea.split(",")]
        # Formato CSV real (verificado 2026-11-14): fecha, flag_sol, flag_cuerpo
        # interferente, AZ, EL, (coma final). Los dos flags existen porque el
        # header declara "Vis. interferer: EARTH" - Horizons los mete siempre
        # que hay un cuerpo interferente configurado, aunque no se pidan.
        fecha_raw = partes[0]
        az = float(partes[3])
        el = float(partes[4])
        filas.append((fecha_raw, el, az))
    return filas


def normalizar_fecha(fecha_raw):
    # Horizons devuelve algo como "2026-Dec-01 00:00"
    dt = datetime.strptime(fecha_raw, "%Y-%b-%d %H:%M")
    return dt.strftime("%Y-%m-%dT%H:%M")


def generar_para_sitio(sitio, inicio_dt, dias):
    fin_dt = inicio_dt + timedelta(days=dias)
    inicio_s = inicio_dt.strftime("%Y-%m-%d")
    fin_s = fin_dt.strftime("%Y-%m-%d")

    print(f"[{sitio['id']}] consultando Sol...", file=sys.stderr)
    sol = consultar_horizons(CUERPOS["sol"], sitio, inicio_s, fin_s)
    print(f"[{sitio['id']}] consultando Tierra...", file=sys.stderr)
    tierra = consultar_horizons(CUERPOS["tierra"], sitio, inicio_s, fin_s)

    if len(sol) != len(tierra):
        raise RuntimeError(
            f"Sol devolvio {len(sol)} filas y Tierra {len(tierra)} para "
            f"{sitio['id']}: no se pueden emparejar por indice, revisar "
            f"los rangos de tiempo pedidos a Horizons."
        )

    horas = []
    for (fecha_raw, sol_el, sol_az), (_, tierra_el, tierra_az) in zip(sol, tierra):
        horas.append({
            "t": normalizar_fecha(fecha_raw),
            "sol_el": sol_el,
            "sol_az": sol_az,
            "tierra_el": tierra_el,
            "tierra_az": tierra_az,
        })

    return {"sitio": sitio, "horas": horas}


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--sitio", help="id del sitio en sitios.json")
    ap.add_argument("--todos", action="store_true", help="correr los 3 sitios")
    ap.add_argument("--inicio", required=True, help="YYYY-MM-DD")
    ap.add_argument("--dias", type=int, default=30)
    args = ap.parse_args()

    sitios = cargar_sitios()
    if args.todos:
        objetivo = list(sitios.values())
    elif args.sitio:
        if args.sitio not in sitios:
            print(f"Sitio desconocido: {args.sitio}. Opciones: {list(sitios)}",
                  file=sys.stderr)
            sys.exit(1)
        objetivo = [sitios[args.sitio]]
    else:
        print("Especifica --sitio <id> o --todos", file=sys.stderr)
        sys.exit(1)

    inicio_dt = datetime.strptime(args.inicio, "%Y-%m-%d")
    DATA_DIR.mkdir(exist_ok=True)

    for sitio in objetivo:
        resultado = generar_para_sitio(sitio, inicio_dt, args.dias)
        salida = DATA_DIR / f"{sitio['id']}.json"
        with open(salida, "w", encoding="utf-8") as f:
            json.dump(resultado, f, ensure_ascii=False, indent=2)
        print(f"[{sitio['id']}] guardado en {salida} ({len(resultado['horas'])} horas)")


if __name__ == "__main__":
    main()
