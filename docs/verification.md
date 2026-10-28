# Verification ledger

This ledger describes actual evidence, not intended coverage. See the reproducible commands below and preserved reports for limits.

## Browser checks observed

- Chromium desktop: title, game setup, research queue, fleet selection, turn resolution, all main panels, manual search, browser reload and autosave resume passed.
- Chromium 390×844: reduced-motion setting, setup and turn resolution passed; screenshot inspected. The UI remains operable with responsive panels.
- Chromium complete campaign: 60 turns from ordinary setup through the score ending passed without page errors.
- Actual GameHub, two independent browser contexts: create private room, claim an AI empire, submit simultaneous orders, advance both clients, close the host and continue as the promoted host passed. Both contexts closed after testing.
- Actual GameHub transport: 10 private-room protocol tests passed, including late join, snapshot-pressure recovery and non-host rejection. Details: `docs/gamehub-verification.md`.

Screenshots and failure traces are generated under ignored `tmp/qa/`, `test-results/` and `playwright-report/`.

## Balance and simulation

- Initial pre-roster research calibration: 84,224 reproducible experiments, documented confidence intervals and all 36 special pairs. Species were created only after that run.
- First actual-engine comparison: 576 games / 69,120 invariant-checked turns. This caught substantive balance and controller defects. It is diagnostic evidence, not a claim of finished balance.
- Production and controller regression tests cover discovered bugs. Current tests and subsequent reports supersede earlier measurements where engine behavior changes.
- Catalog: 11 offline tests passed against sourced astronomy data. Known planets, candidates and estimated values are distinguished.

## Final revision evidence

- Full production pricing: 576 games, 69,120 invariant-checked turns, 6,387 observed battles; unchanged mechanics/controller fingerprints during the run.
- Later explicit-light validation: 72 games, 8,640 checked turns, 749 battles. Photosynthetic stays at two points; the earlier full experiment is retained unchanged.
- All-species soak: 26 autonomous 120-turn campaigns, 3,120 checked turns. Every campaign reached a Score ending under the deliberate Defy-the-Concord policy.
- Current rule/controller/regression suite: 65 tests pass. Targeted cases cover the physical Approach, defense before landings, sparse twelve-seat regions, synthetic assembly costs, replay and human treaty consent.
- All 26 species pass calibrated budgets. Runtime media: 26 portraits, 26 identity motifs, two backgrounds, three music tracks and seven effects. Total confirmed cost USD 0.586505875.

## Reproduce

```sh
pnpm install --frozen-lockfile
pnpm check
python -m unittest discover -s packages/catalog/tests -v
pnpm soak -- --games=24
pnpm test:e2e
pnpm exec tsx tests/gamehub-live.ts
pnpm exec tsx packages/balance/src/production.ts --seeds 24
```

Live network tests require the project GameHub app key in `.env`; only private owned rooms are created. OpenRouter is unnecessary for playing, building and testing.

## Verification boundaries

Finite automated tests do not establish bug freedom, subjective fun, human exploit resistance or equivalent performance on every GPU. Listening to generated audio remains subjective human review. Public deployment is separate from a successful local production build and must be verified at its actual destination.
