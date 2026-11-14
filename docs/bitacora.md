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

### 2026-11-14 ~13:10 - Enlace local: horizonte real en el relevo
- El clasificador de enlace local (RF/optico) ya estaba completo, construido por Irvin
  en `web/js/model.js` (separacion angular Sol/linea de vista, evento de polvo, estados
  rapido/robusto/sin enlace, comparador, export CSV) - no se reconstruyo nada ahi.
- Lo unico pendiente era el horizonte del punto de apoyo (relevo), que seguia siendo
  sintetico. Extendido `scripts/horizonte.py` para calcular tambien el horizonte real
  del relevo (usa az/distancia que ya definio Irvin + geodesia para ubicarlo, mismo
  DEM de LOLA). Los 3 relevos ya tienen horizonte real conectado.
- Nota: la UBICACION del relevo (az/distancia desde el sitio) sigue siendo supuesto de
  demostracion de Irvin, no una cita academica - eso es correcto y ya esta declarado
  asi en el README, no se cambia.

### 2026-11-14 ~13:40 - Feedback externo validado + indice de conveniencia
- Una companera del equipo compartio un analisis de ChatGPT sobre un ZIP viejo del
  proyecto. Validado (SSS/S1, sin red flags de seguridad): la mayoria del analisis
  estaba desactualizado (no sabia del horizonte real ni de la demo de Irvin), pero
  trajo dos cosas que SI valian la pena: (1) recordar que `elev_km` sigue en 0 en
  `sitios.json` (sigue pendiente, afecta poco al angulo pero hay que decirlo), y
  (2) la idea de un Indice de conveniencia (Landing Site Suitability Score) que el
  comparador de Irvin no tenia (el suyo compara metrica por metrica, no da un numero
  unico combinado).
- Implementado `suitabilityScore` en `web/js/model.js`: S = 0.40*iluminacion +
  0.35*comunicacion directa + 0.25*enlace local (pesos editables, declarado
  explicitamente como propuesto por el equipo, no estandar de NASA). Visible en la
  tabla del comparador (fila destacada) y en el CSV exportado.
- 2 pruebas nuevas agregadas (formula exacta con y sin enlace activo). Suite completa:
  15/15 pasan.
- De paso, se genero la pregunta de investigacion del proyecto (pedida por el
  profesor/concurso), ya en el README: que sitio da la mejor combinacion de energia +
  comunicacion (directa y de respaldo), medido con este mismo indice.

### 2026-11-14 ~14:10 - Imagenes del proyecto + bug de etiqueta encontrado y corregido
- Irvin mando una imagen real (orbital, con los craters Shackleton/de Gerlache/
  Shoemaker etiquetados) - guardada en `docs/imagenes/`. Estilo consistente con
  mosaicos NASA/GSFC/ASU (LROC); no se confirmo la URL exacta del original (llego
  por WhatsApp) - queda marcado `[PENDIENTE R37]` para buscar la fuente precisa
  antes de la entrega final.
- **Bug encontrado al intentar tomar capturas**: el selector "Horizonte" de la demo
  decia "Perfil sintetico" pero el codigo de Irvin (`calcularSerie`) lee directo
  `sitio.horizonte.elevacion_deg` sin revisar el campo `fuente` - o sea que desde que
  se conecto el horizonte real de LOLA, esa opcion YA mostraba datos reales bajo una
  etiqueta que decia "sintetico". Corregido: la opcion ahora dice "Perfil del terreno
  (LOLA)" en `web/index.html`, `web/js/views/estilos.js`, y el parrafo de metodologia
  que daba instrucciones ya viejas de "como conectar LOLA" se actualizo para reflejar
  que ya esta conectado. 15/15 pruebas siguen pasando.
- Tambien se encontro que GitHub Pages NO esta realmente activa pese a que el README
  decia "publicada" (el dominio no resuelve, timeout). `[PENDIENTE]`: activarla en
  Settings > Pages del repo (accion de cuenta de Irvin o Pablo).
- Capturas reales de la demo corriendo en servidor local (no mockups) guardadas en
  `docs/capturas/`: explorador con Sitio A, y comparador con el indice de conveniencia
  ya funcionando (Malapert 87.9, de Gerlache 56.4, Shackleton 55.2 - Malapert da 97.9%
  iluminacion y 100% vista a Tierra, coincide con su fama de "pico casi-permanentemente
  iluminado" en la literatura, buena senal cruzada de que el calculo esta bien).

### 2026-11-14 ~14:25 - Rediseño visual de Irvin + merge
- Irvin hizo en paralelo un rediseno visual completo de la demo (referencia Behance,
  tipografia Poppins, nueva navegacion lateral, nuevas vistas Resumen/Sitios/Comparador/
  Enlace local/Metodologia) y de paso corrigio el MISMO bug de la etiqueta "sintetico"
  que se encontro arriba - su arreglo es mas completo: renombro la clave interna
  (`modoHorizonte: 'sintetico'` -> `'perfil'`), no solo el texto visible.
- Merge con conflictos en `web/index.html` y `web/js/views/estilos.js` (los dos
  arreglamos el mismo selector por caminos distintos). Resuelto tomando la version de
  Irvin completa en esos dos archivos - su rediseno reemplaza la estructura vieja que
  yo estaba editando. El indice de conveniencia (`suitabilityScore`) y sus 2 pruebas
  sobrevivieron el merge automatico sin tocar nada. Suite completa tras el merge:
  17/17 pasan (15 propias + 2 nuevas de Irvin sobre disponibilidad combinada).

### 2026-11-14 ~14:40 - Pendiente resuelto: sensibilidad del horizonte al radio
- Irvin ya habia dejado documentado en `docs/fuentes.md` que el corte a 30km podia
  omitir relieve mas lejano, sobre todo en Malapert. Medido con
  `scripts/sensibilidad_horizonte.py` (nuevo, no escribe nada, solo compara): a 30,
  100 y 150 km, sin huecos de cobertura del DEM en ningun caso.
- Resultado real: la direccion mas despejada de cada sitio empeora con mas radio -
  Shackleton +0.00 grados, de Gerlache +3.42, Malapert +4.38. Confirma que 30km
  subestimaba el bloqueo, sobre todo en los dos sitios que mas dependen de tener
  una buena direccion despejada.
- Regenerados los datos reales de produccion con radio de 150km (mismo script,
  `scripts/horizonte.py`, solo cambio la constante). 22/22 pruebas siguen pasando
  (son con datos fijos de prueba, no dependen del radio de produccion).
- Pendientes que quedan: validar efemerides contra JPL visual (siguiente paso), y
  activar GitHub Pages (accion de cuenta, no ejecutable desde aqui).

### 2026-11-14 ~14:55 - Pendiente resuelto: efemerides validadas contra JPL
- Cotejado a mano en https://ssd.jpl.nasa.gov/horizons/app.html: Peak Near Shackleton,
  4 horas (1-dic-2026 00:00 a 03:00 UTC), Sol y Tierra por separado.
- Coincidencia EXACTA a 6 decimales en azimut y elevacion, las 8 comparaciones (4
  horas x 2 cuerpos). Ejemplo: Sol 00:00 UTC -> az=153.798584, el=0.588174 en ambas
  fuentes; Tierra 00:00 UTC -> az=240.420213, el=-2.095542 en ambas.
- Los 3 pendientes que bloqueaban conclusiones (segun docs/fuentes.md) estan resueltos:
  efemerides validadas, radio de horizonte corregido a 150km, falta solo activar
  GitHub Pages (accion de cuenta).
