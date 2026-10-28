# Applied special prices

Historical report: the active 0.003 price table and rebuilt roster are documented in [pricing-0.003.md](pricing-0.003.md). The measurements below remain evidence for the earlier rules and price decision.

These prices were applied following the initial pre-roster research calibration and the final frozen-engine experiment: **576 actual games, 69,120 invariant-checked turns, 6387 observed battles and 24 independent paired seeds**, both treatment seats. All simulation TS/JSON modules, the controller, catalog and pick data are fingerprinted in [the machine-readable decision](final-prices.json).

The convention is one point per roughly 5% multiplicative terminal-score increase, rounded, with conservative provisional floors. A zero-point sidegrade does not refund points. Hive mind and Subterranean remain mutually exclusive under [D49](decision-D49.md).

| Special | Prior price | Applied price | Mean paired score | 95% seed interval | Decision |
|---|---:|---:|---:|---|---|
| subterranean | 7 | **7** | 45.17% | 27.33% … 63.02% | Version 0.002, twelve-seed upgrade assessment. |
| photosynthetic | 2 | **2** | 6.50% | 3.49% … 9.51% | Version 0.002, twelve-seed upgrade assessment. |
| spore-borne | 1 | **1** | 5.33% | -5.87% … 16.52% | Version 0.002, twelve-seed upgrade assessment. |
| hive-mind | 5 | **5** | 25.97% | 6.30% … 45.64% | Version 0.002, twelve-seed upgrade assessment. |
| terraformers | 1 | **1** | 4.60% | 2.76% … 6.43% | Version 0.002, twelve-seed upgrade assessment. |
| genetic-plasticity | 2 | **2** | 9.43% | 1.34% … 17.51% | Version 0.002, twelve-seed upgrade assessment. |
| electrosense | 1 | **1** | 6.23% | -3.80% … 16.25% | Version 0.002, twelve-seed upgrade assessment. |
| radiotrophic | 1 | **1** | 0.00% | 0.00% … 0.00% | Version 0.002, twelve-seed upgrade assessment; provisional minimum, no demonstrated marginal effect. |
| cybernetic | 0 | **0** | -1.87% | -4.52% … 0.78% | Version 0.002, twelve-seed upgrade assessment. |

## Limits

- The price convention is a game-design choice, not a statistically unique integer.
- Confidence intervals cover sampled neutral Carbon/Autocracy/Oxygen profile games only; model error, frame/environment interactions and human exploits remain.
- Special pairs with significant super-additive effects are handled by D49 availability constraints rather than pretending individual prices make them additive.
- Frame, origin, government and aptitude prices still come from the explicitly labeled pre-roster research simulator; these are not falsely labeled as production-calibrated.
- Editing predefined species after pricing changes the source fingerprint but does not change the neutral reference profile used in the experiment. New mechanical or AI changes require new validation.

The research command preserves this final table rather than silently overwriting special prices with the older proxy model. A deliberate new production pricing pass must first complete the full frozen-source experiment.

## Targeted light-profile revision

Photosynthetic was subsequently validated in a separate 72-game pass after explicit planetary lighting was added. Its current row uses that later result; the other eight rows retain the earlier full 576-game source revision. See [the source boundary and measurements](photo-validation.md).

## Building-effect binding upgrade

A reduced twelve-seed full-special regression subsequently checked the economy and defense binding corrections in version 0.002. Current table rows now show that compatibility assessment. Earlier larger experiments remain unchanged at their own recorded source revisions. See [the upgrade assessment](production-upgrade-0.002-prices.md).
