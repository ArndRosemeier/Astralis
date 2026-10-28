# Version 0.002: building promises checked against simulation behaviour

Post-publication review identified building descriptions whose complete effects were not bound to the simulation. They were corrected before the 0.002 upgrade validation. The following behavioural regressions verify the literal player-facing promises rather than merely checking that the building name exists.

Run `pnpm exec tsx --test packages/balance/test/building-bindings.test.ts`.

| Building | Observed check |
|---|---|
| Robotic Factory | Industry increases by one per industry worker **plus three flat**, with the normal modifier pool. |
| AI Lab | Research increases by one per scientist **plus three flat**, including the reference government's research modifier. |
| Space Elevator | Industry receives its additional ten-percent bonus. |
| Militia Barracks | Construction creates four garrison units; a subsequently built troop transport starts trained. |
| Intelligence Bureau | Construction adds an agent; non-capital construction is rejected; 512 paired deterministic espionage fixtures observe improved actual success, not only an unused metadata field. |
| Planetary Deflector | An isolated bombardment after orbital control reduces garrison damage by half. |
| Media Network | The war-related stability loss is halved independently of the building's flat stability bonus. |
| Quantum Research Centre | A second centre in the same system is rejected, while a centre in a different system remains eligible. |

All ten tests passed before the upgrade campaign batch. The existing source-revision-specific 576-game full experiment and 72-game lighting correction remain unchanged. The separate twelve-seed full-special upgrade validation checks whether active prices remain compatible after uniform economy/defense fixes; it does not silently reinterpret the larger earlier experiments as having run on the new code.

Additional 0.002 literal-effect corrections owned and tested by the main implementation include shared fleet travel speed and speed caps, outpost deposit delivery and upkeep, trade income bases and Commerce Exchange bonuses, and shared purchase-price calculation. They are covered by the complete simulation fingerprint in the upgrade evidence rather than being omitted from the version boundary.
