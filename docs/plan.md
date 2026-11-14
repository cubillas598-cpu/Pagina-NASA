# Plan Space Apps 2026 — Lunar Landing Site Navigator + enlace local (RF/óptico)

14 de noviembre de 2026

## Resumen

Vamos al reto **Lunar Landing Site Navigator**: una herramienta web que compara sitios y fechas en el polo sur lunar, mostrando dónde están el Sol y la Tierra sobre el horizonte para evaluar energía y ventanas de comunicación con la Tierra. Lo que nos distingue es una capa extra: el estado de un **enlace local** (RF u óptico, seleccionable) entre el lander y un punto con vista a la Tierra.

La entrega cierra el **domingo 15 de noviembre a las 23:59, hora local**. La meta interna es tenerla enviada a las **20:00**.

## Reto confirmado y recursos

"Lunar Landing Site Navigator" es un reto oficial 2026 con URL propia en spaceappschallenge.org — **distinto** de "CLPS Lunar Mission Browser" (otro reto, el que investigamos por error el 14-oct). Enunciado real: comparar sitios de aterrizaje del polo sur por fecha, viendo posición Sol/Tierra sobre el horizonte para energía y ventanas de comunicación directa a Tierra, y comparar contra coordenadas históricas reales de aterrizaje (Apollo, IM-1/2/3, Blue Ghost) si da tiempo.

Recursos oficiales verificados:
- **JPL Horizons** — posiciones Sol/Tierra
- **LOLA terreno** (~150MB) — relieve crudo
- **LOLA skyline** — panel de horizonte 360° **ya precalculado por sitio**. Usar este primero; solo derivar del DEM crudo si no cubre los 3 sitios elegidos.

Varios equipos ya atacan este mismo reto este año con la base obligatoria (normal, no afecta originalidad). No se encontró ningún equipo con capa de enlace local (RF u óptico) como diferenciador — se ve original.

## Reglas que hay que cuidar

