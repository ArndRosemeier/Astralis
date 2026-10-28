# Production special hook audit

After the pre-roster research pass, the actual game engine was audited before the full paired-seed validation. The audit exposed missing effects and two concrete generation/habitability defects; the owning engine implementation was corrected, and the regression cases were retained.

Run the behavioural checks with:

```text
pnpm exec tsx --test packages/balance/test/production.test.ts
```

The 15 checks pass on the engine loaded for the first production tournament. These are behaviour checks, not source-text matching.

The final suite has expanded to **36 balance/controller/production checks**, all passing after the frozen production pass and active price update. It additionally isolates bombardment from defensive batteries, prevents weak AI attacks into known batteries, verifies genetics research timing and retains the stolen-research collision regression. The original 15-check statement records the first audit stage.

| Special | Observed production behaviour |
|---|---|
| Subterranean | A thermal/radiation stress fixture improves in habitability; population bombardment leaves more survivors. |
| Photosynthetic | A G-star colony has no building upkeep and grows faster; an M-star colony retains upkeep. |
| Spore-borne | A colony ship costs 60 instead of 100 industry; its founded colony begins with fewer inhabitants. |
| Hive mind | Stability remains 75 despite high tax, debt and integration stress. |
| Terraformers | A terraforming step costs 60 instead of 100 industry and a fully funded step finishes in two turns instead of three. |
| Genetic plasticity | Genetic Survey costs half as much; after Adaptation III there are temperatures where final thermal tolerance is better. |
| Electrosense | Actual detection range is 1.5 times the reference. |
| Radiotrophic | Irradiated worlds improve over the Resistant prerequisite; clean homeworld capacity remains unchanged. |
| Cybernetic | A damaged ship repairs away from friendly colonies and colony upkeep is higher. |

Additional checks prove replay identity and a real turn-limit result, and retain the Random-region moon-ID regression.

## Fixed defects found by the audit

- A moon's generated ID could duplicate an earlier planet ID when orbit placement had rejected a candidate. The production batch caught `ross-318-generated-2` on seed `PRODUCTION-PAIR-191838`, Random region. Moon IDs now derive from their parent planet ID.
- Radiotrophic incorrectly assigned a radiation penalty to pristine worlds, reducing the reference homeworld cap from 12.5 to 8.75 bn. Its clean-world regression now requires equal capacity.
- Detection, photosynthetic growth, subterranean casualty protection and several secondary special effects were initially absent. The owning engine added the hooks before the tournament.

## Limits of the checks

These targeted fixtures ensure every special changes the actual simulation somewhere appropriate. They do not establish a fair price or prove every interaction. Government constraints and point spending are covered by the pick validator; end-to-end power estimates come from `production.ts`. In particular, a working terraforming discount is useless to a controller that never orders terraforming. A low measured effect can therefore diagnose AI incompetence as well as a weak special. The tournament records actual outcomes rather than assuming that passing a hook test means a balanced species.
