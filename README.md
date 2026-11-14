# Lunar Landing Site Navigator + enlace local (RF/optico)

NASA Space Apps Challenge 2026, reto "Lunar Landing Site Navigator", sede Hermosillo.

Herramienta que compara sitios de aterrizaje del polo sur lunar por energia solar
y ventana de comunicacion directa a Tierra, con una capa extra que clasifica un
enlace local (radiofrecuencia u optico) en rapido, robusto o sin enlace.

## Fuentes y datos

- Efemerides de Sol y Tierra: [JPL Horizons API](https://ssd.jpl.nasa.gov/horizons/)
- Relieve y horizonte del polo sur: NASA LOLA
- Precedente del enlace RF: concepto de relevo LunaNet / Lunar Communications Relay de NASA
- Precedente del enlace optico: sistema laser O2O de Artemis II; "horizon glow" de polvo
  lunar estudiado desde las misiones Apollo
- Duracion del evento de polvo calibrada con datos reales de Apollo: 10-12 segundos de
  polvo visible en descenso final, y hueco de telemetria real en el ascenso del Apolo 11
  por su propio penacho de escape (documentado por Brian O'Brien)

## Documentos

- `docs/plan.md` — plan por bloques horarios, roles, riesgos y orden de recorte
- `docs/propuesta.md` / `docs/propuesta.pdf` — propuesta completa: principio de
  funcionamiento, arquitectura, riesgos con mitigacion, banco de preguntas
  anticipadas

## Estado

- [x] Script de efemerides (Sol/Tierra por hora, JSON) para los 3 sitios candidatos
- [ ] Horizonte local por sitio (LOLA skyline). La demo usa un perfil sintetico mientras tanto
- [x] Clasificador de enlace local (reglas de demostracion, RF y optico)
- [x] Pagina web (demo en `web/`, version de un solo archivo en `dist/`)

## Demo web

En linea: https://cubillas598-cpu.github.io/Pagina-NASA/web/ (GitHub Pages, rama `main`). La raiz del sitio muestra el esqueleto de `index.html`.

Pagina estatica sin dependencias ni build (HTML, CSS y modulos JS). Lee los JSON
de `data/` y calcula todo en el navegador.

```bash
python3 -m http.server 8000      # desde la raiz del repo
# abrir http://localhost:8000/web/
```

Version de respaldo para el jurado, un solo HTML que abre con doble clic y sin
internet (fuentes y datos incrustados):

```bash
python3 scripts/empaquetar_demo.py   # escribe dist/lunar-navigator-demo.html
```

Pruebas del modelo de calculo (Node 18+): `node --test tests/*.test.mjs`

### Que es real y que es supuesto

| Pieza | Archivo | Estado |
| --- | --- | --- |
| Elevacion/azimut de Sol y Tierra por hora (dic 2026) | `data/<sitio>.json` | JPL Horizons via `scripts/efemerides.py`; falta la verificacion manual del plan |
| Horizonte por azimut del sitio y del punto de apoyo | `data/escenario_demo.json` | Sintetico determinista (`scripts/generar_escenario_demo.py`). Tambien hay modo horizonte plano |
| Duracion del evento de polvo (12 s) | `data/escenario_demo.json` | Calibrada con Apollo (10-12 s); con muestras horarias degrada esa hora a robusto |
| Punto de apoyo, umbrales RF/optico, momento del evento de polvo | `data/escenario_demo.json` | Supuestos de demostracion |
| Posiciones del mapa | `data/escenario_demo.json` (`mapa`) | Ilustrativas ("Vista conceptual") |

Para pasar a LOLA skyline: reemplazar `elevacion_deg` de cada `horizonte`
(360 valores, 1 grado, azimut desde el norte local en sentido horario) y poner
`"fuente": "lola_skyline"`. El resto de la pagina no cambia. Para otro rango de
fechas, regenerar las efemerides con `scripts/efemerides.py`; el selector de
fechas se limita solo a las horas disponibles.

Estructura: `web/js/model.js` (calculos puros, probados), `web/js/datos.js`
(carga), `web/js/views/*` (una vista por panel), `web/css/tokens.css` (paleta y
espaciado), `web/css/app.css` (componentes y responsive), `web/assets/fondo-estacion.svg`
(fondo ambiental dibujado para la demo).

Secciones (barra lateral): Resumen, Sitios, Comparador, Enlace local y Metodologia.

## Sitios candidatos

Ver `sitios.json`. Shackleton (borde del crater), cresta Shackleton-de Gerlache,
y Malapert massif, los tres candidatos oficiales de Artemis III finalizados por
NASA en octubre de 2024.

## Creditos de terceros

- Poppins (SIL Open Font License 1.1), incluida en `web/fonts/`.
- Diseño visual adaptado de "Glassmorphism Dashboard | UI DESIGN" de Oluwakemi Jegede (Behance, galeria 190227507), como referencia de composicion; no se reutilizan sus imagenes.

## Licencia

Apache 2.0 (ver `LICENSE`).
