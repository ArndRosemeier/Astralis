# Astronomy implementation decisions

Built 28 October 2026 from pinned downloaded snapshots (SHA-256 in `packages/catalog/sources.json`). All positions are observations, rotated into Galactic Cartesian coordinates. No random positions are described as real stars.

## Data coverage

The compact catalogue contains **343 systems within 32 light-years**, including **85 multiple systems** and **76 systems with catalogued brown-dwarf components**. Actual Sol-centred counts are **44 / 101 / 163 / 343** within **15 / 20 / 25 / 32 ly**. These replace the draft approximations 35 / 75 / 140 / 300 in design.md for implementation and setup labels.

The wider catalogue contains **27,506 systems out to 100pc**. It combines HYG with the denser CNS5 region and additional NASA planet hosts. It is suitable for real random-region maps but **not volume-complete out to 100pc**; HYG misses faint objects farther from Sol. CNS5 substantially improves the first25pc. A future Gaia GCNS full import can improve outer-region completeness without changing the public schema.

The compact planet file has **124 confirmed planets including the eight Solar System planets**, plus **one separately flagged candidate** (Proxima Cen c). The extended file has **1,616 confirmed planets**, plus that candidate. Confirmed status follows the NASA snapshot, with its independent controversial flag preserved. In particular, the draft's blanket description of Tau Ceti planets as candidates is outdated: g/h/f are archive-confirmed but controversial; e is marked a false positive by NASA and is deliberately absent.

## Grouping and physical estimates

- Within10pc, the vetted Reylé et al. sample supplies multiple-system grouping, named stellar components, brown dwarfs and white dwarfs. CNS5-updated extends the dense neighbourhood and supplies newer identifiers.
- HIP/HD/GJ aliases are reconciled across sources, with component suffixes collapsed only for a GJ *system* identity. Restricted positional matching handles changed parallaxes and proper-motion epochs. The validation gate rejects near-duplicate systems in the compact sample.
- Alpha Centauri A/B/Proxima are one gameplay system. Its global fields describe A. Proxima's measured stellar properties remain on its own component; its planets carry `hostLuminosity` and `hostMass`. A planet's thermal/orbital estimate never uses the wrong component's luminosity.
- HYG luminosity is derived from V-band magnitude. The build applies a dwarf-sequence bolometric correction before using it as a heating proxy. Missing stellar masses/temperatures and missing luminosities use the Pecaut–Mamajek spectral calibration, explicitly flagged as estimates. Evolved objects with incomplete data have coarse model estimates, also flagged.
- Missing planet radius or mass uses a named coarse piecewise power-law estimate; missing semi-major axis uses Kepler's relation with the measured host mass; missing equilibrium temperature uses278K × L^0.25 / sqrt(AU). These are game-support estimates, not publication-grade physical inferences.
- Observation depth (`deep`, `moderate`, `shallow`) is a **gameplay heuristic** from distance and spectral type, not a quantified survey completeness measurement. Detailed per-system detection-limit inference is outside this catalogue's evidence.
- Proxima c's seeded existence prior is0.5, a transparent game-design choice. Its candidate status and published radial-velocity solution come from the NASA overview / Damasso et al. (2020). No published posterior probability is claimed.

## Reproduction and tests

See `packages/catalog/README.md`. The catalogue tests verify uniqueness, finite measured coordinates and units, full region counts, grouped Alpha Centauri without Proxima overwrites, Solar planets, candidate separation, provenance hashes and the lazy wider dataset's bounds. Their results are recorded by the root quality gate.

## Attribution

Scientific and data-source attribution is maintained in `packages/catalog/LICENSE-DATA.md`. Derived catalogue JSON is CC BY-SA4.0; this does not apply that licence to the game code.
