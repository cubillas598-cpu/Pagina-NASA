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
import time
import urllib.error
import urllib.parse
import urllib.request
from datetime import datetime, timedelta, timezone
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
        "TIME_TYPE": "UT",
    }
    url = HORIZONS_URL + "?" + urllib.parse.urlencode(params)
    texto = descargar(url).get("result", "")
    try:
        return parsear_bloque(texto)
    except ValueError as err:
        raise RuntimeError(
            f"Horizons no devolvio datos validos para {cuerpo_id} en {sitio['id']}: "
            f"{err} Respuesta (primeros 500 car.): {texto[:500]!r}"
        ) from err


def descargar(url, intentos=3, espera_s=5):
    """GET a Horizons con reintentos ante fallos de red o 5xx/429.
    Un 4xx distinto de 429 es un error de la consulta: no se reintenta."""
    ultimo = None
    for n in range(1, intentos + 1):
        try:
            with urllib.request.urlopen(url, timeout=60) as resp:
                return json.loads(resp.read().decode("utf-8"))
        except urllib.error.HTTPError as err:
            if err.code != 429 and err.code < 500:
                raise RuntimeError(f"Horizons rechazo la consulta (HTTP {err.code}).") from err
            ultimo = err
        except (urllib.error.URLError, TimeoutError, json.JSONDecodeError) as err:
            ultimo = err
        if n < intentos:
            print(f"  intento {n} fallo ({ultimo}); reintento en {espera_s * n} s", file=sys.stderr)
            time.sleep(espera_s * n)
    raise RuntimeError(f"Horizons no respondio tras {intentos} intentos: {ultimo}")


def parsear_bloque(texto):
    """Extrae (fecha_raw, el, az) del CSV de Horizons.

    Las columnas se ubican por el encabezado (la linea anterior a $$SOE), no por
    posicion: Horizons agrega columnas de banderas segun la configuracion. Si el
    encabezado no trae Azi/Elev se usa el formato verificado el 2026-11-14
    (fecha, bandera Sol, bandera interferente, AZ, EL)."""
    if "$$SOE" not in texto or "$$EOE" not in texto:
        raise ValueError("falta el bloque $$SOE/$$EOE.")
    antes, resto = texto.split("$$SOE", 1)
    bloque = resto.split("$$EOE", 1)[0].strip()

    i_az, i_el = 3, 4
    lineas_previas = [l for l in antes.strip().splitlines() if l.strip() and not l.strip().startswith("*")]
    if lineas_previas:
        cols = [c.strip().lower() for c in lineas_previas[-1].split(",")]
        az = [i for i, c in enumerate(cols) if c.startswith("azi")]
        el = [i for i, c in enumerate(cols) if c.startswith("elev")]
        if az and el:
            i_az, i_el = az[0], el[0]

    filas = []
    for linea in bloque.splitlines():
        if not linea.strip():
            continue
        partes = [p.strip() for p in linea.split(",")]
        try:
            filas.append((partes[0], float(partes[i_el]), float(partes[i_az])))
        except (IndexError, ValueError) as err:
            raise ValueError(f"fila ilegible: {linea.strip()!r}") from err
    if not filas:
        raise ValueError("el bloque de datos esta vacio.")
    return filas


def normalizar_fecha(fecha_raw):
    # Horizons devuelve algo como "2026-Dec-01 00:00" (a veces con prefijo "b"
    # para fechas antes de la era comun; no aplica a este proyecto).
    dt = datetime.strptime(fecha_raw.strip(), "%Y-%b-%d %H:%M")
    return dt.strftime("%Y-%m-%dT%H:%M")


def generar_para_sitio(sitio, inicio_dt, dias):
    # Intervalo semiabierto [inicio, inicio + dias): cada muestra representa la
    # hora que empieza en su marca, asi "31 dias" son 744 muestras y la ultima es
    # el 31 a las 23:00, no el 1 del mes siguiente.
    fin_dt = inicio_dt + timedelta(days=dias) - timedelta(hours=1)
    inicio_s = inicio_dt.strftime("%Y-%m-%d")
    fin_s = fin_dt.strftime("%Y-%m-%d %H:%M")

    print(f"[{sitio['id']}] consultando Sol...", file=sys.stderr)
    sol = consultar_horizons(CUERPOS["sol"], sitio, inicio_s, fin_s)
    print(f"[{sitio['id']}] consultando Tierra...", file=sys.stderr)
    tierra = consultar_horizons(CUERPOS["tierra"], sitio, inicio_s, fin_s)

    horas = emparejar(sol, tierra, sitio["id"])
    meta = {
        "fuente": "JPL Horizons API (" + HORIZONS_URL + ")",
        "generado_utc": datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%MZ"),
        "inicio": inicio_s,
        "dias": dias,
        "escala_tiempo": "UT",
        "paso": "1h",
        "intervalo": "semiabierto: cada muestra cubre la hora que empieza en su marca",
    }
    return {"sitio": sitio, "meta": meta, "horas": horas}


