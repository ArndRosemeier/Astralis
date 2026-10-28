# Production-engine special validation

This follows the pre-roster research calibration and uses the actual game engine, not the research proxy.

- 576 games; 24 independent paired seeds; both treatment seats.
- 69,120 invariant-checked turns; 6387 observed battles.
- 6 policy styles, scheduled evenly across seeds. Each paired seed averages both seats before the confidence interval.
- Runtime: 413.5 seconds.
- Engine source changed on disk during run: **false**. Imports are loaded once; SHA-256 source fingerprints are stored with the evidence. Re-run if the source changes affect mechanics.

| Special | Current cost | Paired score change | 95% seed interval | Treated actual win fraction | Paired population change |
|---|---:|---:|---|---:|---:|
| subterranean | 3 | +39.65% | +27.29% … +52.02% | 70.8% | +63.69% |
| photosynthetic | 1 | +10.38% | +6.56% … +14.21% | 56.3% | +2.36% |
| spore-borne | 2 | +2.30% | -3.49% … +8.08% | 52.1% | +7.20% |
| hive-mind | 4 | +25.36% | +15.20% … +35.51% | 68.8% | +27.62% |
| terraformers | 2 | +5.44% | +4.23% … +6.64% | 54.2% | +6.68% |
| genetic-plasticity | 2 | +8.34% | +2.45% … +14.23% | 56.3% | +14.00% |
| electrosense | 1 | +5.70% | -1.15% … +12.56% | 56.3% | +10.30% |
| radiotrophic | 1 | +1.19% | -0.74% … +3.11% | 56.3% | +1.04% |
| cybernetic | 1 | -3.12% | -4.96% … -1.28% | 50.0% | -1.21% |

## Interpretation and limitations

- The style schedule assigns each independent map to one policy; per-style samples are smaller than the pooled sample.
- All environments use a neutral Carbon/Autocracy/Oxygen reference; ecology families and frame interactions require expanded tournaments.
- The Approach is disabled and both empires use the legal Defy order, avoiding early two-player Concord victory.
- Score is measured at the actual end of the game, which may occur before the configured turn limit.
- Prices are not automatically changed by this validation; disagreement with research estimates must be reviewed.
- Game-theoretic balance, human exploits and every victory configuration are not established by this finite sample.

Do not describe these measurements as comprehensive release balance. Mechanic hook tests complement the tournaments because an AI may fail to exploit a working special. Full results, per-style data, raw paired comparisons and actual outcomes are in [production.json](production.json).
