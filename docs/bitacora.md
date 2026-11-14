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
