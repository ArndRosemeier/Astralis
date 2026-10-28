# Design coverage audit

Read-only audit of the implementation during active development on **28 October 2026**. This file records actionable gaps rather than claiming the design is fully implemented. Root was editing the simulation concurrently; items explicitly listed as repaired or underway below must not be mistaken for unverified outstanding defects.

Scope: `docs/design.md`, detail documents, `packages/sim/src/`, `packages/ai/src/controller.ts`, and `apps/web/src/`. Reproductions used isolated in-memory games through Node/tsx; no source state, live room or player's save was mutated.

Priority meanings: **P0** normal setup cannot start; **P1** invalid game outcome, core-rule exploit or material completion blocker; **P2** important documented depth/UX not yet represented faithfully.

## Highest-priority outstanding findings at audit time

### P0 — Random small regions can have fewer systems than players and crash

**Reference:** `packages/sim/src/generation.ts`, `createGame()`, random-centre selection and homeworld loop; `apps/web/src/App.tsx`, setup permits 12 civilizations with Small/Random.

The extended HYG-derived outer catalogue is intentionally incomplete for faint stars. Choosing an arbitrary G star anywhere out to 100 pc can yield only a few systems inside a 15 ly sphere. The placement loop eventually exhausts stars, then accesses `home.planets` on `undefined`.

**Reproduced:** 12/12 seeds `audit-0` through `audit-11`, with `{region:'Random',size:'Small',players:12}` and the real extended catalogue, threw `Cannot read properties of undefined (reading 'planets')`.

**Required:** choose deterministic candidate centres that actually satisfy the requested population and spacing constraints; validate map options before creating empires. Prefer the denser CNS5 region when the incomplete outer catalogue cannot support a setup. Do not manufacture positions and label them real. The requirement is not merely to clamp a displayed player count after partially creating the game.

### P1 — Procedural generation cannot create gas giants

**Reference:** `generation.ts`, `createPlanet()`, `radius = .35 + random * 1.5` followed by `gas = radius > 2.2`; design §3.3 and species ecology §5.

The generated radius is always below 1.85 Earth radii, so the gas branch is unreachable. Only catalogue giants and forced Aerial homeworlds can be giants. This also suppresses most generated giant-moon systems and materially disadvantages Aerial species.

**Reproduced:** default Medium game had 218 generated rocky worlds, 50 ice worlds, 38 ocean worlds and **zero generated gas worlds**. The same radius model and `gravity = radius * .9` also prevent generated heavy terrestrial worlds above roughly 1.67 g, disproportionately affecting Crushing/high-gravity profiles.

**Required:** sample planet families first from star-type-dependent distributions, then physically plausible radius/mass/orbit within that family; preserve known planets and flag modeled parameters. Add ecological coverage tests before relying on full-game species comparisons.

### P1 — Score victory can select an eliminated empire

**Reference:** `engine.ts`, final Score victory branch in `processTurn()`; design §15, elimination rules in ground combat §8.

The final score ranking uses all `g.empires`, including `eliminated` empires. Their retained treasury and technology can still dominate score.

**Reproduced:** in a three-empire game, eliminated empire 0 had no colonies and retained 1,000,000 credits. At the turn limit the result was `{winner:0, winnerEliminated:true, victory:'Score'}`.

**Required:** rank surviving eligible empires, with an explicit all-eliminated/draw fallback. The same eligibility review should cover Concord candidates/defiers and Approach scoring.

### P1 — Newly declared late wars instantly incur decades of weariness

**Reference:** `rules.ts`, `stability()`; diplomacy detail §7 and economy §6.

Weariness is derived from `wars * max(0, g.turn - 5) * .5`, rather than actual war duration and losses. The first war on turn 50 therefore immediately reaches the maximum penalty. Peace also clears it instantly rather than fading it by 2 per turn.

**Reproduced:** turn 50, newly created war with `since=50`, no earlier wars: colony stability changed **60 → 40**, an immediate −20 penalty.

**Required:** persistent per-empire weariness, incremented for actual war turns and specified losses, reduced during peace, with government modifiers. A treaty's `since` timestamp is also reused by other diplomatic actions, so it alone is not a robust war clock.

### P1 — Loss of capital does not relocate the defender's capital

**Reference:** `engine.ts`, invasion success in `processTurn()`; `canQueue()` Legacy requirement; ground combat detail §8.

Changing the captured planet's owner does not move the old owner's `capital` to its largest remaining colony. The stale id now belongs to the enemy. Besides wrong homeworld administration and navigation, the surviving defender cannot construct its Gardener Archive anywhere because Legacy construction requires `p.id === e.capital`.

**Required:** relocate a lost capital, apply the documented one-turn disorder, and ensure all capital-only facilities and UI navigation follow the new id. Include a conquest test where the loser still controls another colony.

### P1 — Legacy keys can become permanently inaccessible after being split

**Reference:** `generation.ts`, three guaranteed sites; `engine.ts`, ruins collection and Legacy build requirement; design §15.

Exactly three guaranteed tier-3 sites award one key each. If different empires recover them, no implemented diplomatic exchange or conquest/elimination transfer recombines the keys. A player can no longer reach three after those sites are consumed, even after defeating the holders.

**Required:** a documented way to recover captured/eliminated empires' keys or artifacts, diplomatic transfer, or additional deterministic key sources. Verify Legacy reachability after a 1/1/1 split, not only with a synthetic test state already containing three keys.

### P1 completion gap — Approach victory is currently a global fleet-damage comparison

**Reference:** `engine.ts`, Approach block in `processTurn()`; design §14.3 and §15.

