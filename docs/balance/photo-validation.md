# Photosynthetic — explicit light-profile validation

The original complete 576-game experiment is preserved unchanged in [production.json](production.json). After the engine added explicit planetary light profiles, this **72-game** focused replication repeated the same 24 paired map seeds and both treatment seats. It completed **8,640 invariant-checked turns and 749 battles**, with unchanged source throughout the run.

- Mean paired score change: **9.53%**; 95% seed interval **5.78% … 13.27%**.
- Actual treatment win fraction: 56.25%.
- Photosynthetic price: **2 points**, retained from 2. The existing integer is retained if it lies within the score interval mapped to whole point prices; otherwise the rounded-mean mapping applies.
- Runtime: 46.2 seconds.

## Source-revision boundary

Changed files relative to the full experiment: `engine.ts`, `generation.ts`, `rules.ts`, `species.ts`, `types.ts`, `balance/costs.ts`. Full SHA-256 fingerprints are recorded in [photo-validation.json](photo-validation.json). Planet light now comes from actual stellar illumination, including individual hosts in multiple-star systems, while homeworld Gardener infrastructure matches its native profile. Habitability, growth and upkeep therefore consistently use explicit Dim/Normal/Bright lighting rather than tidal locking.

This narrowly updates the Photosynthetic evidence. It does not relabel the earlier eight-special measurements as having been rerun against the new source. Frame/profile interactions and human exploitation remain outside the finite sample.
