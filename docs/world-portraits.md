# A complete world portrait system — build 0.015

Every revealed world uses the same viewer: an illustrated scene, Orbit, and an expand control. The first tab is named for its subject: Surface for rocky, ocean and ice worlds; Atmosphere for gas giants; Habitat for artificial habitats; Belt for asteroid belts. Lock status affects lighting and interpretation, never control availability. View choice persists while switching worlds.

The selector covers every member of the `Planet.kind` type with an exhaustive TypeScript record. This prevents a new world kind from silently missing its viewer. The existing observer-filtered system data remains the source of which worlds are revealed.

## Original artwork

Created using the built-in ImageGen tool. Exact prompts: [world-art-prompts.json](assets/world-art-prompts.json). The source PNGs are shipped unchanged; a separate contact sheet under ignored `tmp/qa/` is only for visual review.

| Scene | Runtime asset |
|---|---|
| Temperate coast | [world-temperate.png](../public/assets/planets/world-temperate.png) |
| Open ocean | [world-ocean.png](../public/assets/planets/world-ocean.png) |
| Ice world | [world-frozen.png](../public/assets/planets/world-frozen.png) |
| Desert | [world-desert.png](../public/assets/planets/world-desert.png) |
| Airless terrain | [world-airless.png](../public/assets/planets/world-airless.png) |
| Dense hot atmosphere | [world-clouded.png](../public/assets/planets/world-clouded.png) |
| Volcanic terrain | [world-volcanic.png](../public/assets/planets/world-volcanic.png) |
| Gas giant atmosphere | [world-gas.png](../public/assets/planets/world-gas.png) |
| Artificial habitat | [world-habitat.png](../public/assets/planets/world-habitat.png) |
| Asteroid belt | [world-belt.png](../public/assets/planets/world-belt.png) |

The three previously generated tidal studies remain available, including for the previously omitted ocean type. Exceptionally hot, dense-atmosphere or airless rocky worlds use their own geology even when star-locked. These are shared artistic interpretations selected from game conditions, not unique measured maps of each world. No runtime generation or private API key is needed, and the historical OpenRouter cost ledger is unaffected.

## Presentation rules and safeguards

World kind is evaluated first for gas, habitat and belt scenes. Solid worlds then use these presentation priorities: extreme heat (900 K or above), dense hot atmosphere (pressure at least 10 and temperature above 380 K), frozen kind or temperature below 220 K, negligible atmosphere (pressure at most 0.05), ocean kind or water at least 0.85, other water-bearing worlds at up to 380 K, then arid terrain. These thresholds are art direction; they do not calculate habitability or modify simulation state. Temperate coast vegetation is reserved for the Oxygen chemistry archetype.

Habitat and belt orbital portraits use ring architecture and scattered irregular rocks respectively, with corresponding fallbacks when WebGL is unavailable. Airless globes omit clouds and atmospheric glow. The shared controls retain keyboard access, Escape dismissal, focus restoration and reduced-motion behavior. Existing 0.014 campaigns remain compatible.

## Validation

`pnpm check` passes TypeScript, all 123 unit tests, the 15-entry version check and the production build. Browser coverage exercises 13 world conditions together in one explored system, both portrait modes, loaded artwork, expanded views, Escape dismissal and focus restoration. Mobile checks at 390 × 844 disable WebGL and verify fallback portraits and continued turn progression. The existing tidal-world browser scenario and all four achievement/replay scenarios also pass. The ten original illustrations, habitat and belt orbital models, expanded gas-giant study and mobile layout were visually reviewed.