- **Atender el reto directamente.** La solución tiene que responder a un reto oficial de 2026 ([términos 2026](https://www.spaceappschallenge.org/legal/)).
- **Trabajo original.** Al entregar hay que marcar "Confirm All Work is Original" ([guía de entrega](https://www.spaceappschallenge.org/resources/project-submission-guide/)).
- **Citar todo.** NASA puede retirar premios a los equipos que no citen los recursos que usaron, incluso los de código abierto ([términos 2026](https://www.spaceappschallenge.org/legal/)).
- **Licencia abierta.** En los términos de 2025, si no eliges una licencia OSI, NASA distribuye el contenido bajo Apache 2.0. Pongan una licencia desde el primer commit.

## Capa de enlace local — RF y óptico, cada uno con precedente real

Mismo clasificador de 3 estados (rápido / robusto / sin enlace), tipo de enlace seleccionable:

- **RF**: hay cráteres del polo sur sin vista directa a la Tierra aunque un punto alto cercano cerca sí la tenga — precedente real: concepto de relevo **LunaNet / Lunar Communications Relay** de NASA.
- **Óptico**: el penacho de aterrizaje levanta polvo que degrada la línea de vista óptica (estudiado desde Apollo, "horizon glow") — precedente real: láser **O2O de Artemis II**.

Costo de hacer los dos tipos: ~15 min extra sobre hacer solo uno (un flag + dos párrafos de cita en el README). No cambia cronograma ni arquitectura.

## Sobre reusar el proyecto EVA (AI-SED)

Decisión de Pablo (14-nov): el riesgo de patente de EVA no bloquea esto — ve probable no cumplir el plazo del 25-nov de todos modos. Lo que sí sigue aplicando es la razón **técnica**: el modelo entrenado de EVA clasifica BER real medido con fotodiodo contra datos de una cámara de humo; aquí no hay sensor físico, solo ángulo Sol-Tierra calculado y un evento de polvo sintético — el modelo entrenado no tiene qué clasificar en este dominio, portarlo literal no ahorra tiempo. Se reusa el **patrón** (clasificador de 3 estados), con reglas escritas nuevas para este dominio.

**Pendiente, no bloqueante**: avisar al chat del equipo BRISK (Gabriel, Eva —autora original de la idea de EVA—, Ervey, asesor) que se reusa el patrón en otro concurso. Es su proyecto también.

## Alcance y arquitectura

Primero va lo obligatorio del reto; la capa de enlace local entra solo cuando lo obligatorio ya funciona.

| Pieza | Qué hace | Prioridad |
| --- | --- | --- |
| Efemérides | Elevación y azimut del Sol y de la Tierra, hora por hora, para un sitio y un rango de fechas | Obligatoria |
| Horizonte local | Perfil de horizonte por azimut — usar LOLA skyline (ya precalculado); si no cubre un sitio, horizonte plano y se dice en el README | Obligatoria (versión simple) |
| Energía y comunicación | Horas con Sol visible y ventanas con la Tierra sobre el horizonte, por sitio | Obligatoria |
| Comparador de sitios | 3 sitios candidatos lado a lado, con las mismas fechas | Obligatoria |
| Enlace local (RF/óptico) | Por hora: clasifica el enlace en rápido/robusto/sin enlace, según tipo elegido (RF: vista a relevo: óptico: ángulo Sol + evento de polvo) | Extra |
| Web | Página estática que lee JSON precalculado; línea de tiempo con tres franjas: energía, Tierra y enlace local | Obligatoria |

**Flujo:** scripts de Python calculan todo y escriben JSON, y la página estática en GitHub Pages lo dibuja. Así el demo no depende de un servidor durante el juicio.

## Plan por bloques

Roles: **P1** datos y cálculo, **P2** horizonte y enlace local, **P3** web, demo y entrega. Asignen nombres en el kickoff.

### Sábado 11:00–12:00 · Kickoff (todos)

- [ ] Leer el enunciado completo del reto y su pestaña de recursos (confirmar lo de arriba contra la página real)
- [ ] Elegir 3 sitios candidatos del polo sur y un rango de fechas (por ejemplo, 30 días)
- [ ] Crear el repo nuevo y público, con licencia y README mínimo
- [ ] Registrar el equipo y elegir el reto en la página de Space Apps

### Sábado 12:00–16:00 · Piezas por separado

- [ ] P1: script de efemérides que guarda elevación y azimut del Sol y la Tierra por hora, en JSON
- [ ] P1: comprobar un sitio a mano contra la herramienta de JPL antes de seguir
- [ ] P2: perfil de horizonte por azimut para los 3 sitios usando LOLA skyline; si algún sitio no está cubierto, horizonte plano ahí y decirlo en el README
- [ ] P3: página estática con selector de sitio y línea de tiempo, con datos de prueba

### Sábado 16:00–20:00 · Integrar lo obligatorio

- [ ] P1 + P2: horas de Sol visible y ventanas con la Tierra, ya con el horizonte
- [ ] P3: conectar la página al JSON real y publicarla en GitHub Pages
- [ ] Todos: la versión mínima ya se puede entregar; hacer commit y guardar borrador en Space Apps

### Sábado 20:00–24:00 · Enlace local (RF/óptico)

- [ ] P2: reglas simples por hora para los dos tipos — RF (vista a punto de relevo) y óptico (ángulo Sol + evento de polvo) — que dan modo rápido/robusto/sin enlace
- [ ] P3: tercera franja en la línea de tiempo, con selector de tipo de enlace

### Domingo 09:00–13:00 · Pulir

- [ ] Comparador de 3 sitios lado a lado
- [ ] Revisar que los números tengan sentido; anotar en el README lo que se simplificó
- [ ] Probar la página en celular y en otra computadora

### Domingo 13:00–18:00 · Entrega

- [ ] README con fuentes citadas (JPL Horizons, LOLA, LunaNet, Artemis II O2O), licencia y cómo reproducir
- [ ] Demo según el formato que pide la guía de entrega
- [ ] Llenar la página del proyecto en Space Apps

### Domingo 18:00–20:00 · Enviar

- [ ] Enviar a juicio a las 20:00 a más tardar; después solo arreglos menores

## Riesgos y qué recortar

| Riesgo | Señal | Qué hacer |
| --- | --- | --- |
| LOLA skyline no cubre algún sitio elegido | A las 15:00 falta su perfil de horizonte | Horizonte plano para ese sitio y decirlo en el README |
| Las efemérides para un punto en la Luna no salen bien | Los números no coinciden con la herramienta de JPL | Pedir ayuda en el canal del reto antes de las 14:00 |
| El enlace local (RF/óptico) no se termina | El sábado a las 24:00 no hay tercera franja | Dejarlo como concepto en el README y una imagen; con uno de los dos tipos basta, no hacen falta los dos |
| El juicio no puede abrir el demo | GitHub Pages falla o la página tarda | Video del demo y capturas en la página del proyecto |
| Se entrega tarde | El domingo a las 18:00 aún falta la página del proyecto | Enviar lo que haya; la versión mínima del sábado ya cumple |

Orden de recorte si falta tiempo: primero el segundo tipo de enlace local (quedarse con uno solo), luego el enlace local completo, luego el horizonte real, luego el comparador. La línea de tiempo de Sol y Tierra no se recorta.
