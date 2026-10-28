# Building-effect upgrade: price compatibility

Version **0.002** completed **324 games, 38,880 invariant-checked turns and 1903 battles**, with twelve independent paired seeds and unchanged source during the run. The original full experiment and Photosynthetic revision are preserved separately.

This checks whether current integer prices remain inside the sampled score interval mapped to point prices. It does not silently replace the earlier larger sample or claim every price is uniquely optimal.

| Special | Prior | Active | Mean score | 95% seed interval | Mapped price interval | Decision |
|---|---:|---:|---:|---|---|---|
| subterranean | 7 | **7** | 45.17% | 27.33% … 63.02% | 5 … 10 | Retained within interval |
| photosynthetic | 2 | **2** | 6.50% | 3.49% … 9.51% | 1 … 2 | Retained within interval |
| spore-borne | 1 | **1** | 5.33% | -5.87% … 16.52% | 0 … 3 | Retained within interval |
| hive-mind | 5 | **5** | 25.97% | 6.30% … 45.64% | 1 … 8 | Retained within interval |
| terraformers | 1 | **1** | 4.60% | 2.76% … 6.43% | 1 … 1 | Retained within interval |
| genetic-plasticity | 2 | **2** | 9.43% | 1.34% … 17.51% | 0 … 3 | Retained within interval |
| electrosense | 1 | **1** | 6.23% | -3.80% … 16.25% | 0 … 3 | Retained within interval |
| radiotrophic | 1 | **1** | 0.00% | 0.00% … 0.00% | 0 … 0 | Provisional minimum; no marginal effect demonstrated |
| cybernetic | 0 | **0** | -1.87% | -4.52% … 0.78% | 0 … 0 | Retained within interval |

## Scope and limitations

- This reduced upgrade sample has twelve independent map seeds, two seats and six styles; per-style evidence is especially small.
- The earlier full 576-game experiment and later 72-game Photosynthetic replication remain separate, unchanged evidence at their own source revisions.
- Retained prices are either compatible with the sampled interval or explicitly labeled provisional minima; neither proves universally optimal balance.
- A zero-effect trait in a neutral-profile sample may remain useful in another environmental profile. Its provisional floor is not presented as measured nonzero value.
- Only an existing integer outside the mapped uncertainty band is eligible for repricing; D49 exclusions and the six-point refund cap remain unchanged.

Complete fingerprints, raw outcomes and the historical evidence hashes are in [the decision record](production-upgrade-0.002-prices.json) and [the campaign report](production-upgrade-0.002.json).