def emparejar(sol, tierra, id_sitio):
    """Une Sol y Tierra por marca de tiempo (no por posicion) y exige que
    ambas series cubran exactamente las mismas horas."""
    tierra_por_t = {normalizar_fecha(f): (el, az) for f, el, az in tierra}
    horas = []
    for fecha_raw, sol_el, sol_az in sol:
        t = normalizar_fecha(fecha_raw)
        if t not in tierra_por_t:
            raise RuntimeError(f"{id_sitio}: Horizons no devolvio la Tierra para {t}.")
        tierra_el, tierra_az = tierra_por_t[t]
        horas.append({"t": t, "sol_el": sol_el, "sol_az": sol_az,
                      "tierra_el": tierra_el, "tierra_az": tierra_az})
    if len(horas) != len(tierra_por_t):
        raise RuntimeError(f"{id_sitio}: Sol y Tierra no cubren las mismas horas "
                           f"({len(horas)} contra {len(tierra_por_t)}).")
    return horas


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--sitio", help="id del sitio en sitios.json")
    ap.add_argument("--todos", action="store_true", help="correr los 3 sitios")
    ap.add_argument("--inicio", required=True, help="YYYY-MM-DD")
    ap.add_argument("--dias", type=int, default=30)
    args = ap.parse_args()

    try:
        sitios = cargar_sitios()
    except (OSError, json.JSONDecodeError, KeyError, TypeError) as err:
        print(f"No se pudo leer {SITIOS_PATH}: {err}", file=sys.stderr)
        sys.exit(1)
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

    try:
        inicio_dt = datetime.strptime(args.inicio, "%Y-%m-%d")
    except ValueError:
        print(f"Fecha de inicio no valida: {args.inicio!r} (usa YYYY-MM-DD).", file=sys.stderr)
        sys.exit(1)
    if not 1 <= args.dias <= 366:
        print("--dias debe estar entre 1 y 366.", file=sys.stderr)
        sys.exit(1)

    # Se consultan todos los sitios antes de escribir: si uno falla no queda
    # una mezcla de archivos nuevos y viejos con periodos distintos.
    try:
        resultados = [generar_para_sitio(s, inicio_dt, args.dias) for s in objetivo]
    except RuntimeError as err:
        print(f"Error: {err}", file=sys.stderr)
        sys.exit(1)

    # Primero se escriben archivos temporales y luego se renombran: un fallo de
    # disco o permisos no deja una mezcla de sitios nuevos y viejos.
    try:
        publicar_conjunto(DATA_DIR, {f"{r['sitio']['id']}.json": r for r in resultados})
    except OSError as err:
        print(f"Error al escribir en {DATA_DIR}: {err}", file=sys.stderr)
        sys.exit(1)
    for r in resultados:
        print(f"[{r['sitio']['id']}] guardado en {DATA_DIR / (r['sitio']['id'] + '.json')} ({len(r['horas'])} horas)")


def publicar_conjunto(carpeta, documentos):
    """Escribe varios JSON como un conjunto: o quedan todos los nuevos o todos los
    anteriores. Primero escribe temporales; luego guarda copia de los destinos
    existentes, reemplaza uno por uno y, si un reemplazo falla, restaura los que
    ya habia cambiado. Lanza OSError si no pudo publicar."""
    carpeta.mkdir(exist_ok=True)
    temporales, respaldos, hechos = [], [], []
    try:
        for nombre, doc in documentos.items():
            destino = carpeta / nombre
            tmp = destino.with_name(nombre + ".tmp")
            temporales.append((tmp, destino))
            with open(tmp, "w", encoding="utf-8") as f:
                json.dump(doc, f, ensure_ascii=False, indent=2)
        for tmp, destino in temporales:
            if destino.exists():
                bak = destino.with_name(destino.name + ".bak")
                bak.write_bytes(destino.read_bytes())
                respaldos.append((bak, destino))
        for tmp, destino in temporales:
            tmp.replace(destino)
            hechos.append(destino)
    except OSError:
        respaldo_de = {d: b for b, d in respaldos}
        for destino in hechos:
            if destino in respaldo_de:
                respaldo_de[destino].replace(destino)
            else:
                destino.unlink(missing_ok=True)
        raise
    finally:
        for tmp, _ in temporales:
            tmp.unlink(missing_ok=True)
        for bak, _ in respaldos:
            bak.unlink(missing_ok=True)


if __name__ == "__main__":
    main()