At turn 100, summed weapon damage across an empire's fleets is compared to a scalar threshold. Fleet location, interception, battles, losses and an actual incoming force do not determine the result. A sufficient fleet wins from anywhere; otherwise periodic population damage is applied.

**Required for the documented design:** a visible directional threat with an actionable approach/interception and resolution mechanism; attribute the decisive contribution after actual conflict. If a deliberate abstraction remains, describe it as a changed rule and make its requirements clear in the game/manual rather than presenting it as the full designed battle threat.

## Confirmed issues already communicated; root repairs underway

These were real findings but root explicitly acknowledged active fixes. Recheck their final form instead of treating them as unknown work.

| Finding | Concrete reference and consequence | Requested verification |
| --- | --- | --- |
| Civilian raiding never resolves | `battle.ts/simulateBattle()` exits as soon as either side has no armed units. Armed attacker vs colony-ship defender returned duration 0, attacker victory, civilian still at 15 HP. | Raiders must actually threaten unarmed ships; withdrawal should require an escape rather than instantaneous immunity. |
| Founding government lost on conquered-population stability | `rules.ts/stability(g,p,e,s)` used the planet population's species government, although D36 fixes government to the founding species. | Capture a colony of another government and verify founding government/admin remains authoritative while biological aptitudes remain local. |
| Ship proximity creates contact without physical exchange | First-contact block treated ships anywhere within 6 ly as sufficient. Docs allow proximity for colonies, while ships must meet in one system. | A probe 5 ly from an alien probe/colony should not exchange tanglelinks unless the documented colony condition also holds. |
| Light delay checkbox had no effect | `lightDelay` only appeared in default options, type and setup checkbox; no actual delayed observation state existed. | Remote telescope changes must become visible after distance-based delay, with own assets live; disabling the option changes this behavior. |
| System-view bypass leaked undiscovered worlds | `App.tsx` passed full `system.planets` into `SystemView`, even when the normal `SystemPanel` filter concealed invented worlds. | An unsurveyed system's 3D view, planet picker, counts and Starfacts must not reveal hidden generated content. |

## Repaired during this audit: direct repro checks now pass

| Finding | Earlier behavior | Observed after concurrent root repair |
| --- | --- | --- |
| Supply leapfrogging | Any hop of ≤ supply range was accepted from a fleet's current position, even outside every colony/outpost supply sphere. | A fleet at x=6 plotting to x=12 with its only node at x=0 and range 6 is rejected. |
| Negative buyout price | Construction overflow above a cheaper next item's cost could create credits. | Cost 20/progress 25/treasury 100 produces treasury 100 after buyout; no credit creation. |
| Rigid research softlock | Queuing two projects of one tier before either finished left the second at infinite price and no removal path. | After the first pick, the conflicting queue entry is removed rather than blocking research. |
| Synthetic double spending | Population assembly and construction both received the same full industry. | Root reports assembly now consumes industry before construction; final regression remains part of root's gate. |

## Remaining material depth / design fidelity (P2)

1. **Integrated populations cannot found colonies in their own biology.** Ground combat detail §8 explicitly makes this a strategic reward of conquest. `colonise()` and ordinary colony ships use `e.speciesId`; no colonist-species selection is represented in `Ship`. Capturing an aquatic species therefore does not open aquatic colonisation for the empire.
2. **Homeworld placement does not yet measure ecological fairness.** The inspected generator chooses spectral preference and distance from prior homes, then forces a matching home planet. It does not score habitable value within 8 ly or reject the documented extreme 60–160% starts. The gas/high-gravity generation issue magnifies this gap.
3. **Concord membership/formation is approximated by contact-edge count.** The inspected block uses the number of contact relations rather than the largest connected contact network and its members. On larger games, disconnected clusters can satisfy edge count without one network covering half the survivors. Candidate and defiance eligibility should exclude dead/nonmember empires.
4. **Allied conquest is not recognised.** `alive.length === 1` is the inspected Conquest condition; design permits the last empire *and its allies* standing. An all-allied surviving bloc otherwise waits for another victory.
5. **Human diplomatic agreements are imposed rather than negotiated.** `applyCommand('diplomacy')` can immediately set NAP/alliance/trade/research against a human counterpart; the typed command/model has no pending proposal and accept/decline exchange. Design detail §6 calls for proposals that take effect on turn processing after agreement.
6. **Full advanced strategy vocabulary is narrower than the design.** `StrategyRule` exposes hull/time/outnumbered/ammo and five actions, compared with the planned composition selectors, AND conditions, group protection, per-ship PD modes, formation and strategy switches. This is a documented depth difference even if all provided controls work correctly.
7. **Astronomy observation depth is a catalogued gameplay heuristic, but generation does not consume it.** The `CatalogStar` carries `observationDepth`; the inspected generation does not use it to constrain invented planets. Multi-star orbital stability and individual component-host orbit selection are similarly simplified. Keep generated/observed labels explicit.

Root is already implementing **systems links, repeatable research/effect coverage, defenses, refit/fleet splitting, origins and replay**. Those are not duplicated as uncertain missing work here. Mobile nomad capitals remain explicitly acknowledged as incomplete by root.

## Suggested release verification order

1. Normal setup combinations, especially Small/Random/12, across many deterministic seeds.
2. Gas/aerial/high-gravity ecological coverage and real start-value distributions.
3. Defeat, capital loss, Legacy split and every actual victory path from reachable states.
4. Newly declared/long-running wars and peace recovery.
5. Telescope observations, hidden generated bodies and every alternative system-view route.
6. Civilian encounters, allied combat/victories, and proposals between two real human seats.
7. Re-run production-game calibration after mechanics change; earlier measured pick costs are provisional for a materially different ruleset.
