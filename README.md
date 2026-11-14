# Lunar Landing Site Navigator + enlace local (RF/optico)

NASA Space Apps Challenge 2026, reto "Lunar Landing Site Navigator", sede Hermosillo.

> **Resumen de 30 segundos (para quien no tenga tiempo de leer todo):**
> Comparamos 3 sitios reales candidatos de aterrizaje en el polo sur lunar (Peak Near
> Shackleton, cresta de Gerlache, Malapert massif) con datos reales de NASA. JPL
> Horizons para Sol/Tierra, LOLA para el relieve, validados a mano contra la
> herramienta oficial de JPL (coincidencia exacta). Nuestro diferenciador: una capa de
> enlace local de respaldo (radiofrecuencia u optico) cuando falla la vista directa a
> la Tierra, y un **indice de conveniencia** (0-100) que resume todo en un solo numero
> por sitio. Demo en vivo: ver seccion "Demo web" abajo. Metodologia completa y
> honesta sobre que es dato real vs. supuesto: `docs/fuentes.md`.

Herramienta que compara sitios de aterrizaje del polo sur lunar por energia solar
y ventana de comunicacion directa a Tierra, con una capa extra que clasifica un
enlace local (radiofrecuencia u optico) en rapido, robusto o sin enlace.

**Pregunta de investigacion**: ¿Que sitio candidato de aterrizaje del polo sur lunar
(Peak Near Shackleton, cresta de Gerlache, o Malapert massif) ofrece la mejor
combinacion de energia solar y continuidad de comunicacion con la Tierra -directa y
con respaldo local (RF u optico)- al considerar el bloqueo real del terreno (datos
LOLA) y la degradacion por polvo de un aterrizaje cercano? Se responde con el indice
de conveniencia (S) del comparador, ver seccion "Indice de conveniencia" abajo.

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
- `docs/fuentes.md` — trazabilidad: dato NASA, calculo derivado y supuesto del equipo
- `docs/propuesta.md` / `docs/propuesta.pdf` — propuesta completa: principio de
  funcionamiento, arquitectura, riesgos con mitigacion, banco de preguntas
  anticipadas

## Bitacora

Ver `docs/bitacora.md` — registro de avance en tiempo real, un bloque a la vez.

## Estado

Pendientes que bloquean conclusiones (ver `docs/fuentes.md`):

- [x] Validar las efemerides contra la herramienta de JPL: coincidencia exacta a 6
      decimales en Sol y Tierra, 4 horas comparadas en Peak Near Shackleton.
      Detalle en `docs/fuentes.md`.
- [x] Sensibilidad del horizonte al radio: medido con `scripts/sensibilidad_horizonte.py`
      (30 vs 100 vs 150 km). Si cambiaba los % de Malapert/de Gerlache - si cambio
      (+3.4 a +4.4 grados en la direccion mas despejada). Datos de produccion ya
      regenerados a 150 km, sin huecos de cobertura. Detalle en `docs/fuentes.md`.
- [ ] Activar GitHub Pages (Settings > Pages > rama `main`, carpeta raiz)


- [x] Script de efemerides (Sol/Tierra por hora, JSON) para los 3 sitios candidatos
- [x] Horizonte local por sitio con DEM real de LOLA (NASA PGDA, 80 m/px)
- [x] Clasificador de enlace local (reglas de demostracion, RF y optico)
- [x] Pagina web (demo en `web/`, version de un solo archivo en `dist/`)
- [x] Indice de conveniencia (Landing Site Suitability Score) por sitio

## Demo web

En linea: https://cubillas598-cpu.github.io/Pagina-NASA/web/ (GitHub Pages, rama `main`). La raiz del sitio redirige a la demo; el esqueleto inicial quedo en `esqueleto.html`.

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

Scripts de datos en Python: `pip install -r requirements.txt` (solo
`scripts/horizonte.py` necesita numpy, rasterio y pyproj; los demas usan la biblioteca
estandar).

La resolucion es horaria: el inicio y el fin de cada ventana tienen un margen de +-1 h.

### Que es real y que es supuesto

| Pieza | Archivo | Estado |
| --- | --- | --- |
| Elevacion/azimut de Sol y Tierra por hora (dic 2026) | `data/<sitio>.json` | JPL Horizons via `scripts/efemerides.py`; falta la verificacion manual del plan |
| Horizonte por azimut de los 3 sitios | `data/escenario_demo.json` (`horizonte.fuente = "lola_skyline"`) | **Real**, calculado con el DEM de LOLA (NASA PGDA, 80 m/px) via `scripts/horizonte.py`: raycasting geodesico (pyproj) con correccion por curvatura, 360 puntos/sitio |
| Horizonte del punto de apoyo (relevo RF/optico) | `data/escenario_demo.json` (`relevo.horizonte`) | **Real**, mismo metodo LOLA que los sitios. La UBICACION del relevo (az/distancia desde el sitio) sigue siendo supuesto de demostracion de Irvin, no una cita academica |
| Duracion del evento de polvo (12 s) | `data/escenario_demo.json` | Calibrada con Apollo (10-12 s); con muestras horarias degrada esa hora a robusto |
| Umbrales RF/optico, momento del evento de polvo | `data/escenario_demo.json` | Supuestos de demostracion |
| Posiciones del mapa | `data/escenario_demo.json` (`mapa`) | Ilustrativas ("Vista conceptual") |

