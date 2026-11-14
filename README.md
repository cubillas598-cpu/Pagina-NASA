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

## Documentos

- `docs/plan.md` — plan por bloques horarios, roles, riesgos y orden de recorte
- `docs/propuesta.md` / `docs/propuesta.pdf` — propuesta completa: principio de
  funcionamiento, arquitectura, riesgos con mitigacion, banco de preguntas
  anticipadas

## Estado

- [x] Script de efemerides (Sol/Tierra por hora, JSON) para los 3 sitios candidatos
- [ ] Horizonte local por sitio
- [ ] Clasificador de enlace local
- [ ] Pagina web

## Sitios candidatos

Ver `sitios.json`. Shackleton (borde del crater), cresta Shackleton-de Gerlache,
y Malapert massif, los tres candidatos oficiales de Artemis III finalizados por
NASA en octubre de 2024.

## Licencia

Apache 2.0 (ver `LICENSE`).
