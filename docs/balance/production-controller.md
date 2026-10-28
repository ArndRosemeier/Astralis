# Production AI used for calibration

`packages/ai/src/controller.ts` exports the actual in-game `productionOrders(game, empireId)` controller. The engine calls the same controller for AI opponents and for each enabled human automation area. The balance tournament invokes `processTurn` with that controller active; it no longer adds its own allocation orders.

The controller is deterministic and does not mutate state. Stable ASCII comparisons break ties; varied ship doctrines use the existing seeded hash. It emits validated game commands and uses the same costs, habitability, queue rules and supply checks as the interface. There are no extra resources, instant research or invisible movement grants.

## Competence added after the first production experiment

- **Administration:** prioritize laws, morale buildings, administrative research and constitutional reform when near the limit. Lower taxes and recruit a governor where the treasury supports it. Estimate a new colony's morale before committing to another settlement. This prevents ordinary empires from mindlessly growing into empire-wide disorder while Hive remains immune.
- **Economy:** select growth for small biological colonies, personality-appropriate output focuses, commerce during treasury stress and industry for Synthetic population assembly. Build productivity infrastructure before mass fleet spending. Keep cash reserves and buy important stalled infrastructure when affordable.
- **Terraforming:** evaluate the actual capacity gain of the next thermal/chemical step; research Ecopoiesis, build stations and queue useful projects. The normal project cost/time code applies the Terraformers discount.
- **Genetics:** prioritize discounted adaptation research for Genetic plasticity, pursue the relevant field, and issue the available adaptation orders.
- **Fleet care:** Cybernetic ships pause in the field for automatic repair. Other damaged fleets seek a friendly repair system. Ships use legal direct destinations or known intermediate supply steps.
- **War:** create current-tech designs, limit peacetime military spending, build troop transports during wars, bombard defenses and invade when enemy orbital forces do not dominate. War declarations depend on contacts, known enemy military presence, own readiness and personality.
- **Diplomacy and intelligence:** establish trade/research agreements, dispatch available agents and use sabotage/stealing/intelligence by context. These decisions remain exclusively AI-owned; human colony automation cannot unexpectedly declare war or launch intelligence operations.
- **Exploration and objectives:** scout unknown reachable systems, avoid reserving the same colonization target twice, seek accessible Gardener sites and construct the Legacy project when eligible.

## Tests

`pnpm exec tsx --test packages/balance/test/controller.test.ts packages/balance/test/production.test.ts`

The suite covers purity/replay, enabled-area boundaries, an overextended empire's recovery decisions, actual terraforming orders, Genetic plasticity research, spy use, Cybernetic repair behaviour, troop invasion, legal command application and a complete autonomous 120-turn campaign, plus every special's production mechanic hooks. The improved agent also exposed a research/spy collision: a stolen project still in the research queue could be completed twice. The engine now removes already-known queued projects without consuming their research overflow, and a regression fixture remains in the suite.

## Remaining limits

This is a deterministic heuristic opponent, not a game-theoretically optimal player. Its decisions can still underestimate obscure combinations and victory-specific tactics. The empirical reports fingerprint the AI source as well as the simulation source; changes to either invalidate the corresponding price claim. The first production report is preserved separately so the initial incompetence and the resulting iteration are visible instead of silently erased.

The final refinement phases Genetic plasticity's extra research priority until expansion or turn 15, retaining propulsion as the first priority. Terraforming is now considered only where completing thermal/chemical adaptation can actually raise capacity; worlds limited by an unfixable gravity/radiation axis no longer receive ineffective projects. Per-decision capacity and prospective-morale values are cached so evaluating many colonies does not repeatedly traverse the entire map. Candidate worlds use `observedSystem`, so hidden invented planets cannot be colonization or invasion targets before the AI observes them. Known planetary batteries are included in assault strength estimates; a weak expedition cannot bypass this safeguard by seeking ruins in the defended system.

This controller passed the final frozen-engine audit: 576 games, 69,120 invariant-checked turns and 6,387 battles. The 36 balance/controller/production checks pass with the applied prices. [The final price record](final-prices.md) distinguishes measured production results from remaining research estimates.
