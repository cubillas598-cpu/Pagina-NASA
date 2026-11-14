"""
Genera data/escenario_demo.json: los supuestos de la demo que todavia no
vienen de una fuente real.

- Horizonte por sitio y por punto de apoyo: perfil SINTETICO determinista
  (misma semilla => mismos numeros). Se sustituye por LOLA skyline cuando P2
  lo tenga: basta con reemplazar "elevacion_deg" (360 valores, 1 grado de
  resolucion, azimut desde el norte local en sentido horario) y poner
  "fuente": "lola_skyline".
- Punto de apoyo (relevo), umbrales del clasificador local y evento de polvo:
  supuestos de demostracion, elegidos por el equipo.

Las efemerides NO se tocan aqui: siguen en data/<id>.json, generadas por
scripts/efemerides.py contra JPL Horizons.

Uso:
    python scripts/generar_escenario_demo.py
"""

import json
import math
import random
from pathlib import Path

RAIZ = Path(__file__).resolve().parent.parent
SALIDA = RAIZ / "data" / "escenario_demo.json"


def perfil_sintetico(semilla, base, armonicos, crestas):
    """Elevacion del horizonte (grados) para azimut 0..359.

    armonicos: lista de (k, amplitud) con fase aleatoria por semilla.
    crestas: lista de (azimut_centro, ancho, altura) gaussianas.
    """
    rnd = random.Random(semilla)
    fases = [rnd.uniform(0, 2 * math.pi) for _ in armonicos]
    valores = []
    for az in range(360):
        rad = math.radians(az)
        e = base
        for (k, amp), fase in zip(armonicos, fases):
            e += amp * math.sin(k * rad + fase)
        for centro, ancho, alto in crestas:
            d = (az - centro + 180) % 360 - 180
            e += alto * math.exp(-0.5 * (d / ancho) ** 2)
        valores.append(round(e, 2))
    return valores


def horizonte(semilla, base, armonicos, crestas):
    return {
        "fuente": "sintetico",
        "resolucion_deg": 1,
        "referencia_az": "norte local, sentido horario",
        "elevacion_deg": perfil_sintetico(semilla, base, armonicos, crestas),
    }


SITIOS = [
    {
        "id": "shackleton",
        "etiqueta": "Sitio A",
        "nombre_corto": "Borde de Shackleton",
        "efemerides": "data/shackleton.json",
        "mapa": {"x": 0.40, "y": 0.36},
        "horizonte": horizonte(
            101, 0.85,
            [(1, 0.35), (2, 0.25), (5, 0.12)],
            [(40, 14, 0.9), (200, 22, 1.4), (300, 10, 0.6)],
        ),
        "relevo": {
            "nombre": "Punto de apoyo A1",
            "az_deg": 112,
            "el_deg": 1.9,
            "distancia_km": 6.5,
            "horizonte": horizonte(
                111, -1.7,
                [(1, 0.3), (3, 0.15)],
                [(210, 12, 3.2)],
            ),
        },
    },
    {
        "id": "de_gerlache",
        "etiqueta": "Sitio B",
        "nombre_corto": "Cresta Shackleton–de Gerlache",
        "efemerides": "data/de_gerlache.json",
        "mapa": {"x": 0.72, "y": 0.30},
        "horizonte": horizonte(
            202, 0.45,
            [(1, 0.3), (3, 0.18), (6, 0.08)],
            [(120, 12, 0.8), (250, 9, 0.5)],
        ),
        "relevo": {
            "nombre": "Punto de apoyo B1",
            "az_deg": 305,
            "el_deg": 1.6,
            "distancia_km": 4.0,
            "horizonte": horizonte(
                212, -1.3,
                [(1, 0.25), (2, 0.12)],
                [(80, 16, 1.4)],
            ),
        },
    },
    {
        "id": "malapert",
        "etiqueta": "Sitio C",
        "nombre_corto": "Macizo Malapert",
        "efemerides": "data/malapert.json",
        "mapa": {"x": 0.42, "y": 0.78},
        "horizonte": horizonte(
            303, 0.1,
            [(1, 0.45), (2, 0.3), (4, 0.15)],
            [(150, 18, 1.2), (330, 11, 0.7)],
        ),
        "relevo": {
            "nombre": "Punto de apoyo C1",
            "az_deg": 60,
            "el_deg": 1.4,
            "distancia_km": 9.0,
            "horizonte": horizonte(
                313, -1.6,
                [(1, 0.3), (2, 0.15)],
                [(250, 16, 3.4)],
            ),
        },
    },
]


def main():
    doc = {
        "_nota": (
            "Supuestos de demostracion. Horizontes sinteticos deterministas "
            "(generados por scripts/generar_escenario_demo.py) hasta integrar "
            "LOLA skyline. Efemerides reales en data/<id>.json (JPL Horizons)."
        ),
        "version": 1,
        "fuentes": {
            "efemerides": {
                "nombre": "JPL Horizons",
                "estado": "en_uso",
                "detalle": "Generadas por scripts/efemerides.py; la verificación manual contra la app de JPL sigue pendiente (docs/plan.md).",
            },
            "horizonte": {
                "nombre": "LOLA skyline",
                "estado": "prevista",
                "detalle": "Mientras tanto se usa un perfil sintético de demostración; también puede activarse el horizonte plano (0°).",
            },
        },
        "sitios": SITIOS,
        "enlace_local": {
            "_nota": "Umbrales y reglas: supuestos de demostracion, no un presupuesto de enlace.",
            "rf": {"bateria_relevo_h": 72},
            "optico": {"sep_sin_enlace_deg": 4, "sep_robusto_deg": 12},
        },
        "evento_polvo": {
            "_nota": (
                "Duracion calibrada con Apollo (ver README y docs/propuesta.md): 10-12 s de polvo "
                "visible en el descenso final. El momento del aterrizaje cercano es un supuesto de demo."
            ),
            "inicio": "2026-12-06T08:20",
            "duracion_s": 12,
            "referencia": "Apollo: 10-12 s de polvo visible en descenso final; hueco de telemetria en el ascenso del Apolo 11 por su penacho.",
        },
    }
    try:
        SALIDA.write_text(json.dumps(doc, ensure_ascii=False, indent=1), encoding="utf-8")
    except OSError as err:
        raise SystemExit(f"No se pudo escribir {SALIDA}: {err}")
    print(f"Escrito {SALIDA}")


if __name__ == "__main__":
    main()
