# Pick calibration methodology

The user required special costs to be simulated **before** predefined species exist. The first experiment deliberately has no named species: every treatment is a neutral Carbon, Temperate, Standard-gravity, Oxygen-breathing, Land, Normal-light reference with one pick, or one pair of specials.

## What runs

`node packages/balance/src/calibrate.ts --seeds 128`

Node 24 can strip TypeScript types directly; no packages, server, network access or paid model are involved. The command emits a JSON evidence file, a readable report and the generated `costs.ts` table. `PICKS` and `evaluatePicks` are the runtime-facing interface.

Each trial runs 120 turns on forty seeded worlds, with one of seven AI allocation policies: balanced, expansionist, builder, scholar, militarist, trader and diplomat. Five ecological regimes change the prevalence of oxygen worlds, ocean worlds, radiation and dim stars. Exogenous hazard/market/neighbour random numbers are drawn on a fixed tape, so a treatment's different decisions do not shift its future random draws.

The reduced rules include worst-axis habitability, asymmetric gravity mismatch, atmospheric/medium/radiation/light tolerances, population capacities, logistic growth, industry-built Synthetic population, upkeep, additive output pools, building investment, supply-limited expansion, colony costs and founding population, adaptation, terraforming, research tiers and portfolio breadth, fleet investment, veteran tenure, defence/ECM, field repair, espionage, trade, hostile encounters, bombardment and conquest exposure. Each special has a direct behavioural hook. The opponent is a seeded, increasing frontier threat rather than a second complete production AI. The research simulator intentionally does not import a species roster.

## Estimation

Compare each treatment to its seed/controller-matched reference. A prerequisite is present on **both** sides: Radiotrophic is evaluated over Radiation-resistant, so its price is incremental. A government replaces Autocracy rather than stacking on top. Average controller outcomes within each map seed, then report a normal-approximation 95% interval of those paired seed means, plus all seven controller-specific estimates. This treats the map seed as the independent sampling unit rather than assuming controllers sharing a map are independent. Pair interaction intervals use the same grouping.

Terminal score weights are population ×10, colonies ×30, lifetime research ×0.12, fleet ×0.5, nonnegative treasury ×0.025, artifact progress ×40 and colony losses ×−5. They are deliberately published assumptions. The terminal score is not equivalent to any one production victory condition. The paired higher-score fraction is **not** a full-game competitive win rate.

Point prices use `round(log(1 + meanGain / 100) / log(1.05))`. Beneficial nonreference picks retain a provisional minimum price of one where the research simulator is insufficiently sensitive. Drawbacks refund only 65% of the loss of the least-harmed policy, rounded down; aptitude convexity and the six-point aggregate refund cap then apply. The nine specials all enter the sampled pair tournament. The residual is `score(A+B) − score(A) − score(B) + score(reference)`, normalized to the reference. Residuals with an interval wholly above +5 or below −5 percentage points are flagged for production-engine redesign/validation, rather than silently treated as additive.

An initial diagnostic exposed a modeling omission: administration/stability research and governor support were absent, while every project advanced an entire six-field technological era. That exaggerated Hive mind's immunity and erased environmental drawbacks with excessively rapid adaptation. The final research run fixes those omissions by advancing one era per six projects, pacing adaptation by era and adding documented administrative/stability progression. **The Hive mind rules themselves were not changed.** This is a research-model correction, not an undeclared game-design change.

## What this cannot establish

This is a **pre-roster research estimate**, not release-quality balance evidence. Real geography, rival adaptation, actual ship strategies, every research choice, victory selection and human exploitation require production-engine tournaments. Intervals characterize only the sampled model: they do not include model error. A low standard error cannot cure a missing mechanic. Explanatory prose, reports and UI must preserve that distinction.

When the complete simulation is available, replace the outcome driver with paired full AI-versus-AI games: swap seats per seed; run every controller pair and each victory configuration; compare score and actual wins; retain the least-harmed-policy refund rule; re-run flagged combinations and record validation status. Never label the research estimate as a completed production tournament.
