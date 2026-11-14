# Bitacora de avance

Registro append-only, una entrada por bloque terminado. No se borra ni se reescribe lo
anterior, solo se agrega abajo.

---

### 2026-11-14 11:17 - Repo creado
- Licencia Apache 2.0, README, script de efemerides (JPL Horizons) corriendo para los
  3 sitios candidatos (Shackleton, cresta de Gerlache, Malapert massif).
- Commit `ac5f104`.

### 2026-11-14 ~12:07 - Documentacion centralizada
- Plan por bloques y propuesta completa (md + pdf) subidos a `docs/`.
- Commit `84837b5`.

### 2026-11-14 ~12:10 - Capa optica calibrada con datos reales
- El evento de polvo de la capa optica ya no es un numero inventado: se calibro con dos
  datos documentados de Apollo (10-12 segundos de polvo visible en descenso, hueco de
  telemetria real en el ascenso del Apolo 11 por su propio penacho).
- Commit `61a1ee2`.

### 2026-11-14 ~12:30 - Esqueleto de pagina web
- `index.html` + `app.js`: selector de fecha/hora, tarjetas por sitio con franjas de
  Sol visible / Tierra visible / enlace local (esta ultima todavia sin datos reales).
- Commit `01b3215`.

### 2026-11-14 ~12:40 - Horizonte real en progreso
- Descargando DEM real de LOLA (NASA PGDA, polo sur, 80 m/pixel, `LDEM_80S_80MPP_ADJ.TIF`,
  ~189 MB) y corriendo `scripts/horizonte.py` para los 3 sitios: perfil de horizonte real
  por azimut usando geodesia esferica (pyproj), no una formula aproximada a mano.
- En cuanto termine, sigue el bloque de enlace local (RF/optico).

### 2026-11-14 ~12:43 - Irvin avanzo en paralelo (merge sin conflicto)
- Irvin subio una demo web completa ("Lunar Crystal"): explorador, comparador, mapa,
  linea de tiempo, grafica de horizonte, clasificador de enlace local RF/optico, HTML
  empaquetado sin internet, pruebas automatizadas. Ya publicada en GitHub Pages.
- El calibro el evento de polvo a 12s con Apollo por su cuenta - mismo numero al que
  llegamos por caminos distintos.
- Su README ya documenta el formato exacto para conectar LOLA skyline real (360 valores,
  1 grado, sentido horario, campo `elevacion_deg`). `git pull` + merge sin conflictos.

### 2026-11-14 ~12:55 - Horizonte real conectado + hallazgo corregido
- `scripts/horizonte.py` reescrito para escribir directo en `data/escenario_demo.json`,
  formato exacto que la demo de Irvin ya esperaba.
- **Hallazgo importante**: la coordenada original de Shackleton (89°40'S 129°47'E, de
  Wikipedia) resulto ser el centro/fondo del crater, no el borde - dio un horizonte de
  ~20 grados en todas direcciones, consistente con una zona permanentemente en sombra
  (PSR), no con un sitio de aterrizaje real. Shackleton tenia el mismo problema (fuente
  sin cita a paper real).
- Corregidos los dos con sitios de literatura academica peer-reviewed: "Peak Near
  Shackleton" (iopscience/LPSC, region candidata Artemis III) y sitio C1 de la cresta
  de Gerlache (Icarus 2024). Ver `sitios.json` para la cita completa de cada uno, con
  la salvedad honesta (R37) de que el numero exacto llego via resumen de busqueda, no
  via lectura directa del PDF (sciencedirect.com/agupubs dan 403 en esta sesion).
- Horizontes finales, ya comparables entre si: Shackleton -1.7 a 4.2 grados, de Gerlache
  -7.3 a 6.7, Malapert -8.5 a 1.0.
- Regla aplicada de aqui en adelante: nunca Wikipedia como fuente de un dato presentado
  como hecho en este proyecto; siempre la mejor fuente academica disponible.
