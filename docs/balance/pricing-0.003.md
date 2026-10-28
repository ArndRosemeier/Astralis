# Trait prices and the ten-point roster — 0.003

## Active policy

The shared price table in `packages/balance/src/costs.ts` determines what a civilization can afford. Predefined races and custom designs use the same evaluator: 10 base points, at most 6 refunded points, and no species-specific subsidies or hidden balance multipliers. Every predefined race spends exactly 10 net points. Point prices were fixed before rebuilding the roster; the roster screen did not drive race-specific buffs.

This is an initial design-pricing revision informed by production measurements, **not a claim of solved competitive balance**. It supersedes the active costs described in `final-prices.md`, which remains a historical record. Prices are deliberately not a blind conversion of AI score into points: that would again make useful military abilities nearly free and diplomacy free. The old calibration did exactly this for several choices.

- Aptitudes use a consistent tier ladder: −1 refunds 1 point, +1 costs 2, +2 costs 5. Concentrated specialization costs more than two first-tier aptitudes. Negative aptitudes always have a smaller refund than the corresponding positive tier costs. This is a transparent design constraint, not an assertion that every aptitude has identical measured utility.
- Reproduction uses −2 / −1 / 0 / 1 / 3 for very slow / slow / normal / fast / very fast. Lifespan uses −2 / −1 / 0 / 1 / 2 for ephemeral / short / normal / long / ancient. A stronger tier can no longer be bought for the weaker tier's price.
- Habitat access is no longer a one-point grab bag: Sealed metabolism costs 6, Hardy 3, wide gravity 2, narrower one-axis benefits generally 1. Sealed metabolism's large observed gain across chemistry profiles justifies consuming most of a build's budget. These integer prices are conservative design anchors informed by effect breadth and roughly 8% multiplicative score increments, not a statistical fit or a universal exchange rate.
- Creative costs 3; Synthetic 4 and Lithic 3 account for their built-in packages and real reproduction/industry tradeoffs. Subterranean retains its conservative 7-point price from the earlier special audits rather than being reduced solely to match this smaller screen. Hive mind remains 5 with its Subterranean exclusion.
- Every purchased benefit costs at least one point. Cybernetic and Nomad are now priced utility choices instead of free additions. Low observed AI use does not imply that repair, mobility, combat or diplomatic advantages have no human value.
- Refunds are modest (one or two points), mutually exclusive within each tier family, and capped at six in total. Rigid refunds two for losing alternative research. Drawback values include designer judgment about human play; the AI evidence alone cannot establish their exploitation risk.
- Validation rejects stability aptitudes on a Hive mind, excess Industry +2 or duplicate radiation resistance on Lithic, and redundant Sealed metabolism on Synthetic. Existing frame restrictions still prohibit ignored growth/lifespan drawbacks. No refund may bypass those exclusions.

## Evidence

The new actual-engine audit covers **71 traits, 1,752 games and 157,680 invariant-checked turns**. It uses 12 matched scenarios: three physiological profiles (temperate oxygen land, cold reducing aquatic, hot carbonic land) crossed with Balanced, Expansionist, Scholar and Militarist AI policies. Each scenario uses a different Random-region map seed, both treatment seats, and a 90-turn horizon. Prerequisites are present in both control and treatment, and frame/government traits update their actual species fields. All source fingerprints remained unchanged during each shard and match across all four shards.

The measure is the mean percentage change in the treated empire's terminal score against its own matched control, not a win rate. Only one map is sampled per profile/policy cell; these figures do not provide precise universal price estimates. The small two-player maps, limited policies, no Aerial profile, no Approach, lack of pairwise interaction coverage, and imperfect combat/diplomacy AI are material limitations. Existing larger individual-special reports remain supporting evidence, not proof that new combinations are balanced.

The neutral controls (Carbon, Autocracy and Standard homeworld) return zero change. Particularly informative signals were Sealed metabolism (+59.87%), Hardy (+23.98%), Creative (+24.94%) and Rigid (−35.08%). Diplomacy and some military traits showed little score movement, which is why minimum utility prices and tier rules are necessary. A large trait benefit can be real even when an individual race's starting ecology is poor.

