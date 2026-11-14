"""
Empaqueta la demo web en un solo HTML autocontenido: dist/lunar-navigator-demo.html

Incrusta CSS, fuentes e imagenes (base64), el JavaScript ya compilado por
esbuild (web/build/app.js, incluye Three.js) y los datos JSON. El resultado se
abre con doble clic, sin servidor y sin conexion: sirve de respaldo para el jurado.

Uso:
    npm run empaquetar          (compila y empaqueta)
    python scripts/empaquetar_demo.py   (solo empaqueta; exige build al dia)
"""

import base64
import json
import re
from pathlib import Path

RAIZ = Path(__file__).resolve().parent.parent
WEB = RAIZ / "web"
SALIDA = RAIZ / "dist" / "lunar-navigator-demo.html"

BUNDLE = WEB / "build" / "app.js"
TIPOS = {".woff2": "font/woff2", ".svg": "image/svg+xml", ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".png": "image/png"}


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

    def incrustar(m):
        fuente = (ruta.parent / m.group(1)).resolve()
        if fuente.suffix not in TIPOS:
            raise SystemExit(f"{ruta.name}: no se sabe incrustar {fuente.name} (extension {fuente.suffix}).")
        datos = base64.b64encode(leer_bytes(fuente)).decode("ascii")
        return f'url("data:{TIPOS[fuente.suffix]};base64,{datos}")'

    return re.sub(r'url\("(\.\./(?:fonts|assets)/[^"]+)"\)', incrustar, css)


def main():
    html = leer_texto(WEB / "index.html")

    estilos = "\n".join(css_con_fuentes(WEB / p) for p in ("css/tokens.css", "css/app.css"))
    html = re.sub(r'\s*<link rel="stylesheet" href="css/tokens.css">\s*<link rel="stylesheet" href="css/app.css">',
                  f"\n  <style>\n{estilos}\n  </style>", html)

    if not BUNDLE.exists():
        raise SystemExit("Falta web/build/app.js: ejecuta npm run build.")
    fuentes_js = list((WEB / "js").rglob("*.js"))
    if any(f.stat().st_mtime > BUNDLE.stat().st_mtime for f in fuentes_js):
        raise SystemExit("web/build/app.js es mas viejo que web/js: ejecuta npm run build.")
    js = leer_texto(BUNDLE).replace("</script", "<\\/script")

    # Imagenes enlazadas desde el HTML (por ejemplo la textura de la Luna).
    def incrustar_href(m):
        ruta = (WEB / m.group(2)).resolve()
        if ruta.suffix not in TIPOS:
            raise SystemExit(f"index.html: no se sabe incrustar {ruta.name}.")
        return f'{m.group(1)}"data:{TIPOS[ruta.suffix]};base64,{base64.b64encode(leer_bytes(ruta)).decode("ascii")}"'
    html = re.sub(r'(href=)"(assets/[^"]+)"', incrustar_href, html)

    escenario = leer_json(RAIZ / "data" / "escenario_demo.json")
    docs = {s["id"]: leer_json(RAIZ / s["efemerides"]) for s in escenario["sitios"]}
    efemerides = {i: d["horas"] for i, d in docs.items()}
    coordenadas = {i: d["sitio"] for i, d in docs.items()}
    datos = json.dumps({"escenario": escenario, "efemerides": efemerides, "coordenadas": coordenadas},
                       ensure_ascii=False, separators=(",", ":"))
    datos = datos.replace("</", "<\\/")

    html = html.replace(
        '<script type="module" src="build/app.js"></script>',
        f'<script type="application/json" id="datos-demo">{datos}</script>\n  <script type="module">\n{js}\n  </script>',
    )
    if 'src="build/' in html or 'href="css/' in html or 'url("../' in html or 'href="assets/' in html:
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
