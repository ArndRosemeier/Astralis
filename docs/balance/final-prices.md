# Applied special prices

These prices are active in the game, following the initial pre-roster research calibration and the final frozen-engine experiment: **576 actual games, 69,120 invariant-checked turns, 6387 observed battles and 24 independent paired seeds**, both treatment seats. All simulation TS/JSON modules, the controller, catalog and pick data are fingerprinted in [the machine-readable decision](final-prices.json).

The convention is one point per roughly 5% multiplicative terminal-score increase, rounded, with conservative provisional floors. A zero-point sidegrade does not refund points. Hive mind and Subterranean remain mutually exclusive under [D49](decision-D49.md).

| Special | Prior price | Applied price | Mean paired score | 95% seed interval | Decision |
|---|---:|---:|---:|---|---|
| subterranean | 3 | **7** | 39.65% | 27.29% … 52.02% | Mean-score price with a provisional one-point minimum; finite neutral-profile evidence is not universal balance. |
| photosynthetic | 2 | **2** | 9.53% | 5.78% … 13.27% | Explicit-light revision; separate 72-game validation. |
| spore-borne | 2 | **1** | 2.30% | -3.49% … 8.08% | Mean-score price with a provisional one-point minimum; finite neutral-profile evidence is not universal balance. |
| hive-mind | 4 | **5** | 25.36% | 15.20% … 35.51% | Retain at least four points conservatively for immunity and Unified package; the documented incompatible Subterranean pair is excluded. |
| terraformers | 2 | **1** | 5.44% | 4.23% … 6.64% | Mean-score price with a provisional one-point minimum; finite neutral-profile evidence is not universal balance. |
| genetic-plasticity | 2 | **2** | 8.34% | 2.45% … 14.23% | Mean-score price with a provisional one-point minimum; finite neutral-profile evidence is not universal balance. |
| electrosense | 1 | **1** | 5.70% | -1.15% … 12.56% | Mean-score price with a provisional one-point minimum; finite neutral-profile evidence is not universal balance. |
| radiotrophic | 1 | **1** | 1.19% | -0.74% … 3.11% | Mean-score price with a provisional one-point minimum; finite neutral-profile evidence is not universal balance. |
| cybernetic | 1 | **0** | -3.12% | -4.96% … -1.28% | Zero-point sidegrade: extra upkeep outweighed repair/troop utility in these games. No refund is granted, since military/human exploitation remains uncertain. |

## Limits

- The price convention is a game-design choice, not a statistically unique integer.
- Confidence intervals cover sampled neutral Carbon/Autocracy/Oxygen profile games only; model error, frame/environment interactions and human exploits remain.
- Special pairs with significant super-additive effects are handled by D49 availability constraints rather than pretending individual prices make them additive.
- Frame, origin, government and aptitude prices still come from the explicitly labeled pre-roster research simulator; these are not falsely labeled as production-calibrated.
- Editing predefined species after pricing changes the source fingerprint but does not change the neutral reference profile used in the experiment. New mechanical or AI changes require new validation.

The research command preserves this final table rather than silently overwriting special prices with the older proxy model. A deliberate new production pricing pass must first complete the full frozen-source experiment.

## Targeted light-profile revision

Photosynthetic was subsequently validated in a separate 72-game pass after explicit planetary lighting was added. Its current row uses that later result; the other eight rows retain the earlier full 576-game source revision. See [the source boundary and measurements](photo-validation.md).