Para regenerar el horizonte real desde cero (otro DEM, otra resolucion):
`python scripts/horizonte.py --todos` (requiere el DEM en `dem/LDEM_80S_80MPP_ADJ.TIF`,
descargable de NASA PGDA producto 90). Escribe directo en `elevacion_deg` de cada
sitio con `"fuente": "lola_skyline"`. Para otro rango de fechas, regenerar las
efemerides con `scripts/efemerides.py`; el selector de fechas se limita solo a las
horas disponibles.

**Correccion importante (2026-11-14)**: el punto de Shackleton original (89°40'S,
129°47'E, de Wikipedia) resulto ser el CENTRO/fondo del crater, no el borde — dio un
horizonte de ~20 grados en todas direcciones, consistente con zona permanentemente en
sombra (PSR), no con un sitio de aterrizaje. El de de Gerlache tampoco tenia cita a un
paper real. Los dos se reemplazaron por sitios candidatos de literatura academica
peer-reviewed (ver `sitios.json` para la cita completa de cada uno: Icarus 2024 para
de Gerlache, iopscience/LPSC para Peak Near Shackleton). Regla aplicada de aqui en
adelante en todo el proyecto: nunca Wikipedia como fuente de un dato que se presenta
como hecho; siempre la mejor fuente academica disponible (paper peer-reviewed >
organismo oficial > .edu > Wikipedia nunca). Los tres sitios ya dan horizontes
comparables entre si (-8.5 a 6.7 grados).

**Nota de honestidad (R37)**: los numeros exactos de coordenadas de los papers citados
se obtuvieron via resumen de motor de busqueda, no via lectura directa del PDF/HTML
primario (sciencedirect.com y agupubs.onlinelibrary.wiley.com devolvieron 403 en esta
sesion). El paper en si es real y verificable por su DOI; el numero puntual de la
coordenada no esta confirmado letra por letra contra el texto original. Se marca en
`sitios.json`, campo `fuente`, para cada sitio.

Estructura: `web/js/model.js` (calculos puros, probados), `web/js/datos.js`
(carga), `web/js/views/*` (una vista por panel), `web/css/tokens.css` (paleta y
espaciado), `web/css/app.css` (componentes y responsive), `web/assets/fondo-estacion.svg`
(fondo ambiental dibujado para la demo).

Secciones (barra lateral): Resumen, Sitios, Comparador, Enlace local y Metodologia.

## Indice de conveniencia

En la vista "Comparador" de la demo, ademas de la tabla metrica por metrica, se
muestra un indice unico S (0-100, mas alto es mejor) por sitio:

```
S = w1*E + w2*C + w3*R
E = % horas con Sol visible (energia)
C = % horas con vista directa a la Tierra (comunicacion)
R = % horas con respaldo que llega a la Tierra: tramo local con servicio
    (rapido o robusto) Y punto de apoyo con la Tierra visible
w1=0.40, w2=0.35, w3=0.25 (pesos editables, deben sumar 1)
```

Si el enlace local esta desactivado, R no se mide y los dos pesos restantes se
renormalizan (`S = (w1*E + w2*C) / (w1+w2)`) para que el indice siga en escala 0-100.

Decision del equipo (14-nov): un tramo local que funciona sin que el punto de apoyo
vea la Tierra no cuenta como respaldo. Con los horizontes LOLA actuales, los puntos de
apoyo de los sitios A y B nunca ven la Tierra en diciembre de 2026, asi que su R es 0.

**Es un indice propuesto por el equipo, NO un estandar oficial de NASA.** No evalua
pendiente, rocas ni riesgos de descenso: no certifica que un sitio sea seguro. Implementado
en `web/js/model.js` (`suitabilityScore`), probado en `tests/model.test.mjs`, visible
en la tabla del comparador y en la columna `indice_conveniencia` del CSV exportado.

## Sitios candidatos

Ver `sitios.json` para coordenadas y cita completa de cada uno: Peak Near Shackleton
(region candidata Artemis III cerca del borde del crater), sitio C1 en la cresta de
Gerlache-Shackleton, y Malapert massif.

## Imagenes del proyecto

- `docs/capturas/` — capturas reales de la demo funcionando (explorador, comparador
  con el indice de conveniencia), tomadas directo del navegador, no mockups.
- `docs/imagenes/sitios-shackleton-de-gerlache-shoemaker.jpeg` — imagen de referencia
  de los craters Shackleton, de Gerlache y Shoemaker vistos desde orbita (compartida
  por Irvin). Estilo consistente con mosaicos NASA/GSFC/Arizona State University
  (LROC), igual que usa el atlas oficial del polo sur lunar (LPI). `[PENDIENTE R37]`:
  no se confirmo la URL exacta del original (llego reenviada por WhatsApp) - buscar
  la fuente precisa antes de citarla en la entrega final.

## Creditos de terceros

- Poppins (SIL Open Font License 1.1), incluida en `web/fonts/`.
- Diseño visual adaptado de "Glassmorphism Dashboard | UI DESIGN" de Oluwakemi Jegede (Behance, galeria 190227507), como referencia de composicion; no se reutilizan sus imagenes.

## Licencia

Apache 2.0 (ver `LICENSE`).
