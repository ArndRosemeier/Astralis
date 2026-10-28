# D49 — Subterranean price and Hive combination constraint

This autonomous balance decision follows the user's request to establish special costs through simulations before finalizing species, and the documented requirement to redesign strongly super-additive combinations.

**Final status:** the frozen-engine production pass is complete and active prices are **Subterranean 7, Hive mind 5**, with the mutual exclusion enforced. The earlier four-point Hive estimate below is retained as iteration history; it is superseded by [the applied final prices](final-prices.md).

## Evidence

The first actual-engine tournament used 24 independent map seeds, both seats and six policy styles. It found Hive mind +98.17% terminal score, Subterranean +26.98%, and a +64.41 percentage-point pair residual. Its AI was subsequently improved to manage ordinary empires' administration and actually use the special mechanics.

The improved-controller tournament again used 24 seeds and both seats: 576 games, 69,120 invariant-checked turns and 1,270 observed battles. Engine and controller fingerprints remained unchanged during the run. It found:

| Effect | Mean paired score change | 95% seed interval |
|---|---:|---:|
| Hive mind | +18.54% | +14.24% … +22.84% |
| Subterranean | +41.46% | +29.81% … +53.11% |
| Hive + Subterranean interaction residual | +19.93 percentage points | +15.04 … +24.83 |

The Hive administrative advantage became much less extreme once ordinary empires behaved competently, but the pair remained clearly super-additive. Its individual effects are preserved; the species-building constraint is redesigned.

## Decision

1. **Hive mind and Subterranean are mutually exclusive.** This is enforced by the pick validator, with a behavioural regression test. A larger point budget does not override the exclusion.
2. **Subterranean is planned at seven points**, using the existing convention of one point per roughly 5% multiplicative score increase: `round(log(1.4146) / log(1.05)) = 7`. Its interval corresponds to approximately five to nine points, so the data does not justify claiming an exact optimal integer.
3. Hive mind's four-point price remains conservative relative to the improved estimate (roughly three to four points).
4. The active generated cost table is not changed until the owner freezes the remaining simulation changes and reruns the production audit. The final record must identify the engine/controller revision supporting the live table.

The exclusion applies to new custom species. No current predefined species combines both specials. Diagnostic tournaments may still execute the forbidden pair directly to preserve evidence about why it is excluded.

## Corundi roster adjustment recommendation

At Subterranean seven, the current Corundi selection costs fourteen: Lithic four + Technocracy two + Subterranean seven + Commerce one. A coherent ten-point replacement is:

`Lithic (4) · Subterranean (7) · Autocracy (0) · Industry −1 (refund 1) = 10`

The Industry drawback must actually offset the frame's built-in Industry +1; otherwise this is an invalid free refund. The owning engine is correcting the aptitude calculation to apply the selected aptitude to the frame bonus. The package retains ancient, slow-growing underground life while trading its industrial advantage for broader environmental resilience. The government change must be documented in the final species definition; governments remain fixed throughout a game.

A simpler alternative retains Technocracy and removes Subterranean, but would leave the roster without a dedicated example of that special. The stronger recommendation above preserves the species' distinctive mechanical identity. These are roster recommendations, not edits to the owner's species file.

## Limits

This decision concerns measured special pricing and one demonstrated exploit combination. It does not certify all species, frames, free environmental profiles or victory configurations as balanced. Profiles and actual post-adjustment species still require their own validation, and the new price must be checked against the final engine revision rather than quietly copying an obsolete research estimate.

## Final frozen-engine confirmation

The final pass fingerprinted every TS/JSON module in `packages/sim/src`, the AI controller, catalog and price inputs. It completed **576 games, 69,120 invariant-checked turns and 6,387 battles** without a source change or invariant failure. Subterranean measured +39.65% score (95% seed interval +27.29% … +52.02%), supporting seven points. Hive mind measured +25.36% (+15.20% … +35.51%), supporting five points. The forbidden pair still had a significant +18.17 percentage-point residual (+5.29 … +31.05), so the exclusion remains justified. The active table was then written by the guarded finalizer. Raw results and uncertainty remain available in `production.json` and `final-prices.json`.
