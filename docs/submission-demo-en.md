# Official Project Demo - 7-slide deck (English)

For the Space Apps "Link to Project Demo" field. Hard limit: 7 slides including
title/intro, English only, hosted externally with a public link (see
`docs/submission-guide-resumen.md`). This is a SEPARATE asset from
`docs/guion-pitch-3min.md` (the 3-minute live pitch in Spanish for the Local
Event) - do not confuse the two.

Required content per the official guide, all covered below: team name, member
names, challenge selected, project image, user experience, how NASA/Space
Agency Partner data made the solution possible.

| # | Slide | Content | Source (verified in repo) |
|---|---|---|---|
| 1 | Title | "Lunar Landing Site Navigator" - Team buhospace - NASA Space Apps Challenge 2026 - Challenge: "Lunar Landing Site Navigator". | `README.md` header. |
| 2 | The problem | Near the lunar south pole, the Sun and Earth skim the horizon. A ridge only a few degrees high can decide whether a lander has power, direct Earth communication, both, or neither. | `README.md` research question. |
| 3 | Three real candidate sites | Peak Near Shackleton, the de Gerlache ridge, and Malapert massif - compared using real NASA data: JPL Horizons ephemerides and LOLA terrain. | `sitios.json`, citations in `README.md`/`docs/fuentes.md`. |
| 4 | The bug we found and fixed | Our first Shackleton coordinate pointed to the crater floor (permanently shadowed), not the rim candidate area. Fixed with peer-reviewed sources. We also found our 30 km horizon radius underestimated blocking; extended to 150 km (Shackleton +0.00 deg, de Gerlache +3.42 deg, Malapert +4.38 deg in the clearest direction). | `docs/fuentes.md` items 1-2 "RESUELTO 2026-11-14". |
| 5 | Validated against NASA's own tool | We checked our Sun/Earth ephemerides by hand against the official JPL Horizons tool: exact match to the sixth decimal place in azimuth and elevation, 8/8 comparisons. | `docs/fuentes.md` item 1: e.g. Sun 00:00 UTC az=153.798584 deg, el=0.588174 deg, matched. |
| 6 | Our differentiator + the convenience index | A local backup link (radiofrequency or optical) keeps a relay path alive when direct Earth visibility is lost. A team-proposed Suitability Index (S, 0-100) combines eight factors: sunlight, direct Earth view, backup link, longest night, longest blackout, terrain (slope and roughness, LOLA 20 m/px), approach clearance and distance to permanently shadowed regions. December 2026: Malapert 91.4, Peak Near Shackleton 54.8, De Gerlache ridge 48.8 (team assumptions, not a NASA standard). | `web/js/model.js` (`desgloseIndice`), `data/terreno_sitios.json`, `README.md`. |
| 7 | Live demo + closing | Real working comparator (screenshot), showing the Suitability Index per site for the selected period. Built with real NASA data, honest about what is measured vs. assumed. Team buhospace - thank you. | `docs/capturas/comparador-tabla-completa.jpg`. |

## Notes before recording/exporting

- Use the real screenshots in `docs/capturas/`, not the illustrative 3D mockups
  (`docs/mapeo-lunar-3d-ilustrativo.html`, `docs/mapa-lunar-comparador-3d-ilustrativo.html`)
  - those are labeled illustrative on purpose and would misrepresent the project
    if shown here without that label.
- Do not state a universal "winner" site as a NASA-certified result - the
  Suitability Index is a team-proposed score, and results depend on the
  comparison period (say so on slide 6 or 7 if a specific site is highlighted).
- After exporting (PDF or PPTX), upload to Google Drive or GitHub and set the
  link to public, no login required - test it in a private browser window
  before pasting it into the submission form.
