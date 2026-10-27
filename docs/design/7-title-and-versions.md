# Astralis — Versions, "What's new" and the title screen (detail)

Part of the design plan ([design.md](../design.md) §16, §19). Draft, planning only.

## 1. Versions (D39)

- **The first build is 0.001.** Every build adds **0.001**: 0.002, 0.003, … A deliberate
  milestone may pin its own number (e.g. 1.000 at release); later builds count on from there.
- **One build = one change merged to `main`.** Each merge adds exactly **one changelog entry
  file** to `apps/web/src/changelog/entries/`, named `YYYY-MM-DD-HHMM-short-slug.md` (UTC time of
  the merge). The version is the entry's position in name order. Parallel branches never edit the
  same file, so they never conflict over the version.
- An entry is an optional `# Headline` plus `- ` bullet lines **written for players** (what they
  will notice), never for developers. Entries are never edited afterwards.
- This is the mechanism StarLord already uses (`changelog.ts`, about 50 lines), taken over as
  infrastructure (D7).
- The version is **shown** on the title screen (corner badge), in settings, and in bug reports.
- The version is **recorded** in every save and game record. Loading a save from another
  version warns if the rules changed.
- **Multiplayer requires the same version** for all players, because lockstep only works with
  identical rules. The lobby shows a mismatch clearly ("Your friend has 0.214, you have 0.213:
  reload the page").

## 2. "What's new" (D40)

- A **"What's new" button** on the title screen, next to the version badge. It shows a small
  glowing dot when there are entries the player hasn't seen yet (last seen version stored in the
  browser).
- It opens a dialog listing releases **newest first**: version, date, headline, bullets.
- After an update, the first visit opens a compact toast: "Updated to 0.042: 3 changes", which
  links to the dialog.
- The dialog is also reachable from the in-game menu.

## 3. The title screen (D41)

The first impression. Like StarLord's living title screen in principle (playful, interactive,
lots of effort), but **realistic**: no warp jumps, no laser zaps from nowhere, no space
monsters. The fun comes from real physics and real stars.

### 3.1 The signature idea: the logo is made of real stars

- The background is the **real night sky:** the Milky Way panorama from the Gaia all-sky map
  (ESA/Gaia/DPAC, CC BY-SA 3.0 IGO, credited) plus the catalog stars of the game's neighbourhood
  rendered in 3D.
- On load, the **actual stars of the map** (Sirius, Alpha Centauri, Barnard's Star, Tau Ceti, …)
  drift out of their true positions and **assemble the ASTRALIS logo**, each letter traced by
  stars in their real spectral colours. The logo slowly breathes and twinkles.
- On **New Game**, the letters dissolve and every star flies back to its **true 3D position**.
  The camera pulls back, the reference plane and distance rings fade in, and the title screen
  *becomes* the star map of game setup, without any cut.
- This reuses the map renderer, so the effort spent on the title also builds the core map
  (it belongs in the P0 map prototype).

### 3.2 The living scene

Between logo and menu, a slow cinematic camera drifts past a real-looking system: a red dwarf
with tight star-locked worlds, then a Sun-like system with a gas giant, alternating every
minute or two. Things happen there, all physically plausible:

| What flies | Behaviour |
|------------|-----------|
| **Fusion-torch ships** | long, bright exhaust plumes; halfway through a trip they do a **flip-and-burn** (turn around and decelerate), as real ships would |
| **Laser-sail probes** | a tiny glittering sail pushed by a visible laser beam from a station |
| **A generation ship** | huge, slow, spinning for gravity, crossing in the far background |
| **Habitat rings** | turning slowly over a planet, lights on the night side |
| **Gardener ruins** | a faint ancient structure near a moon that shimmers occasionally, as a hint of the mystery |

### 3.3 Toys (the playful part)

| Action | What happens |
|--------|--------------|
| **Click a star** | it flares; a small **Starfacts card** pops up with a real fact ("Barnard's Star, 5.96 ly: the fastest-moving star in our sky") |
| **Click a ship** | it **hails you** through the tanglelink: a funny line from its (placeholder) species, shown as a comm window |
| **Double-click a ship** | it does a show-off manoeuvre: flip-and-burn, a gravity-assist swing around a moon, or a formation break |
| **Click empty space** | a laser-sail probe launches from the nearest station towards where you clicked |
| **Drag** | rotate the neighbourhood; the idle rotation resumes after a while (like the map, D3) |
| **A secret code** | (the StarLord tradition) **"Lift the Veil":** a shimmering curtain sweeps across the sky and reveals, for a few seconds, the Gardeners' ancient lattice connecting the stars |
| **Leave it alone for 5 minutes** | a stellar flare erupts from the red dwarf; shields on the habitat rings light up |

### 3.4 Tanglelink chatter (news ticker)

A ticker at the bottom: **"Tanglelink chatter"**, humorous headlines that mix real astronomy with
the setting. All names original, never StarLord's or MOO2's. Examples:

- "Proxima b residents advised to wear hats during flare season. Again."
- "Tau Ceti planets formally protest being called 'candidates'"
- "Generation ship *Patience* arrives at Ross 128 after 312 years; crew asks if anything happened"
- "Flip-and-burn champion completes manoeuvre in 4.2 seconds, loses lunch in 4.3"
- "Astronomers confirm: the night sky is, in fact, not empty. Gardeners unavailable for comment"
- "Red dwarf tourism board: 'Our planets are always facing the right way'"

### 3.5 The menu

New Game · Continue · Load · Online · Species editor · Starfacts (encyclopedia) · Settings ·
Credits, plus the **version badge** and **What's new** button in a corner.

- The menu stays visually calm (one clean panel). The spectacle is around it, not in it.
- **Continue** jumps straight into the last game.

### 3.6 Sound

A title theme (ambient orchestral/electronic) building up as the logo assembles, soft engine
rumble from passing ships, a crystalline chime when clicking stars, and the comm-window
"tanglelink click" for hails. Cinematic but subdued (D28). Sound starts only after the first click
(browser rule) and has a visible mute button.

### 3.7 Quality and accessibility

- `prefers-reduced-motion`: a still hero image with the assembled logo, no camera drift.
- Low-end devices: fewer ships and particles, no generation ship (auto-detected, also in settings).
- The logo assembly is skippable (any click or key).
- Loading budget: the menu is usable within 2 seconds; the 3D scene streams in behind it.
- Like every user-visible slice, the title screen counts as done only when the **published**
  build has been opened and used: every toy clicked, the console clean.

## 4. When it is built

| Phase | Part |
|-------|------|
| P0 | version + changelog + What's new from the very first build (0.001); the constellation logo as part of the map prototype |
| P1–P2 | a simple title with the real-sky background, logo, menu and ticker |
| P3 | the full living scene, toys, sound and the seamless transition into game setup |
