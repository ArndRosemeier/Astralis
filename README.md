# Astralis · Beyond the Veil

A TypeScript 4X game among real nearby stars. Explore a three-dimensional map, establish colonies suited to your biology, research technology, design fleets and prepare the strategies that fight your battles.

**Build 0.001 · English interface · 26 species · single-player and private GameHub multiplayer.**

## Play

Requires Node.js 24 and pnpm 11.24 or compatible.

```sh
pnpm install --frozen-lockfile
pnpm dev
```

Open `http://127.0.0.1:5173`. No private API credential is needed to play. The owner-private hosting destination is [Astralis](https://astralis-beyond-the-veil.humperding.chatgpt.site).

`pnpm build` creates portable static files in `dist/`; `pnpm preview` serves that build. Subdirectory hosting is supported. GameHub remains at `games.futuremagic.de`.

## First expedition

1. Choose a species, map and seed.
2. Queue **Improved Fusion** for faster travel or **Interferometry** for better surveys.
3. Open **Fleets**, select the Pioneer and **Chart course**. Choose a star and **Plot course**.
4. On arrival, inspect a suitable world and **Establish colony**.
5. Manage colony construction, then **End turn**. The report explains what changed.

The searchable **Field manual** is available on the title screen and in-game. Guidance, hints, motion and sound are independently configurable. Keyboard: `F` flatten, `Home` recenter, `R` research, `E` empire, `?` manual, `Escape` close, `Ctrl+Z` undo a queued order.

## Systems

- 343 sourced nearby systems with actual 3D positions; confirmed exoplanets, seeded unknown worlds and a lazy 100 pc catalogue for random regions.
- Carbon, Lithic and Synthetic biology; species-specific habitability, governments, origins, economy, terraforming and habitats.
- Six eight-tier research fields, alternative-pick rules, six repeatables and Gardener artifacts.
- Ship design, doctrines, ordered strategy rules, a test range, deterministic 3D battles, planetary defenses and replay controls.
- Diplomacy, human proposal acceptance, trade/research agreements, intelligence, leaders and the population-weighted Concord.
- Invasion, bombardment, captured populations, mobile nomad capitals, impactors and Custodian reprisals.
- Conquest, Allied Conquest, Concord, Legacy, Score and the physical Approach fleet.
- Autosaves, manual saves, portable exports, record replay and multiplayer with seat recovery, host migration, chat and optional timers.
- Original art, portraits, ambient music, effects and identity motifs in the **Celestial Instruments** style.

## Online play and saves

Create a private room and share its six-character code. Friends take an unclaimed AI seat. The turn resolves after connected commanders submit their orders. Hosts may enable a timer; a disconnected seat is token-reserved and temporarily uses AI after a minute.

GameHub is an in-memory relay. Export before the last player leaves if you want a portable backup. Browser-local autosaves are independent of rooms. GameHub app keys identify a public browser game and are unrelated to private OpenRouter credentials.

## Verification

```sh
pnpm check
pnpm test:e2e
pnpm soak -- --games=26
python -m unittest discover -s packages/catalog/tests -v
pnpm exec tsx tests/gamehub-live.ts
```

See [the verification ledger](docs/verification.md). Browser checks cover normal play, a complete campaign, mobile controls, saving/resuming, live two-client multiplayer and matching Node/Chromium/Firefox hashes.

Special pricing precedes the roster: 84,224 initial research experiments, followed by 576 production games and a separate 72-game light-profile validation. [Final prices](docs/balance/final-prices.md) preserve confidence intervals and limitations. Finite samples do not prove perfect balance for every human strategy.

## Layout and credits

| Path | Purpose |
|---|---|
| `packages/sim` | Pure deterministic state, rules, commands, generation and battles |
| `packages/ai` | Rival and player-automation controllers |
| `packages/catalog` | Offline source pipeline, curated astronomy data and attribution |
| `packages/balance` | Reproducible pricing and production validation |
| `apps/web` | React/Three.js application and GameHub sessions |
| `apps/cli` | Headless campaign/soak tools |
| `public/assets` | Runtime media and local fonts |
| `docs` | Specification, decisions, QA, balance and provenance |

OpenRouter is authoring-only. Keep its key in ignored `.env` as `OPENROUTER_API_KEY` or `OPEN_ROUTER_KEY`; never prefix it with `VITE_`. The game makes no OpenRouter calls.

[Asset provenance](docs/assets/README.md) records prompts, resolved models, costs and decode checks. Confirmed spend: **USD 0.586505875 / 50**. Astronomy sources and data licences are in [catalog credits](docs/catalog/LICENSE-DATA.md). Oxanium and Space Grotesk are bundled under the SIL Open Font License.
