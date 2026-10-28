# Permanent twilight â€” build 0.014

Three original surface studies were created with the built-in ImageGen tool on 28 October 2026. Full prompts and generation mode are preserved in [the asset record](assets/tidal-art-prompts.json). Runtime files are `public/assets/planets/tidal-ocean.png`, `tidal-frost.png` and `tidal-rock.png`; they are served locally with no runtime generation or private key.

The illustrations are climate archetypes, not telescope observations or exact maps. A presentation-only classifier selects frozen terrain below 220 K or for ice worlds; a water-bearing study for rocky worlds at 220â€“380 K with water above 0.15 and atmosphere above 0.05; otherwise a rocky study. Gas giants, belts and artificial habitats retain their existing portraits. These thresholds do not change gameplay or planet statistics. The frozen/coastal imagery is illustrative: permanent darkness alone does not establish ice or habitability.

The dossier offers Surface and Orbit modes, a fixed-orientation 3D inset, permanent lighting-zone labels, climate-specific explanation and an expandable, keyboard-dismissable art view. Locked globes no longer spin through independent sunrises; the system overview rotates them synchronously as they orbit. Water, pressure and temperature affect their stylized surface shading; dense atmospheres soften the illustrated cold-side contrast. Ordinary rotating worlds keep their existing presentation. Reduced motion remains supported.

Scientific grounding: a synchronously rotating planet keeps the same hemisphere facing its star ([NASA](https://science.nasa.gov/universe/exoplanets/discovery-alert-earth-sized-planet-has-a-lava-hemisphere/)). Atmospheric circulation can redistribute heat between the hemispheres; neither a frozen night side nor a habitable terminator is universal ([Hammond & Lewis, PNAS 2021](https://pmc.ncbi.nlm.nih.gov/articles/PMC8020661/)). The UI deliberately avoids inventing local measured temperatures.

The accompanying course-planning refinement uses the existing `shipMoveError` result for the complete selected ship group. Unreachable star glows, white cores and labels fade together; reachable labels gain a brighter outline and a legend explains the contrast. No travel rules change. Deselecting ships restores the normal map, and unavailable systems remain clickable so existing order feedback remains available.

Saves from build 0.013 remain loadable because these changes alter presentation, not saved mechanics. Earlier supported 0.010â€“0.012 saves are still accepted.

## Observed validation

`pnpm check` passed: TypeScript, 120 automated tests and the version-checked production build. The new planet browser test passed for all three climate portraits, Surface/Orbit switching, full-size image loading, Escape/close controls, a 390 px mobile gallery, ordinary planets and no browser errors. The direct-star click test passed. Eight related browser scenarios passed together: desktop/game saves, phone layout, achievement scenes, reduced motion, WebGL fallback and ship selection/orders. The ship test also checks low-opacity unavailable labels and star-core render values, then their restoration after deselection. Desktop art, globe, mobile and ship-selection screenshots were visually inspected under `tmp/qa/`. Existing 0.012 and 0.013 save upgrade tests pass.
