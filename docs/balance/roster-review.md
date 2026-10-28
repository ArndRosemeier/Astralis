# Roster screen — 0.003

The original selector showed only special traits and level-two aptitudes, hiding governments, level-one bonuses, tolerances, origins, growth and lifespan. The new selector shows all traits, their point costs and concrete effects, plus combined economic modifiers and a direct comparison.

A real Amphibious bug was also fixed: aquatic species were still penalized on dry land. Oolu, Ulqua and Seren now receive the promised living-medium exemption in either direction. Other environmental hazards remain. Regression tests cover all three species.

At the owner's direction, the shared prices were then revised and all 26 races rebuilt to exactly ten net points. See [the pricing decisions and 1,752-game trait audit](pricing-0.003.md). All full kits remain distinct; budget and non-redundancy constraints are enforced in tests and roster validation.

This screening experiment ran 104 games at each of three stages (312 total): two Random-region seeds, both seats, all 26 races against Humans, Balanced AI, up to 90 turns, no Approach, both empires using Defy. Neutral IDs avoid the special Humans/Sol placement. Every resolved turn passes engine invariants. Species-specific home selection remains active, so neighboring habitat opportunity is not held constant between species.

Values are mean share of the pair's final score, **not win rates**. Four observations per race do not establish balance. The final column also uses the rebuilt Human reference, so before/after values do not isolate the effect of changing the subject alone. Results remain varied; no race received private modifiers or off-budget traits to fit these outcomes.

| Civilization | Original | Amphibious fix only | Rebuilt roster | Net points |
| --- | ---: | ---: | ---: | ---: |
| Humans | 50.0% | 50.0% | 50.0% | 10 |
| Vael | 50.6% | 50.6% | 51.1% | 10 |
| Oolu | 36.7% | 40.3% | 45.3% | 10 |
| Brathak | 66.4% | 66.4% | 58.9% | 10 |
| Sylphae | 62.0% | 62.0% | 63.1% | 10 |
| Corundi | 61.8% | 61.8% | 64.2% | 10 |
| Myriad | 59.5% | 59.5% | 47.0% | 10 |
| The Lattice | 60.1% | 60.1% | 54.2% | 10 |
| Tessit | 38.3% | 38.3% | 39.1% | 10 |
| Skethi | 47.6% | 47.6% | 44.9% | 10 |
| Hallowfleet | 47.6% | 47.6% | 37.6% | 10 |
| Qelloth | 55.9% | 55.9% | 54.0% | 10 |
| Mur | 70.9% | 70.9% | 69.4% | 10 |
| Kiriel | 36.0% | 36.0% | 35.7% | 10 |
| Ulqua | 51.9% | 51.9% | 53.8% | 10 |
| Tharn | 58.1% | 58.1% | 49.7% | 10 |
| Wardens | 67.8% | 67.8% | 61.8% | 10 |
| Mycel | 49.0% | 49.0% | 53.0% | 10 |
| Ixit | 56.1% | 56.1% | 55.5% | 10 |
| Vorr | 57.5% | 57.5% | 47.3% | 10 |
| Sorrin | 43.3% | 43.3% | 45.4% | 10 |
| Kith | 59.6% | 59.6% | 51.3% | 10 |
| Aumaru | 40.7% | 40.7% | 41.8% | 10 |
| Abyssals | 53.0% | 53.0% | 47.7% | 10 |
| Kethâ€™ra | 55.4% | 55.4% | 57.2% | 10 |
| Seren | 55.8% | 55.5% | 54.7% | 10 |

Mur and Corundi remain high-performing screening candidates; Kiriel, Hallowfleet and Tessit remain low-performing candidates under this controller. Their habitat preferences, map opportunity, specialized abilities and AI choices need broader investigation. The price audit prevents treating the number of visible badges as a power score, but equal budgets do not guarantee equal outcomes on every map.

Reproduce the current screen with `pnpm exec tsx tools/audit-roster.ts`. Raw records: [original](roster-screen-before.json), [Amphibious-only](roster-screen-amphibious.json), [rebuilt roster](roster-screen.json). The original rules/roster are from commit `3b9840f`. The Amphibious-only stage uses that roster with the aquatic exemption corrected. These screens are not replacements for the individual-trait evidence.
