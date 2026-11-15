# Use of Super Intelligence (SI) — disclosure

Required field on the Space Apps submission form ("Use of Super Intelligence").
This is the honest, verifiable answer, grounded in `docs/bitacora.md` (this
project's append-only dev log) and the actual git history of this repo.

## Text to paste into the official form

> Yes, we used AI coding assistants (Anthropic Claude Code, OpenAI Codex, and
> ChatGPT) throughout development, as tools to accelerate implementation under
> our direction — not to originate the challenge solution itself. The core idea
> (comparing lunar south-pole landing sites by illumination, Earth communication,
> and a local backup link) is the team's own. AI assistance was used for: writing
> and debugging code (data scripts, the web app, tests), drafting and revising
> documentation, generating the illustrative (non-NASA-data) 3D mockups used only
> as visual aids, and translating/structuring text. All NASA-sourced data (JPL
> Horizons ephemerides, LOLA elevation data) was fetched and validated by the
> team, including a manual cross-check against the official JPL Horizons tool.
> No NASA logos, flags, or mission identifiers were AI-generated or altered. No
> code, data, text, image, or video in this project depicts, is based on, or
> includes the likeness of any person under 18.

## Where this is visible in the project (for judges, per the official rules:
## "judges will be able to see any SI-generated indicators... such as
## watermarks, descriptive text, or metadata")

- `docs/bitacora.md`: full append-only log of the project, with every AI-assisted
  step recorded as it happened (not reconstructed after the fact).
- Git history of this repo: several commits are directly co-authored by AI
  tools (e.g. `Co-Authored-By: Claude Opus 5.5`), left as-is rather than
  scrubbed.
- The two illustrative 3D mockups (`docs/mapeo-lunar-3d-ilustrativo.html`,
  `docs/mapa-lunar-comparador-3d-ilustrativo.html`) are explicitly labeled
  "VISTA ILUSTRATIVA — relieve sintetico, no DEM real" in their own interface,
  and their terrain is disclosed as AI-touched procedural generation, not NASA
  data, in `docs/fuentes.md`.
- README.md and `docs/fuentes.md` separate, for every number shown, what is
  real NASA data, what is a calculation derived from it, and what is a team
  assumption — the same standard applied regardless of whether a human or an
  AI tool produced the derivation.
