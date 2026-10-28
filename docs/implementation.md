# Astralis implementation decisions

The accepted design in `docs/design.md` is the source of game rules. This file records added decisions and verification limits, rather than silently changing the design.

- D42: Implementation authorized 2026-10-28. TypeScript, React, Three.js; desktop-first responsive browser application. English throughout. Existing GitHub repository and GameHub hosting infrastructure retained.
- D43: Art direction: **Celestial Instruments**. Midnight ink, parchment-white typography, sea-glass teal, warm amber, rounded asymmetric instrument panels, scientific diagrams, restrained playful motion. Display/navigation typography is science-fiction; paragraph text prioritizes legibility. Motion and sound remain independently switchable.
- D44: OpenRouter calls are build-time only. No OpenRouter credential is exposed to browser code. Total authorized asset budget USD 50, including the USD 0.01 Muse connection test. Costs, prompts and model IDs are recorded beside assets.
- D45: Specials calibration precedes the species roster. Initial compact research experiments estimate prices; full-engine paired-seed calibration subsequently verifies them. These levels of evidence must not be conflated.
- D46: GameHub is a relay, not persistent storage. Local autosaves plus JSON export/import preserve games. Multiplayer uses host-authoritative simultaneous turn orders, versioned snapshots and seat tokens. Every browser game ships its GameHub app key, as required by the provider; this key is unrelated to the private OpenRouter API key.
- D47: Numeric simulation uses seeded integer RNG, quantization at state boundaries and a deterministic math facade. Native trigonometry is reserved for rendering. Replay/engine checks are required; cross-browser claims require actual browser evidence.
- D48: Keyboard-accessible panels, visible focus, reduced-motion support, adjustable UI scale, color plus icon/text signals. Optional onboarding and contextual hints are separately switchable and can be restored from settings. The manual is searchable and derived from shared rules data where feasible.

## Additional implementation decisions

- D49: Hive mind and Subterranean are mutually exclusive. A significant production-game interaction supported this constraint; see `docs/balance/decision-D49.md`.
- D50: Synthetic colonies allocate industry to population assembly (default 40%). That industry is unavailable for construction. Nomad capitals travel as habitat convoys; other origins change actual starting state.
- D51: Planet light is explicit and derived from host-star data. The Gardener starter habitat supplies preferred illumination at home; later worlds have natural light. This bootstrap exception does not alter the real host star.
- D52: Random regions deterministically retry sparse observed areas and fall back to a dense observed neighbourhood. No real star positions are invented. Map counts use actual catalogue radii.
- D53: Archive Keys transfer with captured capitals; friendly empires may negotiate one for 100 credits. Split keys therefore remain recoverable.
- D54: The Approach and Custodian reprisals are physical fleets using ordinary movement and battle resolution.
- D55: Human treaties require consent; contact components determine Concord membership. Allied Conquest is supported. Portable saves remember their commander's seat.
- D56: GameHub snapshots use gzip, revisions and a checked transport limit. Optional timers use wall-clock time solely in the transport layer. Disconnected seats remain token-reserved and use temporary AI after 60 seconds.
- D57: Build 0.002 binds the full stated building effects, shares actual travel speed and purchase-price calculations with the UI, delivers outpost deposits to the best-linked colony and calculates treaties from commerce. Manual orders are applied before automation inspects the state. These changes have a separate production validation rather than inheriting earlier balance evidence. Build numbers are checked against immutable player-facing changelog entries during every production build.

The final 26-species roster follows the production pricing decisions and passes the same point validation as custom species. Corundi was revised to a legal crystalline/industrial build. Content includes 145 initial research projects plus six repeatables, 22 constructible buildings plus two starting Gardener structures, and 64 verified media assets.

## Completion evidence

Record actual checks and remaining gaps in `docs/verification.md`. No feature counts as tested solely because code exists. Public deployment requires verified hosting access and is recorded separately from a local production build.
