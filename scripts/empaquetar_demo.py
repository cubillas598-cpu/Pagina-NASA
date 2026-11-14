"""
Empaqueta la demo web en un solo HTML autocontenido: dist/lunar-navigator-demo.html

Incrusta CSS, fuentes (base64), modulos JS y los datos JSON. El resultado se abre
con doble clic, sin servidor y sin conexion: sirve de respaldo para el jurado.

Uso:
    python scripts/empaquetar_demo.py
"""

import base64
import json
import re
from pathlib import Path

RAIZ = Path(__file__).resolve().parent.parent
WEB = RAIZ / "web"
SALIDA = RAIZ / "dist" / "lunar-navigator-demo.html"

# Orden de dependencias: cada modulo despues de los que importa.
MODULOS = [
    "js/model.js",
    "js/format.js",
    "js/datos.js",
    "js/views/estilos.js",
    "js/views/resumen.js",
    "js/views/grafica-evolucion.js",
    "js/views/panel-derecho.js",
    "js/views/panel-estado.js",
    "js/views/mapa.js",
    "js/views/grafica-horizonte.js",
    "js/views/linea-tiempo.js",
    "js/views/comparador.js",
    "js/main.js",
]

IMPORT = re.compile(r"^import\s+.*?from\s+'[^']+';\s*$", re.M)
EXPORT = re.compile(r"^export\s+(?=(async\s+)?function|const|let|class)", re.M)


def leer_texto(ruta):
    try:
        return ruta.read_text(encoding="utf-8")
    except (OSError, UnicodeDecodeError) as err:
        raise SystemExit(f"No se pudo leer {ruta}: {err}")


def leer_bytes(ruta):
    try:
        return ruta.read_bytes()
    except OSError as err:
        raise SystemExit(f"No se pudo leer {ruta}: {err}")


def leer_json(ruta):
    try:
        return json.loads(leer_texto(ruta))
    except json.JSONDecodeError as err:
        raise SystemExit(f"{ruta} no es JSON valido: {err}")


def css_con_fuentes(ruta):
    css = leer_texto(ruta)

    tipos = {".woff2": "font/woff2", ".svg": "image/svg+xml"}

    def incrustar(m):
        fuente = (ruta.parent / m.group(1)).resolve()
        if fuente.suffix not in tipos:
            raise SystemExit(f"{ruta.name}: no se sabe incrustar {fuente.name} (extension {fuente.suffix}).")
        datos = base64.b64encode(leer_bytes(fuente)).decode("ascii")
        return f'url("data:{tipos[fuente.suffix]};base64,{datos}")'

    return re.sub(r'url\("(\.\./(?:fonts|assets)/[^"]+)"\)', incrustar, css)


def main():
    html = leer_texto(WEB / "index.html")

    estilos = "\n".join(css_con_fuentes(WEB / p) for p in ("css/tokens.css", "css/app.css"))
    html = re.sub(r'\s*<link rel="stylesheet" href="css/tokens.css">\s*<link rel="stylesheet" href="css/app.css">',
                  f"\n  <style>\n{estilos}\n  </style>", html)

    partes = []
    for rel in MODULOS:
        codigo = leer_texto(WEB / rel)
        if re.search(r"^import\s*\{[^}]*$", codigo, re.M):
            raise SystemExit(f"{rel}: import en varias lineas; el empaquetador espera imports de una linea.")
        codigo = IMPORT.sub("", codigo)
        codigo = EXPORT.sub("", codigo)
        partes.append(f"// ---- {rel}\n{codigo}")
    # Todos los modulos comparten un ambito: los nombres de nivel superior deben ser unicos.
    js = "\n".join(partes)
    nombres = re.findall(r"^(?:async\s+)?(?:function\s+|const\s+|let\s+|class\s+)([A-Za-z_$][\w$]*)", js, re.M)
    repetidos = sorted({n for n in nombres if nombres.count(n) > 1})
    if repetidos:
        raise SystemExit(f"Nombres de nivel superior repetidos entre modulos: {repetidos}")

    escenario = leer_json(RAIZ / "data" / "escenario_demo.json")
    efemerides = {
        s["id"]: leer_json(RAIZ / s["efemerides"])["horas"]
        for s in escenario["sitios"]
    }
    datos = json.dumps({"escenario": escenario, "efemerides": efemerides}, ensure_ascii=False, separators=(",", ":"))
    datos = datos.replace("</", "<\\/")

    html = html.replace(
        '<script type="module" src="js/main.js"></script>',
        f'<script type="application/json" id="datos-demo">{datos}</script>\n  <script type="module">\n{js}\n  </script>',
    )
    if 'src="js/' in html or 'href="css/' in html or 'url("../' in html:
        raise SystemExit("Quedaron referencias externas sin incrustar.")

    try:
        SALIDA.parent.mkdir(exist_ok=True)
        SALIDA.write_text(html, encoding="utf-8")
    except OSError as err:
        raise SystemExit(f"No se pudo escribir {SALIDA}: {err}")
    print(f"Escrito {SALIDA} ({SALIDA.stat().st_size // 1024} KB)")


if __name__ == "__main__":
    try:
        main()
    except KeyError as err:
        raise SystemExit(f"Falta el campo {err} en los datos del escenario o de las efemerides.")
