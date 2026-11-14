# Fuentes y trazabilidad

Cada número de la demo pertenece a una de tres clases:

- **Dato NASA:** viene de un producto o servicio de NASA o JPL.
- **Cálculo derivado:** lo calcula este repositorio a partir de datos NASA.
- **Supuesto del equipo:** un valor elegido por el equipo para la demostración.

Fecha de acceso de todas las URL: 14 de noviembre de 2026.

## Datos NASA

| Institución | Producto | URL | Versión / resolución | Variable usada | Licencia / cita | Lo consume |
|---|---|---|---|---|---|---|
| NASA/JPL SSD | Horizons API (tablas de observador) | https://ssd.jpl.nasa.gov/api/horizons.api (documentación: https://ssd-api.jpl.nasa.gov/doc/horizons.html, API v1.3) | Paso de 1 h, del 1 dic 2026 00:00 al 31 dic 2026 00:00, `CENTER='coord@301'`, `COORD_TYPE=GEODETIC`, `QUANTITIES='4'` | Azimut y elevación aparentes del Sol (10) y la Tierra (399) | Servicio público de JPL | `scripts/efemerides.py` → `data/<sitio>.json` |
| NASA GSFC PGDA | "A New View of the Lunar South Pole from LOLA", producto 90 | https://pgda.gsfc.nasa.gov/products/90 | `LDEM_80S_80MPP_ADJ.TIF`: 80 m/px, de 80° S a 90° S, estereográfica polar sur, marco MOON_ME (DE421) | Altura de la superficie (m) | Citar: Barker et al. 2023, *Planetary Science Journal* 4, 183, DOI 10.3847/PSJ/acf3e1; datos DOI 10.60903/gsfcpgda-lola-spole | `scripts/horizonte.py` → `horizonte` y `relevo.horizonte` en `data/escenario_demo.json` |

## Cálculos derivados

| Cálculo | Método | Dónde | Pruebas |
|---|---|---|---|
| Horizonte por azimut (360 valores, 1°) | Rayos geodésicos (pyproj) cada 240 m hasta 30 km, con corrección por curvatura d²/2R; ángulo máximo del terreno; observador a ras de suelo | `scripts/horizonte.py` | Ninguna automática todavía |
| Sol o Tierra visibles | `elevación > horizonte(azimut)`, con interpolación circular entre grados; la igualdad cuenta como bloqueado | `web/js/model.js` (`calcularSerie`, `horizonteEn`) | `tests/model.test.mjs`, incluido el cruce 359°→0° |
| Métricas del periodo | Conteo de muestras horarias: %, ventanas continuas, mayor sombra, mayor interrupción, Sol y Tierra a la vez | `web/js/model.js` (`metricasPeriodo`) | Sí |
| Respaldo hacia la Tierra | Tramo local con servicio y Tierra sobre el horizonte del punto de apoyo, con las efemérides del lander | `web/js/model.js` | Sí |
| Índice de conveniencia S | 0.40·E + 0.35·C + 0.25·R; sin enlace activo se renormaliza con E y C | `web/js/model.js` (`suitabilityScore`) | Sí |

La resolución es horaria: el inicio y el fin de cada ventana tienen un margen de ±1 h.

## Supuestos del equipo

| Supuesto | Valor | Dónde | Comentario |
|---|---|---|---|
| Coordenadas de los sitios | `sitios.json` | `sitios.json` | Tomadas de artículos revisados por pares (cita en el campo `fuente`). Las cifras exactas no se cotejaron letra por letra con el texto original (pendiente R37). |
| Elevación del sitio | `elev_km = 0` | `sitios.json` | Es un marcador. Su efecto en el ángulo del Sol y la Tierra es despreciable; el horizonte sí usa la altura del DEM. |
| Ubicación del punto de apoyo | Azimut y distancia por sitio | `data/escenario_demo.json` (`relevo`) | Elegida por el equipo, sin optimización. Su horizonte sí viene de LOLA. |
| Elevación angular del punto de apoyo visto desde el lander | `relevo.el_deg` | `data/escenario_demo.json` | Valor fijo; todavía no se deriva del DEM. |
| Umbrales del enlace | RF: batería de 72 h. Óptico: Sol a menos de 12° pasa a robusto; a menos de 4°, sin enlace. | `data/escenario_demo.json` (`enlace_local`) | No es un presupuesto de enlace. "Rápido" y "robusto" son categorías del modelo, sin Mbps ni BER. |
| Evento de polvo | 12 s, el 6 dic 2026 a las 08:20 UTC | `data/escenario_demo.json` (`evento_polvo`) | La duración está calibrada con Apollo (10–12 s de polvo visible en el descenso final); el momento es hipotético. |
| Pesos del índice S | 0.40 / 0.35 / 0.25 | `web/js/model.js` | Propuesta del equipo, no un estándar de NASA. |
| Mapa | Posiciones ilustrativas | `data/escenario_demo.json` (`mapa`) | Rotulado en la página como "Vista conceptual". |

## Precedentes citados (contexto, no datos)

- Relevo RF: concepto LunaNet / Lunar Communications Relay de NASA.
- Enlace óptico: sistema láser O2O de Artemis II.
- Polvo: "horizon glow" observado desde Apollo, y el hueco de telemetría en el ascenso del Apollo 11 por su propio penacho.

Estos precedentes inspiran el modelo; ninguno aporta cifras a los cálculos.

## Pendientes de verificación

1. **Efemérides:** cotejar 3 instantes por sitio (inicio, mitad y fin) en https://ssd.jpl.nasa.gov/horizons/app.html con los mismos parámetros. La documentación de la API no declara de forma explícita la escala por defecto de las tablas de observador (permite UT o TT; su ejemplo usa UT), así que conviene fijar `TIME_TYPE='UT'` en `scripts/efemerides.py`.
2. **Radio del horizonte:** en sitios elevados (Malapert) el corte a 30 km puede omitir relieve más lejano. Hay que repetir con 100–150 km y comparar los porcentajes.
3. **Marcos de referencia:** el DEM usa MOON_ME (DE421); falta confirmar qué marco lunar usa Horizons para `coord@301` y si la diferencia afecta a la escala de 80 m/px.
4. **Licencia del DEM:** la página del producto pide citar el artículo, pero no nombra una licencia específica.