| Trait | Previous price | Active price | Mean score change |
| --- | ---: | ---: | ---: |
| carbon | 0 | 0 | +0.00% |
| lithic | 4 | 3 | +8.93% |
| synthetic | 1 | 4 | +9.32% |
| temperature-narrow | 0 | -1 | -8.07% |
| temperature-wide | 1 | 1 | +2.50% |
| gravity-narrow | 0 | -1 | -14.58% |
| gravity-wide | 3 | 2 | +9.12% |
| amphibious | 2 | 1 | +0.36% |
| radiation-vulnerable | -1 | -1 | -13.10% |
| radiation-resistant | 2 | 1 | +2.97% |
| hardy | 1 | 3 | +23.98% |
| sealed-metabolism | 1 | 6 | +59.87% |
| growth-very-slow | 0 | -2 | -4.75% |
| growth-slow | 0 | -1 | -1.57% |
| growth-fast | 1 | 1 | -0.56% |
| growth-very-fast | 1 | 3 | +1.96% |
| lifespan-ephemeral | 0 | -2 | -0.20% |
| lifespan-short | 0 | -1 | -1.87% |
| lifespan-long | 1 | 1 | +4.84% |
| lifespan-ancient | 1 | 2 | +4.87% |
| rigid | 0 | -2 | -35.08% |
| creative | 1 | 3 | +24.94% |
| origin-standard | 0 | 0 | +0.00% |
| origin-large | 3 | 2 | +14.60% |
| origin-small | -1 | -1 | -17.12% |
| origin-rich | 1 | 1 | +0.18% |
| origin-poor | 0 | -1 | -1.69% |
| origin-twin | 3 | 3 | +22.03% |
| origin-vault | 1 | 1 | -0.21% |
| origin-nomad | 0 | 1 | -10.13% |
| subterranean | 7 | 7 | +19.87% |
| photosynthetic | 2 | 2 | +2.67% |
| spore-borne | 1 | 1 | +2.74% |
| hive-mind | 5 | 5 | +23.52% |
| terraformers | 1 | 1 | +2.14% |
| genetic-plasticity | 2 | 2 | +4.72% |
| electrosense | 1 | 1 | -0.75% |
| radiotrophic | 1 | 1 | -0.68% |
| cybernetic | 0 | 1 | -3.33% |
| autocracy | 0 | 0 | +0.00% |
| republic | 2 | 2 | +13.04% |
| communion | 1 | 1 | +1.39% |
| federation | 1 | 2 | +9.81% |
| technocracy | 2 | 2 | +6.23% |
| directorate | 1 | 1 | +7.21% |
| xenophobic | 0 | 0 | +0.69% |
| cosmopolitan | 1 | 1 | -0.21% |
| industry-minus | -1 | -1 | -5.33% |
| industry-1 | 2 | 2 | +5.88% |
| industry-2 | 5 | 5 | +11.85% |
| research-minus | -1 | -1 | -8.24% |
| research-1 | 2 | 2 | +9.38% |
| research-2 | 5 | 5 | +10.03% |
| commerce-minus | 0 | -1 | -3.77% |
| commerce-1 | 1 | 2 | -0.55% |
| commerce-2 | 3 | 5 | +2.85% |
| piloting-minus | 0 | -1 | -0.54% |
| piloting-1 | 1 | 2 | -0.16% |
| piloting-2 | 3 | 5 | -0.48% |
| troops-minus | 0 | -1 | +0.14% |
| troops-1 | 1 | 2 | -0.16% |
| troops-2 | 3 | 5 | +1.50% |
| espionage-minus | 0 | -1 | -0.65% |
| espionage-1 | 1 | 2 | +0.06% |
| espionage-2 | 3 | 5 | +1.23% |
| diplomacy-minus | 0 | -1 | +0.00% |
| diplomacy-1 | 1 | 2 | +0.00% |
| diplomacy-2 | 3 | 5 | +0.00% |
| stability-minus | 0 | -1 | -8.71% |
| stability-1 | 1 | 2 | +2.68% |
| stability-2 | 3 | 5 | +13.15% |

## Roster and compatibility

Races are authored from the shared prices, with their recognizable biology and government retained. Examples: Skethi buy a concentrated research/Creative package; Corundi buy Lithic industrial capacity; Hallowfleet spend on mobility, trade and pilots; Myriad buy spores and rapid reproduction with a diplomatic drawback. Electrosense is retained where it contributes to identity, rather than filling every spare point. The complete costs and effects are visible in setup and the in-game dossier.

Existing campaign saves retain their serialized species kits. New campaigns use the revised predefined roster. Custom species that exceed the new budget or violate a new redundancy rule remain stored and can be repaired in the Species lab; they are not offered for new campaigns until valid. Repairing a saved custom species updates that design instead of duplicating it or deleting unrelated designs. Unknown or malformed data is still rejected.

The post-change roster screen is documented in [roster-review.md](roster-review.md). Equal budgets now follow explicit, enforceable rules, but broad human playtesting and more seeds/opponents are still needed to refine the price table. Future corrections should change shared costs first, then refit affected races; do not add hidden faction bonuses to force outcomes.

## Reproduction

Run `pnpm exec tsx tools/audit-trait-prices.ts N 4` for N = 0, 1, 2, 3 without changing simulation sources during the run. Then run `pnpm exec tsx tools/summarize-trait-audit.ts 4`. The combined raw measurements and source hashes are in [trait-pricing-audit-0.003.json](trait-pricing-audit-0.003.json). Shard files are intermediate outputs. The tool measures mechanics; it does not overwrite prices. Running it after later engine changes deliberately produces new evidence.
