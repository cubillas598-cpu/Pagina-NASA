# Texto para la plataforma de Space Apps

Listo para copiar/pegar en los campos de la pagina del proyecto. El jurado es
internacional, asi que el resumen y el guion van en ingles; el resto del repo
(README, bitacora, fuentes) sigue en español.

## Resumen del proyecto (para el campo de descripcion)

Lunar Landing Site Navigator compares three real Artemis III candidate landing
sites near the lunar south pole (Peak Near Shackleton, the de Gerlache ridge,
and Malapert massif) by solar illumination and direct-to-Earth communication
windows, hour by hour, using real NASA data. Our differentiator is a local
backup link layer (radiofrequency or optical) that keeps a relay path alive
when direct line of sight to Earth is lost, plus a single Landing Site
Suitability Score (0-100) that combines illumination, direct communication,
and backup link availability into one comparable number per site. All
ephemeris data comes from the JPL Horizons API and all terrain/horizon data
from NASA LOLA, cross-checked by hand against the official JPL tool
(exact match to six decimal places).

## Datos y recursos usados (campo obligatorio de citas)

- NASA/JPL Solar System Dynamics, Horizons API (https://ssd.jpl.nasa.gov/horizons/)
- NASA GSFC PGDA, "A New View of the Lunar South Pole from LOLA", product 90
  (https://pgda.gsfc.nasa.gov/products/90), citing Barker et al. 2023,
  *Planetary Science Journal* 4, 183, DOI 10.3847/PSJ/acf3e1
- Landing site coordinates from peer-reviewed literature (Icarus 2024 for the
  de Gerlache ridge site; iopscience/LPSC for Peak Near Shackleton)

Full methodology, including what is real NASA data vs. derived calculation
vs. team assumption, is documented in `docs/fuentes.md` of this repository.

## Guion sugerido para video demo (30-60 segundos)

1. **El problema (5-8s)**: en el polo sur lunar, el Sol y la Tierra casi rozan
   el horizonte. Una cresta de pocos grados de altura decide si un lander tiene
   energia, comunicacion directa, las dos, o ninguna.
2. **El comparador en vivo (10-15s)**: mostrar los 3 sitios lado a lado, con
   el indice de conveniencia (S) resaltado, cambiando de fecha/periodo para
   ver como se mueven los numeros.
3. **La capa de enlace local (10-15s)**: activar el enlace de respaldo
   (RF u optico), mostrar como cambia el estado (rapido/robusto/sin enlace)
   y como el respaldo rescata horas de comunicacion que el enlace directo
   solo no cubriria.
4. **Cierre con la pregunta de investigacion (5-8s)**: repetir la pregunta
   ("que sitio ofrece la mejor combinacion de energia y comunicacion") y
   mostrar el sitio ganador segun el indice S.

## Trabajo original

Marcar "Confirm All Work is Original" al entregar. La licencia Apache 2.0 ya
esta puesta desde el primer commit del repositorio (`LICENSE`).
