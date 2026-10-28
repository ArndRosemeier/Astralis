# Production-engine special validation

This follows the pre-roster research calibration and uses the actual game engine, not the research proxy.

- 324 games; 12 independent paired seeds; both treatment seats.
- 38,880 invariant-checked turns; 1903 observed battles.
- 6 policy styles, scheduled evenly across seeds. Each paired seed averages both seats before the confidence interval.
- Runtime: 205.7 seconds.
- Engine source changed on disk during run: **false**. Imports are loaded once; SHA-256 source fingerprints are stored with the evidence. Re-run if the source changes affect mechanics.

| Special | Current cost | Paired score change | 95% seed interval | Treated actual win fraction | Paired population change |
|---|---:|---:|---|---:|---:|
| subterranean | 7 | +45.17% | +27.33% … +63.02% | 79.2% | +81.85% |
| photosynthetic | 2 | +6.50% | +3.49% … +9.51% | 54.2% | -3.06% |
| spore-borne | 1 | +5.33% | -5.87% … +16.52% | 50.0% | +11.41% |
| hive-mind | 5 | +25.97% | +6.30% … +45.64% | 62.5% | +29.10% |
| terraformers | 1 | +4.60% | +2.76% … +6.43% | 50.0% | +6.24% |
| genetic-plasticity | 2 | +9.43% | +1.34% … +17.51% | 54.2% | +15.39% |
| electrosense | 1 | +6.23% | -3.80% … +16.25% | 54.2% | +11.08% |
| radiotrophic | 1 | +0.00% | +0.00% … +0.00% | 50.0% | +0.00% |
| cybernetic | 0 | -1.87% | -4.52% … +0.78% | 54.2% | +1.47% |

## Interpretation and limitations

- The style schedule assigns each independent map to one policy; per-style samples are smaller than the pooled sample.
- All environments use a neutral Carbon/Autocracy/Oxygen reference; ecology families and frame interactions require expanded tournaments.
- The Approach is disabled and both empires use the legal Defy order, avoiding early two-player Concord victory.
- Score is measured at the actual end of the game, which may occur before the configured turn limit.
- Prices are not automatically changed by this validation; disagreement with research estimates must be reviewed.
- Game-theoretic balance, human exploits and every victory configuration are not established by this finite sample.

Do not describe these measurements as comprehensive release balance. Mechanic hook tests complement the tournaments because an AI may fail to exploit a working special. Full results, per-style data, raw paired comparisons and actual outcomes are in [production-upgrade-0.002.json](production-upgrade-0.002.json).
