# Species pick calibration — before the roster

This experiment was completed before predefined species were constructed. It is a reduced research simulation, **not proof that the complete game is balanced**.

- Seed: 812421; 128 paired seeds per controller; 7 controllers; 120 turns per run.
- 84,224 distinct runs, 63,616 individual-pick comparisons.
- All 36 valid pairs among the nine specials sampled on 64 seeds × 7 controllers.
- 100 random-combination finite-state checks passed.
- Run time: 24.003 seconds.

## Point convention

Positive numbers spend points; negative numbers refund. One point corresponds to roughly a 5% multiplicative increase in terminal score, rounded to an integer. Refunds are 65% of the least-harmed controller's loss, rounded down, at most four per drawback and six in total. A +2 aptitude costs at least twice +1 plus one. Autocracy, Carbon and Standard origin define the zero-cost reference. Uncertain picks retain a minimum provisional special cost of one. These are design constraints, explicitly distinguished from measurements.

| Pick | Draft cost | Measured cost | Mean score change | 95% paired interval | Status |
|---|---:|---:|---:|---|---|
| Carbon | 0 | 0 | +0.00% | +0.00% … +0.00% | measured |
| Lithic | 0 | 4 | +20.34% | +18.61% … +22.08% | measured |
| Synthetic | 3 | 1 | -68.82% | -69.56% … -68.09% | measured |
| Narrow thermal tolerance | -2 | 0 | -7.00% | -8.24% … -5.76% | measured |
| Wide thermal tolerance | 3 | 1 | +0.48% | +0.16% … +0.81% | measured |
| Narrow gravity tolerance | -1 | 0 | -13.46% | -14.70% … -12.23% | measured |
| Wide gravity tolerance | 2 | 3 | +13.52% | +9.41% … +17.63% | measured |
| Amphibious | 3 | 2 | +8.89% | +7.56% … +10.23% | measured |
| Radiation-vulnerable | -2 | -1 | -14.75% | -16.55% … -12.95% | measured |
| Radiation-resistant | 2 | 2 | +9.21% | +7.72% … +10.70% | measured |
| Hardy | 3 | 1 | +2.31% | +1.75% … +2.87% | measured |
| Sealed metabolism | 5 | 1 | +1.46% | +0.95% … +1.96% | measured |
| Very slow reproduction | -4 | 0 | -7.65% | -8.09% … -7.21% | measured |
| Slow reproduction | -2 | 0 | -2.41% | -2.78% … -2.04% | measured |
| Fast reproduction | 3 | 1 | +3.39% | +2.92% … +3.87% | measured |
| Very fast reproduction | 6 | 1 | +4.95% | +4.37% … +5.53% | measured |
| Ephemeral | -2 | 0 | -0.01% | -0.03% … +0.01% | uncertain |
| Short-lived | -1 | 0 | -0.01% | -0.03% … +0.01% | uncertain |
| Long-lived | 2 | 1 | +5.10% | +4.47% … +5.72% | measured |
| Ancient | 3 | 1 | +5.10% | +4.47% … +5.72% | measured |
| Rigid science | -3 | 0 | -2.20% | -2.34% … -2.07% | measured |
| Creative science | 6 | 1 | +3.88% | +3.64% … +4.12% | measured |
| Standard homeworld | 0 | 0 | +0.00% | +0.00% … +0.00% | measured |
| Large homeworld | 2 | 3 | +15.43% | +12.96% … +17.90% | measured |
| Small homeworld | -1 | -1 | -17.80% | -18.93% … -16.68% | measured |
| Rich homeworld | 2 | 1 | +6.41% | +5.78% … +7.05% | measured |
| Poor homeworld | -2 | 0 | -3.62% | -4.04% … -3.19% | measured |
| Twin settlement | 3 | 3 | +13.27% | +11.65% … +14.89% | measured |
| Gardener vault | 4 | 1 | +1.11% | +1.02% … +1.20% | measured |
| Nomad fleet | 0 | 0 | -1.22% | -2.31% … -0.14% | measured |
| Subterranean | 3 | 3 | +17.99% | +16.31% … +19.66% | measured |
| Photosynthetic | 2 | 1 | -4.56% | -5.58% … -3.55% | measured |
| Spore-borne | 3 | 2 | +12.70% | +11.88% … +13.51% | measured |
| Hive mind | 4 | 4 | +20.66% | +19.42% … +21.90% | measured |
| Terraformers | 3 | 2 | +10.45% | +9.78% … +11.12% | measured |
| Genetic plasticity | 3 | 2 | +7.68% | +6.11% … +9.24% | measured |
| Electrosense | 2 | 1 | +2.69% | +2.36% … +3.02% | measured |
| Radiotrophic | 2 | 1 | +2.97% | +2.48% … +3.46% | measured |
| Cybernetic | 3 | 1 | +2.37% | +2.27% … +2.48% | measured |
| Autocracy | 0 | 0 | +0.00% | +0.00% … +0.00% | measured |
| Republic | 3 | 2 | +12.10% | +10.66% … +13.55% | measured |
| Communion | 1 | 1 | +1.18% | +0.67% … +1.69% | measured |
| Federation | 3 | 1 | +4.24% | +3.25% … +5.22% | measured |
| Technocracy | 4 | 2 | +10.71% | +9.34% … +12.07% | measured |
| Directorate | 3 | 1 | +6.37% | +5.21% … +7.53% | measured |
| Xenophobic | -1 | 0 | +1.24% | +0.75% … +1.73% | measured |
| Cosmopolitan | 1 | 1 | +0.03% | -0.01% … +0.06% | uncertain |
| Industry -1 | -2 | -1 | -12.91% | -13.42% … -12.40% | measured |
| Industry +1 | 3 | 2 | +12.04% | +11.34% … +12.75% | measured |
| Industry +2 | 7 | 5 | +22.81% | +21.80% … +23.81% | measured |
| Research -1 | -2 | -1 | -12.14% | -12.90% … -11.37% | measured |
| Research +1 | 3 | 2 | +11.83% | +10.84% … +12.83% | measured |
| Research +2 | 7 | 5 | +21.26% | +19.37% … +23.15% | measured |
| Commerce -1 | -1 | 0 | -7.51% | -8.03% … -6.98% | measured |
| Commerce +1 | 2 | 1 | +2.56% | +2.25% … +2.88% | measured |
| Commerce +2 | 5 | 3 | +4.56% | +4.14% … +4.98% | measured |
| Piloting -1 | -2 | 0 | -0.07% | -0.12% … -0.02% | measured |
| Piloting +1 | 3 | 1 | +0.02% | -0.01% … +0.05% | uncertain |
| Piloting +2 | 6 | 3 | +0.02% | -0.01% … +0.05% | uncertain |
| Troops -1 | -1 | 0 | -0.01% | -0.09% … +0.07% | uncertain |
| Troops +1 | 2 | 1 | +0.02% | -0.04% … +0.08% | uncertain |
| Troops +2 | 4 | 3 | +0.03% | -0.05% … +0.11% | uncertain |
| Espionage -1 | -1 | 0 | +0.02% | -0.08% … +0.13% | uncertain |
| Espionage +1 | 2 | 1 | +0.85% | +0.44% … +1.27% | measured |
| Espionage +2 | 4 | 3 | +1.65% | +1.04% … +2.27% | measured |
| Diplomacy -1 | -1 | 0 | -0.44% | -0.74% … -0.14% | measured |
| Diplomacy +1 | 2 | 1 | +1.13% | +0.80% … +1.46% | measured |
| Diplomacy +2 | 4 | 3 | +1.97% | +1.54% … +2.41% | measured |
| Stability -1 | -2 | 0 | -6.52% | -7.07% … -5.96% | measured |
| Stability +1 | 3 | 1 | +5.08% | +4.45% … +5.71% | measured |
| Stability +2 | 5 | 3 | +9.44% | +8.54% … +10.34% | measured |

## Pair interactions

No special pair crossed the predeclared ±5 percentage-point interaction threshold.

## Interpretation

An interval entirely above zero means the pick improved this simulator's score under these scenarios. Paired win fraction means a higher terminal score than the seed-matched reference; it is not the competitive win rate of the production game. Ecology, controller mix, score weights and simplified opponents can all bias the estimates. Inspect the machine-readable per-controller results before changing a refund.

See [methodology](methodology.md) and [complete measurements](calibration.json). Re-run against the completed production engine before a release claim.
