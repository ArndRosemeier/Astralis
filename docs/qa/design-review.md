# Astralis usability and visual review

Reviewed 28 October 2026 from `tmp/qa/title.png`, `map.png`, `empire.png`
(1440 × 1000), `mobile.png` (390 × 844), current web UI sources, and the
twelve final portrait assets. This is a screenshot/source review, not a claim
that the reviewer personally exercised the live browser flows.

The five findings below are actionable against the requested premium science-fiction
presentation and the design document's readability, map-planning and optional-help
requirements. Source references describe the reviewed snapshot; implementation
may continue while the owner runs browser QA.

## 1. P1 — Two map overlays promise information they do not display

**Evidence:** The map offers **Sovereignty**, **Habitability**, and **Supply network**.
In `apps/web/src/StarMap.tsx`, only `overlay === 'political'` has a rendering branch.
The other choices revert to spectral star colors. Supply-neighbor lines are built
for every overlay, and no habitability calculation, habitability legend, or supply
range boundary is rendered. The screenshot therefore cannot communicate which
destinations fit the player's biology or lie within fuel support.

**Fix:** Give each mode a distinct, rules-derived visual language and a small
persistent legend. Habitability should summarize the best *observed* world for the
current species without revealing hidden worlds. Supply should show actual supply
nodes and reachable range, with selected-fleet exceptions explained. Preserve real
spectral colors through a separate core/star layer where possible.

**Verify:** On one fixed seed, switch through all three modes and capture different,
meaningful views. Compare at least one known habitable, one hostile, one reachable,
and one out-of-range destination with the underlying rules. Repeat with a second
species. Legends must explain colors through text as well.

## 2. P1 — Reduced motion does not stop the title's JavaScript movement

**Evidence:** `settings.motion` respects the OS preference initially and CSS disables
transitions, but `StarMap.tsx` still updates `titleMix` every animation frame and
lerps the title camera/target independently of `p.motion`. Consequently the title
logo stars and the title-to-map transition move even when the user selects a
stationary experience. The selected-system ring is positioned at the final real
coordinate while the stars are still moving, which can also temporarily separate
the selection ring from its labeled star.

**Fix:** With motion disabled, snap `titleMix`, star placement, camera, and control
target to their intended states. With motion enabled, keep selection overlays
attached to the interpolated selected star, or enable map interactions only when
the short transition has settled. The stationary option should be literal.

**Verify:** Emulate `prefers-reduced-motion: reduce`, open the title, and start a
game. Capture frames separated by a second: no automatic camera/logo motion.
Toggle the setting during play and verify it takes effect immediately. Under
normal motion, the selection ring must remain centered on the selected star.

## 3. P1 — Critical metadata is too small, and mobile scaling is overridden

**Evidence:** At the 14px desktop root size, rail labels and resource headings use
`.57rem` (about 8px), planetary metadata `.64rem` (about 9px), and some status tags
`.49rem` (under 7px). These are visible in the screenshots as miniature technical
annotation, including information needed to choose a planet. The sci-fi display
face is effective for headings, but these tiny labels turn ordinary use into
close inspection. Additionally, `style.css` sets `:root { font-size:12px }` below
650px, overriding the earlier `calc(14px * var(--ui-scale,1))`. The interface-scale
setting therefore does not enlarge text on a phone.

**Fix:** Establish a practical minimum for actionable labels and metadata (roughly
11–12px), with body explanations around 14–16px. Retain Oxanium for display/navigation,
but favor Space Grotesk for dense numeric explanations. Apply `--ui-scale` in every
breakpoint and let panels reflow/scroll when enlarged instead of silently
discarding the accessibility setting.

**Verify:** Compare 100% and 135% interface scale at both 1440px and 390px widths.
Computed text sizes must increase on both. Check 200% browser zoom, planet rows,
resource headings, and disabled reasons for clipping or disappearing controls.

## 4. P2 — Touch navigation hides the names of nine unfamiliar destinations

**Evidence:** On the 390px screenshot the left rail is entirely glyphs. The mobile
rule `.rail button { font-size:0 }` hides names while keeping nine primary
destinations plus Manual and Settings. `title` and `aria-label` help mouse/screen
reader users, but a sighted touch player has no persistent indication of what the
chip, target, crown or radio glyph opens. A tooltip requiring hover is not a touch
explanation. The always-expanded system sheet also competes with the remaining map
area, so the user's first view is dense with unlabeled actions.

**Fix:** Keep text labels for the most common actions, and move less frequent
destinations into a labeled **More** drawer, or make the rail expand into a named
menu on tap. Provide a clear collapsed/expanded state for the system sheet so the
player can deliberately prioritize map exploration. Preserve adequate touch targets
and keep the selected destination name visible.

**Verify:** At 390 × 844 with no keyboard/mouse, a new player must be able to find
Research, Fleets, Diplomacy, and Manual without guessing glyphs. They must also be
able to expose most of the map and restore the selected world's details in one
obvious action. Check the same flows with interface scale enlarged.

## 5. P2 — Manual search can show an unrelated chapter as if it matched

**Evidence:** `Manual` in `apps/web/src/Panels.tsx` filters the chapter navigation
using `query`, but renders `MANUAL[section]` regardless of whether that section is
still in the results. Searching for a term absent from the current chapter leaves
the old chapter displayed; searching for nonsense leaves an empty navigation and
the same unrelated article, with no explicit empty-result state. This weakens the
in-game rulebook precisely when a new player is trying to resolve uncertainty.

**Fix:** On search, either select the first matching chapter automatically, or
present a genuine results view with chapter excerpts and links. When nothing in
chapters, technologies, or buildings matches, show **No results** with a clear
reset/search suggestion. Do not leave stale content looking like a search result.
Add query highlighting and a useful keyboard focus order.

**Verify:** Search for a term in a different chapter, a technology name, a building
name, and a nonsense string; then clear the query. The visible article/results,
selected navigation item and result count must agree in every case.

## Notes to avoid stale or misleading findings

- The screenshots were taken before the current `.planet-list` 210px desktop /
  125px mobile cap and before `SystemView` was added. The original long Sol list
  hiding colony actions is therefore **not** reported as an unresolved defect.
  Retake the map/mobile screenshots to confirm the new hierarchy.
- `empire.png` shows the entire dialog unusually dim. The source has a 250ms
  `panel-in` opacity animation. The image may have been captured during that
  animation, so this is **not** sufficient evidence of a persistent contrast bug.
  Retake after animations settle or with reduced motion enabled.
- The twelve final species portraits were visually reviewed together in
  `docs/assets/portrait-review.jpg`: framing, common light direction, distinct
  silhouette, anatomy and absence of baked-in labels are consistent. No portrait
  regeneration is warranted from this review.
- A useful next enhancement after the five issues is a compact turn-readiness
  checklist: idle research, empty construction and available colony ships should
  link directly to the corresponding action. The current passive research dot
  and modal tutorial require the player to infer the next productive step.

No application source files were changed by this review.
