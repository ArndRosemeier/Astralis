# Astralis — Design Plan

**Status:** accepted specification v0.8, implemented as build 0.001. See [implementation decisions](implementation.md), [verification](verification.md) and [measured balance](balance/final-prices.md).
**Changes in v0.8:** build versions from 0.001, a What's new button, and a hero title screen (D39–D41, new detail doc 7).
**Changes in v0.7:** governments fixed per species (D36); Concord votes purely by population (D37); the other
questions Q29–Q46 accepted (D38). Only Q16 (title) remains open.
**Changes in v0.6:** six detail documents (below); new questions Q29–Q46 in §23.

**Detail documents** (this file stays the overview):

| Document | Covers |
|----------|--------|
| [1-research.md](design/1-research.md) | rules, costs and pacing, all six fields tier by tier, Gardener studies |
| [2-economy.md](design/2-economy.md) | population caps, growth, output, taxes, upkeep, stability, buildings, projects, deposits, start state |
| [3-governments.md](design/3-governments.md) | the 7 governments, mature forms, changing government |
| [4-ships.md](design/4-ships.md) | hulls, power, mass, weapons, defence, costs, fleet capacity, experience, designer |
| [5-diplomacy.md](design/5-diplomacy.md) | contact, states, attitude, agreements, reputation, AI personalities, the Concord |
| [6-ground-combat.md](design/6-ground-combat.md) | invasion orders, troops, resolution, special worlds, conquest, bombardment, impactors |
| [7-title-and-versions.md](design/7-title-and-versions.md) | build versions, What's new, the hero title screen |

**Changes in v0.5:** every open question with a recommendation accepted (D21–D35). Only Q16 (title) remains open.
**Changes in v0.4:** Q24 decided with loose fairness (D19); star-locked worlds have less usable surface (§4.2);
compact systems and system links (§7.8) even out the odds for red dwarfs (D20).
**Changes in v0.3:** Q17, Q18, Q21, Q25 decided (D15–D18); crews hibernate in transit; Q24 reworded.
**Changes in v0.2:** strategy-driven 3D combat (§10, replaces the tactical grid); a full species stat sheet and
pick system (§5, the roster moved to Appendix A); deterministic math library (§19.3); Q5 and Q7 accepted.
**Working title:** Astralis (the folder name, can change).
**How to use this document:** decisions already made are listed in §0.1 as `D#`. Open questions are
`Q#`, each with a recommendation; the full list is in §23. Answer by number ("Q4: yes, Q7: option b")
and I'll fold the answers in and bump the version.

---

## 0. Summary

A 4X game in the spirit of Master of Orion 2, set in our real stellar neighbourhood, shown in 3D.
Same core loop (explore, expand, exploit, exterminate), plus three things MOO2 couldn't have:

1. **A real map.** Real stars at their real positions. Known exoplanets are where astronomers found
   them. Every gap is filled each game with planets we can't detect yet, so the map is real and
   still different every game.
2. **Biology-driven species.** Each species has its own physical needs (temperature, gravity,
   atmosphere, light, radiation). So *which* planets are good depends on who you are. That shapes
   expansion, competition and diplomacy far more than MOO2's mostly shared planet scale.
3. **Physics as the clock.** Everything is sublight. One turn is 5 years, and nothing moves faster
   than 5 light-years per turn. Distance really matters, terraforming takes centuries, and a
   species' lifespan becomes a game trait.

It must be **more accessible than MOO2.** Every number explains itself, empire-wide controls replace
micromanagement, and complexity is revealed gradually.

### 0.1 Decisions so far

| ID | Decision |
|----|----------|
| D1 | Original planning gate; implementation authorized by the owner on 2026-10-28 (D42). |
| D2 | Real stellar neighbourhood in 3D. Real planets where known, invented ones elsewhere. |
| D3 | The 3D map slowly rotates by default for depth perception and stops when the player does something. |
| D4 | No FTL travel. 1 turn = 5 years, so the hard speed cap is 5 ly/turn (c). Early ships are much slower. |
| D5 | Aliens are part of the game, so Earth isn't the centre. Lore: an elder race uplifted the local cluster (Earth included), so everyone starts at roughly the same tech level. |
| D6 | Real-time communication through quantum-entanglement links (fiction, but not absurd). |
| D7 | New codebase, so it doesn't become "StarLord in 3D". Infrastructure carries over: GameHub networking, the three.js layer, deterministic-sim patterns, tooling. |
| D8 | Battles from the start (now in the form of D10). Automation of the other areas (colonies, research, …) comes later. |
| D9 | A large species roster, bigger than MOO2's 13. |
| D10 | Combat: players build **strategies** in a strategy editor (defaults included), assign them to ships and **watch** a real-time 3D battle. No ship-by-ship orders. |
| D11 | Species are built MOO2-style from **points spent on picks**, with better balance than MOO2. The stat sheet is fixed first (§5); the actual roster comes later. |
| D12 | (Q5) Light delay applies to telescope views; own assets are live through tanglelinks. On by default, can be switched off. |
| D13 | (Q7) No food resource. |
| D15 | (Q17) A ship gets a strategy when it is built (the design's default) and it can be changed **any time as a normal order during your turn**, but there is **no pre-battle step**. Battles never pause or hold up the game. |
| D16 | (Q18) No intervention while watching a battle. |
| D17 | (Q25) The 8 aptitudes are Industry, Research, Commerce, Piloting, Troops, Espionage, Diplomacy, Stability. |
| D18 | (Q21) Crew g-tolerance affects battle acceleration only. Between stars, crews are in **hibernation**, so species make no difference to travel speed. |
| D19 | (Q24) The environment profile is free. Fairness is **loose**: placement rejects only extreme starts. Lucky draws are allowed, just not overwhelmingly so (§5.6). |
| D20 | Red dwarf worlds are not colder (their planets just orbit much closer). Their drawbacks are star-locking (less usable surface), flares and dim light. Their advantage is **compactness**: trade and logistics inside a tight system are far more efficient (§7.8). |
| D21 | (Q1) Brown dwarfs and white dwarfs are included as minor systems. |
| D22 | (Q2) v1 offers Sol-centred maps and random regions. |
| D23 | (Q4) Drive tier 1 = 1 ly/turn (0.2 c). |
| D24 | (Q6) Time dilation is flavour only in v1. |
| D25 | (Q10) Heat in battle is built switchable and tested with and without. |
| D26 | (Q11) Concord laws come later, not in v1. |
| D27 | (Q12) The Approach (late-game threat) is an option, on by default. |
| D28 | (Q13) Sound in space is cinematic, but subdued. |
| D29 | (Q14) No stockpiled strategic resources in v1; deposits are local bonuses. |
| D30 | (Q15) Default game length 120 turns (600 years). |
| D31 | (Q20) Species budget 10 points, refunds capped at 6, then calibrated. |
| D32 | (Q22) All three frames (Carbon, Lithic, Synthetic) are in the sheet from the start. |
| D33 | (Q23) Drones/fighters come later; v1 has lasers, kinetics, missiles (and particle beams). |
| D34 | (Q26, Q27) System links have all four effects; star-locked usable surface ×0.4/×0.6 with the listed exemptions, as a start. |
| D35 | (Q28) Links to foreign colonies with a trade treaty give both sides half the system-trade bonus. |
| D36 | (Q35, Q36) **Governments are fixed per species**, as in MOO2: a pick on the species sheet, never changed during a game. Only Constitutional Reform turns it into its mature form. |
| D37 | (Q41) Concord votes are **by population only** (1 per bn), with no modifiers. |
| D38 | Accepted as recommended: Q29–Q34, Q37–Q40, Q42–Q46 (relativistic impactors on by default). |
| D39 | **Versions from the first build:** 0.001, then +0.001 per build (one build = one merged change with one changelog entry). Shown on the title screen, stored in saves, required to match in multiplayer. |
| D40 | A **What's new** button from the start, listing every build's player-facing changes. |
| D41 | A **hero title screen**, playful and made with a lot of effort, like StarLord's in principle but realistic: the logo is assembled from the map's real stars and dissolves into the star map on New Game. |
| D14 | The sim uses a deterministic math library (fdlibm-derived, see §19.3) for anything beyond + − × ÷ √. |

---

## 1. Vision and pillars

1. **Real, then fun.** Start from real astronomy and bend it only where it would hurt play. Each
   bend is a named rule (QE comms, Gardener tech), never a quiet inconsistency.
2. **Readable at a glance.** A new player understands a planet, a colony or a battle from one icon
   or number plus a tooltip that explains why. Depth is optional, never required.
3. **Distance is the main resource.** Sublight travel makes geography the strategy: who is close,
   what can be reached, what can be defended.
4. **Every species plays differently,** because each wants different worlds, not just because of
   +10% modifiers.
5. **Light on micromanagement.** Empire-wide decisions, colony focuses and queues. No farmer-dragging.
6. **Same architecture discipline as StarLord.** A deterministic sim, commands only, the AI plays
   with the same interface as the player, and every game is a replayable record.

### 1.1 Non-goals (for v1)

- Relativistic simulation beyond flavour (time dilation only appears in tooltips; see §6.6).
- A galaxy beyond a few hundred stars.
- Real-time (pausable) gameplay. Turn-based it stays.
- Stockpiled strategic resources in the style of Stellaris (D29).

---

## 2. Setting and lore

### 2.1 The Gardeners (working name)

Long ago an elder civilisation, the **Gardeners**, tended a bubble of the galaxy roughly 100 ly
across. They seeded, nudged or transplanted life on many worlds and gently **uplifted** the most
promising species. They then hid the whole bubble behind the **Veil**: a quiet suppression of
signals and of large-scale spaceflight. This is the zoo hypothesis made literal. It explains why
the sky looked empty to Earth's radio telescopes.

**Game start: the Veil fails.** Every uplifted species suddenly finds that its long-dormant
Gardener "starter kit" works. That kit is a bootstrap package of fusion drives, entanglement links
and habitat basics, hidden on each homeworld or in its system. So all species reach space within
the same generation, with roughly equal technology.

What the lore gives the game:

- **Equal start** without coincidence.
- **Odd homeworlds explained.** For example, a species living around the young star Epsilon Eridani
  (400–800 million years old, too young for evolved life) was *transplanted* there.
- **Gardener ruins** for exploration rewards, artifacts and a Legacy victory (§15).
- **Custodians,** automated Gardener guardians, as the "monsters" (§14.2).
- **A late-game threat** that fits the theme (§14.3): the Veil existed for a reason.
- **QE comms** as Gardener tech that every species now has (§6.4).

### 2.2 Calendar and tone

- Year display: "Year 0 after the Veil", with 5 years per turn. Earth CE as an option.
- Tone: grounded hard SF with a little mystery. No space magic before the late game. Gardener
  artifacts are the only exotic physics (late shields, the limits of entanglement).

---

## 3. The map

### 3.1 Data sources (offline build, curated JSON committed to the repo)

| Source | Use | Licence |
|--------|-----|---------|
| HYG database v4.x (Hipparcos + Yale + Gliese) | positions, spectral types, proper names | CC BY-SA 4.0 (attribution, share-alike on the data file) |
| Gaia DR3 Catalogue of Nearby Stars (GCNS, 100 pc) | precise positions, faint red dwarfs, larger regions | free with acknowledgement |
| RECONS / literature lists | completeness within ~10 pc, multiplicity (which stars form one system) | facts, curated by hand |
| NASA Exoplanet Archive (PSCompPars) | confirmed planets: mass/radius, orbit, eccentricity | public, acknowledgement requested |
| Brown dwarf lists (e.g. Luhman 16, WISE 0855) | dim minor systems | facts |

The pipeline runs **offline** (`catalog` package script), never in the browser. It produces:

- `systems.json`: one entry per gameplay system. Multiple stars are grouped (Alpha Centauri A+B+C
  is one system). Each entry has galactic x/y/z in ly, the stars' spectral class, mass, luminosity,
  temperature, age estimate where known, metallicity where known, proper and catalog names, and an
  "observation depth" flag (how well-surveyed the system is, which limits what may be invented).
- `planets.json`: confirmed planets with parameters, plus *candidates* flagged as uncertain (for
  example the Tau Ceti candidates). Each game's seed decides whether a candidate exists.

**Brown dwarfs and white dwarfs (D21)** are included as minor systems (cold, dark, rich in fuel and
ruins). They are real, odd and atmospheric: Sirius B, Procyon B, 40 Eridani
B, Luhman 16.

### 3.2 Map size and region

The game selects a **sphere of radius R** around a centre point. Approximate system counts (to be
checked in Phase 0 against the catalog):

| Setting | Radius | ~Systems | Suggested players |
|---------|--------|----------|-------------------|
| Small | 15 ly | ~35 | 2–3 |
| Medium | 20 ly | ~75 | 3–5 |
| Large | 25 ly | ~140 | 5–8 |
| Huge | 32 ly | ~300 | 8–12 |

(For comparison: a huge MOO2 galaxy had 72 stars.)

**Region option** (big replay value from a fixed map):

- **Sol-centred** (default): our home sky. Sirius, Procyon, Altair, Alpha Centauri.
- **Random region:** centred on a random point inside the 100 pc Gaia catalog. Every region is
  real, but most players have never seen it, and fewer of its planets are known, so more is
  invented. Sol may not even be on the map. That is fine; humans then start elsewhere (§5.6).
- **Named scenarios** (later): e.g. "The TRAPPIST frontier", centred 40 ly out.

**Decided (D22):** v1 has Sol-centred maps plus random regions; the pipeline handles both at almost no
extra cost.

### 3.3 Planet generation per game

For each system, seeded:

1. **Place known planets** exactly as catalogued, with missing values (radius vs. mass) estimated
   by standard mass-radius relations at build time.
2. **Resolve candidates** with their published confidence as the probability.
3. **Fill the gaps** with invented planets that respect:
   - **orbit stability:** spacing between neighbouring orbits; in binaries only S-type orbits
     (around one star, inside ~1/3 of the separation) or P-type orbits (around both, beyond ~3× the
     separation);
   - **detection limits:** invented planets in a well-surveyed system must lie below what radial
     velocity or transit surveys would have caught. A cheap approximation per observation depth:
     a cap on mass by orbit radius. A poorly surveyed faint red dwarf may hold almost anything;
     Alpha Centauri A/B only small or distant planets;
   - **star-type statistics:** red dwarfs get many small rocky planets in **very tight** systems
     (TRAPPIST-1's seven planets all orbit within 0.062 AU), few giants; Sun-like
     stars a mix; white dwarfs remnants and debris; brown dwarfs moon systems;
   - **frost line and habitable zone** from luminosity: rocky inside, icy and giant beyond.
4. **Moons:** gas and ice giants get 1–4 *significant* moons (Europa, Titan and Ganymede analogues
   are prime real estate); rocky planets occasionally get one.
5. **Belts:** asteroid belts and Kuiper-type belts (mining, habitats).
6. **Specials:** resource deposits, native biospheres, Gardener ruins, Custodian sites (§14).

**Discovery mechanic:** at game start you know what astronomy knows: real confirmed planets within
your telescope range, plus your own system. Invented planets appear only when your telescopes get
better (research), when a probe visits, or when you get maps through diplomacy. *Exploration feels
like doing astronomy.*

### 3.4 Star naming

- Real proper names (Sirius, Altair, Barnard's Star) by default; catalog names (Gliese 1061,
  Ross 128) otherwise.
- Each species has its own names for stars. Option: "show names in my species' language", for flavour.

---

## 4. Planets: physics in, simple values out

### 4.1 Internal model (what the sim stores)

| Attribute | Values | Source |
|-----------|--------|--------|
| Type | rocky, super-Earth, ocean, mini-Neptune, ice giant, gas giant, moon, belt | catalog / generation |
| Radius, mass → **surface gravity** | g | catalog / mass-radius relation |
| Orbit, star luminosity → **temperature** | K (equilibrium + greenhouse from atmosphere) | computed at generation |
| **Atmosphere** | none, trace, thin, standard, dense, crushing | generated |
| Atmosphere **chemistry** | CO2, N2, N2/O2 (only with a biosphere), CH4/N2 (Titan-like), H2/He, NH3 | generated |
| **Hydrosphere** | none, ice, subsurface ocean, surface water partial, global ocean, hydrocarbon lakes | generated |
| **Star-locked** (tidally locked to its star) | yes/no | close orbit around red dwarfs → usually yes. (Moons locked to their *planet* still have day and night, so they don't count.) |
| **Radiation** | low/medium/high/extreme | star activity (flare stars!) and magnetosphere |
| **Light** | dim/normal/bright | star type and orbit |
| **Biosphere** | none, microbial, complex, sapient natives | generation (rare) |
| **Deposits** | metals, volatiles, rare elements, gems/exotics | generation |
| **Ruins** | Gardener site (tier 1–3) | generation |

### 4.2 Player-facing view

A player sees **one habitability rating for their own species**, as a coloured badge:

| Rating | Meaning | Population cap (base) |
|--------|---------|-----------------------|
| **Ideal** | open air, like home | 100% |
| **Good** | open air, some discomfort | 70% |
| **Harsh** | survivable with suits and shelters | 40% |
| **Hostile** | sealed domes or underground only | 15% (raised by tech) |
| **Lethal** | not even domes; only sealed undercities and habitats with tech | 0% at start, 10%+ with tech |
| **Uninhabitable** | gas giant without habitat tech, etc. | 0 |

The rating is the **worst single factor** (computed per species from its profile, §5.5) (temperature, gravity, atmosphere, radiation,
light/hydrosphere). The tooltip names it: *"Hostile — because gravity 2.3 g exceeds your
tolerance (1.6 g)."* Readable at a glance, explainable on demand.

**Usable surface:** a star-locked world has a scorching day side and a frozen night side, so surface
dwellers can only use the **twilight band** between them. Draft multipliers on the population cap
(D34):

| Situation | Usable surface |
|-----------|----------------|
| star-locked, thin or no atmosphere | ×0.4 |
| star-locked, dense atmosphere or global ocean (they spread heat around the planet) | ×0.6 |
| species with Dim light preference (adapted to twilight) | one row better |
| Subterranean species, subsurface-ocean dwellers, orbital habitats | ×1 (not affected) |

The tooltip shows it as one line: *"Twilight band only: ×0.4 population cap."*

Plus 3–4 icons: size, main deposit, special (ruins/natives), star-locked.

Familiar labels for flavour: Garden, Ocean, Desert, Tundra, Ice, Volcanic, Greenhouse (Venus-like),
Barren, Eyeball (tidally locked), Titan-like, Mini-Neptune, Gas giant, Ice giant, Belt. These
describe the world; habitability is always per species.

### 4.3 Improving habitability (the progression)

Three tools with different speeds:

1. **Habitat tech** (fast, empire-wide): domes → arcologies → sealed undercities → orbital
   habitats. These raise the population caps of Harsh/Hostile/Lethal worlds. This is the main early
   and mid-game growth path, because realistically almost nothing is Ideal.
2. **Terraforming** (slow, per planet, very realistic with 5-year turns): projects that move
   temperature or atmosphere one step toward your ideal, taking 3–10 turns (15–50 years) each. A
   full transformation takes centuries. Gravity can't be terraformed.
3. **Genetic adaptation** (species-wide, research): widens your tolerance ranges (e.g. gravity
   +0.3 g, cold tolerance). Humans and other "adaptive" species get it cheaper. Over the game,
   species slowly grow into their new worlds. That is a theme MOO2 never had.

**Planet size vs. gravity trade-off:** big super-Earths have lots of surface (a high cap) but
punishing gravity. Heavy-world species love them.

---

## 5. Species: the stat sheet and the pick system

Which species ship is decided later; draft concepts are in Appendix A. **This section fixes what a
species *is*:** the stats every species has, and the MOO2-style point system that builds them.
Every predefined species is built with the same points as a custom one, so the editor can express
all of them.

### 5.1 Overview of the sheet

| Part | What it is | Costs points? |
|------|-----------|---------------|
| **A. Frame** | basic biology: Carbon, Lithic, Synthetic | packaged cost |
| **B. Environment profile** | temperature, gravity, chemistry, medium, light: *which* worlds suit them | **no** (sideways choice) |
| **C. Tolerances** | how *broad* their comfort zone is, radiation, dome hardiness | yes |
| **D. Life cycle** | reproduction, lifespan | yes |
| **E. Aptitudes** | 8 ratings from −1 to +2 | yes |
| **F. Science style** | Rigid / Normal / Creative | yes |
| **G. Origin** | starting situation (one) | yes |
| **H. Specials** | unique abilities (several allowed) | yes |
| **I. Society** | government (fixed for the species), attitude to other species | government yes |
| **J. Look** | name, portrait, ship style, star-name language | no |

**Budget (draft):** 10 points. Drawbacks refund points, but **at most 6** in total. All costs
below are *starting values*. The real costs come from measurement (§5.13).

### 5.2 A. Frame (basic biology)

| Frame | Built-in | Locks | Draft cost |
|-------|----------|-------|------------|
| **Carbon** (default) | — | — | 0 |
| **Lithic** (silicon-based) | radiation Resistant; may pick Hot/Infernal temperature without penalty; built-in Industry +1 | reproduction fixed Very slow, lifespan fixed Ancient | ~0 (balanced package) |
| **Synthetic** (machine minds) | chemistry axis ignored (no breathing); immune to disease and bio-weapons; **population is built** with industry instead of born (a colony "assembles" pop at a rate set by its industry) | no reproduction stat, no genetic adaptation (uses "chassis upgrades" research instead), Stability −1 built-in | ~3 |

A frame is a package. Its net cost is calibrated as a whole, like any pick.

### 5.3 B. Environment profile (free, but decisive)

Five axes. Each species picks **one value per axis**. These choices cost nothing; they decide which
worlds are good. Their value depends on the map, and that is balanced by homeworld placement
(§5.6) and shown in game setup (§5.14).

**Temperature class**, the band where the species is at home:

| Class | Band (surface K) | Real-world analogue |
|-------|------------------|---------------------|
| Cryogenic | 60–130 K | Titan (94 K), methane lakes |
| Frigid | 150–240 K | ammonia-water worlds, Mars-cold |
| Temperate | 260–320 K | Earth |
| Hot | 320–420 K | hot humid super-Earths |
| Infernal | 450–750 K | Venus-like surfaces, sulfur chemistry (Lithic only, or very costly) |

**Gravity class**, the home gravity:

| Class | Home | Built-in physical effects (free, they come with the body) |
|-------|------|-------------------------------------------------------------|
| Low | 0.2–0.6 g | g-intolerant crews: battle acceleration −20%; troops −1 step on heavier worlds |
| Standard | 0.6–1.3 g | — |
| High | 1.3–2.2 g | g-tolerant crews: battle acceleration +20%; troops +1 step on lighter worlds |
| Crushing | 2.2–3.5 g | battle acceleration +40%; troops +2 steps on lighter worlds; few worlds are heavy enough |

Gravity tolerance is **asymmetric**. Going one class lighter costs 1 habitability step; going one
class heavier costs 2 steps. Separately, *for every species*, ships built at low-gravity colonies
are cheaper (shallow gravity well). That is a planet property, so low-g species benefit naturally
without a special rule.

**Chemistry** (what they breathe or metabolise):

| Chemistry | Natural atmospheres that suit it | Frequency |
|-----------|-----------------------------------|-----------|
| Oxygen | N2/O2, which exists only on worlds with a biosphere or after terraforming | rare |
| Carbonic | CO2/N2 (Venus, Mars, most rocky worlds) | common on warm and rocky worlds |
| Reducing | CH4, H2, NH3 (Titan-like, cold worlds) | common on cold worlds and moons |

(With the Synthetic frame or the *Sealed metabolism* special, the axis is ignored.)
Pressure is handled the same way for everyone: none/trace = Hostile, thin = Harsh,
standard/dense = fine, crushing = Harsh (Aerial: fine).

**Medium** (where they live):

| Medium | Needs | Other worlds |
|--------|-------|-------------|
| Land | solid surface | ocean worlds: Harsh |
| Aquatic | surface ocean *or* subsurface ocean (ice moons!) | dry worlds: Hostile |
| Aerial | gas/ice giants or crushing atmospheres | solid worlds with thin air: Hostile |

(Land + Aquatic together = the *Amphibious* tolerance, bought in §5.4.)

**Light preference:** Dim (red dwarfs), Normal (K/G stars), Bright (F/A stars). Light alone
moves a world at most one step (Ideal → Good), unless the species has the *Photosynthetic*
special (§5.10).

### 5.4 C. Tolerances (bought and sold)

| Pick | Effect | Draft cost |
|------|--------|-----------|
| Temperature: Narrow | each habitability step covers a smaller temperature range | +2 (refund) |
| Temperature: Wide | wider steps | −3 |
| Gravity: Narrow / Wide | same for gravity | +1 / −2 |
| Amphibious | Land and Aquatic both count as home medium | −3 |
| Radiation: Vulnerable / Resistant | one step worse / better on irradiated worlds (flare stars!) | +2 / −2 |
| Hardy | dome life: Hostile cap 15% → 25%, no "dome stress" stability penalty | −3 |
| Sealed metabolism | chemistry axis ignored | −5 |

### 5.5 How the profile becomes a habitability rating

For each planet and each species, the sim gives each axis a number of **steps away from home**
(0 = home, 1, 2, 3, 4+). Tolerances widen the steps. The planet's rating is the **worst axis**:

| Worst axis | 0 | 1 | 2 | 3 | 4+ |
|------------|---|---|---|---|----|
| Rating | Ideal | Good | Harsh | Hostile | Lethal |

The tooltip always names the worst axis and the next one. Habitat tech raises the caps of
Harsh/Hostile/Lethal; terraforming moves the planet's temperature and atmosphere; genetic
adaptation widens the species' steps (§4.3).

### 5.6 Homeworld placement uses the profile

The generator scores every candidate star by **habitable value for this species within 8 ly**
(usable surface × rating, plus the system-link value of §7.8, so a tight red-dwarf system with many
small worlds scores fairly). Homes keep a minimum distance from each other.

**Fairness is loose on purpose (D19).** Placement only rejects *extreme* outliers. Draft rule: no
start below ~60% of the median start value, and none above ~160%. Within that band, luck is
intended. A rich neighbourhood is a lucky draw, not a bug. Game setup can offer "Fair starts"
(narrower band) and "Wild" (no check) as options. If needed, the homeworld itself is invented within the system's
detection limits (§3.3).

### 5.7 D. Life cycle

**Reproduction** (population growth rate):

| Level | Growth | Draft cost |
|-------|--------|-----------|
| Very slow | ×0.5 | +4 |
| Slow | ×0.75 | +2 |
| Normal | ×1 | 0 |
| Fast | ×1.5 | −3 |
| Very fast | ×2 | −6 |

**Lifespan** (with 5-year turns, it matters):

| Level | Life | Leader tenure | Other effects | Draft cost |
|-------|------|---------------|---------------|-----------|
| Ephemeral | ~15 y | 3 turns | veterans retire fast (crew experience decays); assimilation fast | +2 |
| Short | ~40 y | 8 turns | crew experience decays somewhat | +1 |
| Normal | ~90 y | 18 turns | — | 0 |
| Long | ~300 y | 60 turns | veterans stay; Stability +1 | −2 |
| Ancient | 1000+ y | lifelong | as Long; leaders gain experience indefinitely; assimilation slow | −3 |

### 5.8 E. Aptitudes (8 ratings, −1 to +2)

Costs are **convex**: +2 costs more than twice +1. A −1 refunds **less** than a +1 costs.

| Aptitude | −1 | +1 | +2 | Draft costs (−1 / +1 / +2) |
|----------|----|----|----|-----------------------------|
| **Industry** | −20% | +20% | +40% | +2 / −3 / −7 |
| **Research** | −20% | +20% | +40% | +2 / −3 / −7 |
| **Commerce** (credits) | −25% | +25% | +50% | +1 / −2 / −5 |
| **Piloting** (battle accuracy and evasion) | −10% | +10% | +20% | +2 / −3 / −6 |
| **Troops** (ground combat) | −25% | +25% | +50% | +1 / −2 / −4 |
| **Espionage** (offence and defence) | −1 level | +1 | +2 | +1 / −2 / −4 |
| **Diplomacy** (others' baseline attitude, treaty acceptance) | −15 | +15 | +30 | +1 / −2 / −4 |
| **Stability** | −10 | +10 | +20 | +2 / −3 / −5 |

### 5.9 F. Science style

Each research tier has 2–4 projects (§8.1):

| Style | Unchosen projects in a tier | Draft cost |
|-------|----------------------------|-----------|
| Rigid | locked once you pick one | +3 |
| Normal | cost ×2 | 0 |
| Creative | normal cost (×1) | −6 |

### 5.10 G. Origin (exactly one) and H. Specials

**Origins:**

| Origin | Effect | Draft cost |
|--------|--------|-----------|
| Standard | — | 0 |
| Large homeworld / Small homeworld | bigger / smaller home | −2 / +1 |
| Rich homeworld / Poor homeworld | metal deposit / none | −2 / +2 |
| Twin settlement | starts with a second small colony nearby | −3 |
| Gardener vault | starts with one artifact tech; Gardener ruins at home | −4 |
| Nomad fleet | no homeworld: starts with habitat ships in a belt; mobile capital; cheap belt habitats | calibrated |

**Specials** (several allowed, unless noted as exclusive):

| Special | Effect | Draft cost |
|---------|--------|-----------|
| Subterranean | lives underground: temperature, radiation and light axes count one step better; bombardment kills half as much | −3 |
| Photosynthetic | colonies have no upkeep and +growth on Normal/Bright light; light becomes a full axis (Dim = 2 steps) | −2 |
| Spore-borne | colony ships 40% cheaper, but new colonies start with half the population | −3 |
| Hive mind | immune to unrest and subversion, espionage defence +2; locks government to *Unified*, forbids Creative, Diplomacy −1 built-in | −4 |
| Terraformers | terraforming −40% time and cost | −3 |
| Genetic plasticity | genetic adaptation research −50%, one extra adaptation step possible | −3 |
| Electrosense | detection range +50%; +1 battle sensors and ECM | −2 |
| Radiotrophic | radiation *helps*: irradiated worlds count better, not worse (needs Resistant) | −2 |
| Cybernetic | ships repair in the field; troops +1 step; pop upkeep +10% | −3 |

The list is meant to grow. Every new special enters with a *calibrated* cost (§5.13).

### 5.11 I. Society

- **Government** (exactly one, fixed for the whole game, D36): Autocracy (0), Republic (−3), Communion
  (−1), Federation (−3), Technocracy (−4), Directorate (−3); Unified only through the Hive mind
  special. Effects and mature forms: [3-governments.md](design/3-governments.md).
- **Attitude to other species:** Xenophobic (own-species colonies +stability, mixed colonies
  −stability, Diplomacy −1 built-in) / Neutral / Cosmopolitan (mixed colonies fine, conquered
  populations assimilate faster). Calibrated like everything else; Neutral = 0.

### 5.12 Example: building Humans from the sheet

Carbon · Temperate / Standard / Oxygen / Land / Normal light · Genetic plasticity (−3) ·
Diplomacy +1 (−2) · Commerce +1 (−2) · Cosmopolitan (calibrated, assume −1) · Origin Standard →
**8 of 10 used**, and the last 2 could buy Troops +1.
(The concrete numbers will change with calibration. The point is that the sheet expresses the
species.)

### 5.13 Doing better than MOO2: how picks get balanced

MOO2's picks were famously unbalanced: Creative and Telepathic were far too strong, and some
drawbacks were free for certain playstyles (e.g. a spying drawback for a pure builder). The plan:

1. **Measured costs.** A *pick calibration harness* (CLI): for each pick, run many AI-vs-AI games on
   random maps where one species has the pick and the others are baseline. Measure the effect on
   win rate and score; set the cost proportional to the measured value. Repeat after every balance
   change. Results are written into `docs/balance.md`.
2. **Drawbacks are measured per playstyle.** A drawback refunds only what it costs the playstyle
   it hurts *least*, measured across all AI personalities. A drawback that is free for builders
   refunds almost nothing.
3. **Asymmetric refunds and a cap:** a −1 refunds less than the matching +1 costs, and total refunds
   are capped at 6.
4. **Convex costs:** stacking one stat to +2 costs more than twice +1, which counters min-maxing.
5. **Combination check:** the harness also samples strong pairs. If a pair is worth clearly more
   than its parts, it gets redesigned (not just repriced).
6. **Additive stacking:** bonuses from picks, buildings and techs add within one pool instead of
   multiplying, which limits runaway combinations.
7. **The AI must use every pick competently,** otherwise the measurement is wrong. Every pick has
   an AI hook and a test.
8. **Map-dependent value is shown, not hidden.** The environment profile is free, so its value
   varies by region. Game setup reports it (§5.14). Placement (§5.6) only cuts off extreme outliers, so luck
   remains part of the game (D19).

### 5.14 The species editor (UX)

- Left: the sheet, grouped as A–J, with points spent/left and the refund cap shown as bars.
- Right: a **live preview on the selected region:** the 3D map tints stars by how good they would
  be for this species, and a short summary ("On this map: 14 Good+ worlds within 15 ly of a
  typical home; red dwarfs are mostly Harsh for you").
- A **power estimate** from the calibration data, and a warning on known strong combinations.
- Start from any predefined species and modify it, or start blank.
- Save, share and import as a short text code.

---

## 6. Time, movement, supply, communication, detection

### 6.1 Time scale

- **1 turn = 5 years.** Default game: 120 turns (600 years); options 80–200.
- 5-year turns give natural rhythms: buildings take 1–3 turns, terraforming steps take decades,
  generations pass, leaders age.

### 6.2 Drives and speed (D4)

Speed is **ly per turn** (5 ly/turn = c). Tiers by propulsion tech:

| Tier | Drive (realistic names) | Speed | ly/turn |
|------|------------------------|-------|---------|
| 1 | Fusion torch (Gardener kit) | 0.2 c | 1.0 |
| 2 | Improved fusion | 0.3 c | 1.5 |
| 3 | Antimatter catalysed | 0.45 c | 2.25 |
| 4 | Antimatter beam core | 0.6 c | 3.0 |
| 5 | Magnetic-sail braking + ramscoop | 0.75 c | 3.75 |
| 6 | Relativistic drive | 0.9 c | 4.5 |
| 7 | Gardener field drive (artifact) | 0.99 c | ~5 |

Reference distances: nearest neighbours in this region are typically 4–6 ly apart. At tier 1,
Sol → Alpha Centauri (4.37 ly) takes 5 turns (25 years); at tier 6 it takes 1 turn.

- Movement is **free in 3D, in straight lines between systems** (no lanes), like MOO2.
- Ships in transit are points in space; **no deep-space combat** (realistically you can't
  intercept at 0.5 c without knowing exactly where).
- Fleets may be **redirected** in transit (keeping it simple; realism would forbid it).
- Crew g-tolerance (from the species' gravity class, §5.3) affects **battle acceleration only** (D18).
  Between stars, crews and colonists are in hibernation, so every species travels at the drive's speed.
  Probes are unmanned and always one tier faster.

**Decided (D23):** tier 1 = 1 ly/turn (25 years to Alpha Centauri). Slower would make the first
expansion wave last 30–50 turns.

### 6.3 Supply range

- Ships may travel only within **range R** of a supply node (colony, outpost, fuel depot), exactly
  like MOO2's fuel range. It is shown as **translucent spheres** in 3D, which reads well.
- Range grows with tech. **Gas giant fuel depots** (skimming outposts) extend range, so gas giants
  matter from turn 1.

### 6.4 Communication (D6)

- **QE links ("tanglelinks"):** entangled-pair communicators. *Game rule:* every ship and colony
  carries pairs linked to its capital, so your **whole empire is always in real-time contact**. No
  delayed orders.
- **Contact with other species** needs a **physical exchange of linked pairs**: your ship meets
  theirs, or your colonies are within N ly of each other. Until then you only know what your
  telescopes show. *First contact means something.*
- No-cloning flavour: tanglelinks can't be tapped, so espionage is physical (agents, probes).

### 6.5 Detection and fog of war

- **Telescope range** (tech): planets in systems within range become known (resolution grows with
  tech: first giants, then rocky planets, then moons).
- **Presence:** systems where you have a ship, colony or probe are seen fully and live.
- Systems seen once and then left show **last-known info with its age** ("as of Year 85").
- **Drive plumes:** fleets under thrust are visible within detection range (fusion torches are
  bright), which gives early warning of attacks.

**Q5 — light delay as a rule:** what your *telescopes* see of a system 15 ly away is 15 years
old (3 turns). Your own assets are live through tanglelinks. That is realistic and has a dramatic
side effect: a fleet at 0.9 c arrives almost on the heels of its own light, so fast attacks come
with little warning. It costs some complexity ("why is that colony shown as 3 turns old?").
**Decided (D12):** for *telescope* views only, shown clearly ("light 3 turns old"), on by default and
can be switched off.

### 6.6 Relativistic flavour

Crews and colonists **hibernate** in transit (D18), so they barely age on the way anyway. At 0.9 c, the
ship's clock also runs at less than half speed. Only as flavour: admirals and colonists show "ship
time" in tooltips. *No mechanics in v1* (D24). Making leaders on fast ships age slower is easy to add later.

---

## 7. Economy and colonies

Details: [2-economy.md](design/2-economy.md).

### 7.1 Resources (deliberately few)

| Resource | Scope | From |
|----------|-------|------|
| **Industry** | per colony | builds things locally |
| **Research** | empire pool | science |
| **Credits** | empire pool | commerce, taxes; pays upkeep, can buy production |
| **Population** | per colony | grows toward the cap |

**No food.** With domes and arcologies, food is part of habitat upkeep: it lowers the population
cap or growth rather than being a separate resource. This removes MOO2's most tedious system (food
freighters). **Decided (D13).**

### 7.2 Workforce

Population works in three fields: **Industry / Research / Commerce.**

- Default: a **colony focus** (Balanced, Industry, Research, Commerce, Growth). The game allocates.
- Advanced: per-colony sliders (not individual pop dragging).
- An empire-wide **Focus overview** table for changing many colonies at once.

### 7.3 Growth

- Logistic growth toward the cap; rate from species reproduction, habitability and buildings.
- 5-year turns: growth per turn is meaningful; a new colony takes ~10–20 turns to mature.
- **Colonists by ship** (cryo-pods, §9) or **population transfer** between your colonies.

### 7.4 Stability (one value, replaces MOO2 morale)

0–100. Affected by government, species traits, war weariness, overcrowding, **dome life** (living in
Hostile habitats is stressful), conquered populations and leaders. Low stability → output penalty
→ unrest → revolt.

### 7.5 Buildings

24 in the first draft, every one a real decision (full list in [2-economy.md](design/2-economy.md) §7). Upkeep in credits.

### 7.6 Build queue

Per colony: buildings, ships, projects (terraform steps, habitats). Plus "repeat last", queue
templates and an empire-wide "build this everywhere it fits".

### 7.7 Outposts and habitats

- **Outposts:** no population; they claim a body, extend supply, and mine deposits or skim fuel.
- **Orbital habitats** (mid tech): population in orbit around anything, including gas giants and belts.

### 7.8 Compact systems and system links (D20)

**The real background:** a red dwarf's habitable zone lies at roughly 0.02–0.2 AU, so its planets sit
very close together. The Sun's planets span 0.4–30 AU. Inside a tight system, trips take days instead
of months, and launch windows come every few days instead of every two years. A compact system can
work like one connected economy.

**Link strength.** Every pair of bodies in a system gets a link strength from their orbital
separation:

| Link | Orbital separation | Typical example |
|------|--------------------|-----------------|
| **Strong** | < 0.1 AU | almost any pair around a red dwarf |
| **Good** | 0.1–1 AU | Earth–Mars, Earth–Venus |
| **Weak** | 1–5 AU | Earth–Jupiter |
| **Remote** | > 5 AU | Earth–Saturn and beyond |

**What links do** between your own colonies, outposts and habitats in one system (draft, D34):

1. **System trade:** each colony gets +industry and +commerce per linked body (e.g. +6% per Strong,
   +4% Good, +2% Weak, 0 Remote), capped at about +30%.
2. **Shared deposits:** an outpost's deposit (metals, volatiles, rare elements) feeds the system's
   colonies at link strength: Strong 100%, Good 75%, Weak 40%, Remote 15%.
3. **In-system expansion:** a colony can settle or outpost another body in its own system as a
   **local project**, with no interstellar colony ship. Cost and time scale with the link: Strong
   about half the price of a colony ship, Remote more than a colony ship.
4. **Population overflow:** surplus population moves automatically to linked colonies that still
   have room, faster over stronger links.

**The intent:** a red dwarf system with four small star-locked worlds (twilight band only) adds up to
one big, efficient, fast-to-settle economy. A Sun-like system has fewer but larger worlds with open
air, but weak links between them. Different shapes, comparable value: the calibration harness (§5.13)
checks that neither systematically wins.

**Foreign neighbours:** with a trade treaty, links to another empire's colonies in the same system
give both sides half the system-trade bonus. That gives shared systems a reason for peace.

**UX:** the system view draws links as lines between bodies, coloured by strength. The colony panel
shows *"System links: 3 Strong, 1 Good → +22% industry"*.

---

## 8. Research

Details: [1-research.md](design/1-research.md).

### 8.1 Structure

Six fields, each with ~8 tiers, 2–4 projects per tier. **MOO2's signature rule stays:** you pick
**one** project per tier; the others become harder (×2 cost) instead of impossible. "Creative"
species get all of them. *That softens MOO2's harshness while keeping the meaningful choice.*

| Field | Covers |
|-------|--------|
| **Propulsion** | drive tiers, supply range, probes |
| **Energy and Weapons** | reactors, lasers, particle beams, kinetics, missiles |
| **Materials** | armour, hull sizes, construction speed, mining |
| **Life Sciences** | habitats, terraforming, genetic adaptation, medicine, growth |
| **Computing** | sensors, telescopes, battle computers, ECM, automation, governance aids |
| **Society** | governments, stability, diplomacy, commerce, espionage |

Plus **Gardener studies:** projects unlocked only by artifacts from ruins (exotic shields,
the field drive, archive decoding toward the Legacy victory).

### 8.2 Flavour: real-world tech names

Fusion torch, antimatter catalysis, coilgun → railgun → mass driver, X-ray laser → gamma-ray
laser, Whipple shielding, magnetic deflectors, paraterraforming, ecopoiesis, neural lace, quantum
annealing, Dyson swarm (late megaproject?)…

### 8.3 Research UX

- One screen; the current choice per field. Each project card says **what it does for you**
  ("+30% population cap on 4 of your colonies").
- Optional research **advisor** (recommends based on your situation).

---

## 9. Ships and design

Details: [4-ships.md](design/4-ships.md).

### 9.1 Hulls

Probe (unmanned), Corvette, Frigate, Destroyer, Cruiser, Battleship, Dreadnought (late), plus
**orbital stations** (planet defence) and **civil hulls** (colony ship, outpost ship, transport).

### 9.2 Components

Space-based design like MOO2 (each hull has slots and space), simplified:

- **Drive** (sets speed tier; bigger hulls need more drive space)
- **Reactor** (powers energy weapons)
- **Weapons:** lasers, kinetics, missiles, particle beams, later artifacts
- **Defence:** armour, point defence, ECM, deflectors (later)
- **Sensors / battle computer**
- **Specials:** cryo-colonist pods, troop pods, outpost kit, terraforming kit, fuel tanks

### 9.3 Design UX

- **Role templates** (Escort, Line ship, Carrier, Raider, Defender): "auto-design with the newest
  tech" in one click. This is also the AI's designer.
- The full designer for players who want it, with a live **effectiveness preview** against known enemies.
- **Refit:** upgrade existing ships to a newer design at a shipyard (costs the difference).

### 9.4 Command limit

Fleet upkeep in credits, plus a soft **command limit** from starbases and leaders (like MOO2
command points, but shown as a single "fleet capacity" bar).

---

## 10. Combat: strategies in, real 3D battle out (D8, D10)

### 10.1 Concept

Players don't order ships around during a battle. They **prepare**: ship designs, **strategies**
(behaviour programs made in a strategy editor, with good defaults), and which ship gets which
strategy. Battles then run by themselves as a **real-time 3D simulation**, which the player
**watches**. That gives true 3D combat with no control problem. The player's skill lies in the
fleet mix, the designs and the strategies.

Related games: Gratuitous Space Battles (prepare and watch), and Final Fantasy XII's "gambits"
(prioritised if/then rules) as the model for the rule editor.

**The architectural win:** a battle needs no player input once the turn is processed, so it is
resolved completely inside `processTurn`. Watching it is a deterministic **replay**. Consequences:

- multiplayer turns stay simultaneous and need no live battle sessions;
- AI-vs-AI games, balance batches and replays need nothing extra;
- every battle can be rewatched from the turn report at any time.

### 10.2 When battles happen

When hostile forces are in the same system at the end of movement. One battle per system per turn.

### 10.3 The battle space

- A **3D volume** around the contested body: the planet, its moons, the star's light from the
  right direction.
- **Attackers arrive along their real approach vector** (from the direction of the system they
  came from). The 3D star map geometry carries into battle.
- Distances and speeds are compressed for play, but proportions stay plausible: lasers reach
  furthest instantly, kinetic slugs take seconds, missiles take longer.
- **Movement:** acceleration-limited "Newtonian-lite". Each ship has a max acceleration (drive,
  mass, crew g-tolerance from §5.3) and a turn rate, with a speed cap and light damping, so ships
  don't overshoot absurdly. No collisions (space is big).
- **Fixed time step:** 10 sim ticks per second, rendered smoothly at display frame rate by
  interpolation. Battle length is capped (draft: 3 minutes of battle time). After that both sides
  disengage. If the attacker hasn't won, the siege continues next turn.

### 10.4 What a strategy is

A strategy is assigned to a ship group and has three layers, so beginners can stop after the first:

**Layer 1 — Preset:** pick one of the defaults (§10.5).

**Layer 2 — Settings** (a short form):

| Setting | Values |
|---------|--------|
| Role / position | Vanguard, Line, Rear, Flank, Screen (around a chosen group) |
| Preferred range | Close, Medium, Long, "best for my weapons" |
| Approach | Direct, Flanking, Orbiting, Hold position |
| Target priority | an ordered list of selectors: biggest threat, weakest, nearest, missile ships, carriers, flagship, transports, planet defences, a specific design class |
| Fire discipline | Spread fire, Focus with group, Focus with fleet |
| Point defence | Protect self, Protect group, Protect a chosen ship |
| Withdraw when | hull below X%, fleet strength ratio below Y, never |
| Heat discipline (if heat is on, D25) | Max fire, Sustainable, Cool-down threshold X% |

**Layer 3 — Rules** (advanced): an ordered list of **IF condition THEN action** rules,
re-evaluated every second. The first matching rule overrides the settings; if none matches, the
settings apply.

| Conditions (combinable with AND) | Actions |
|----------------------------------|---------|
| own hull < X% · heat > X% · ammo < X% | attack target (selector) |
| missiles incoming · being targeted by kinetics | keep range X / close in / evade |
| enemy of class Z in range / present in the battle | escort / protect (selector) |
| ally (selector) under attack / below X% hull | switch point defence mode |
| fleet strength ratio < / > X | hold fire (cool down) |
| battle time > T · flagship lost | change formation · withdraw |
| enemy composition: "> X% missile ships", "carriers present" | switch to strategy S |

**Rules can react to the enemy's composition**, so adapting to the opponent is part of the
preparation. There is no pre-battle step (D15): whatever strategies are assigned when the turn ends
are the ones that fight.

### 10.5 Default strategies (draft)

| Strategy | Behaviour |
|----------|-----------|
| **Line of battle** | holds formation at medium range, focuses fire with the fleet |
| **Brawler** | closes in fast, attacks the nearest heavy target |
| **Skirmisher** | keeps long range, falls back when approached (kiting), withdraws at 50% hull |
| **Sniper** | maximum range, targets the biggest threat, stays behind the line |
| **Escort** | screens a chosen group, point defence protects the group |
| **Missile boat** | stays far back, fires volleys at the biggest threat, falls back when out of ammo |
| **Interceptor** | hunts missile boats, carriers and transports |
| **Raider** | goes for transports and civilian ships, avoids warships |
| **Planet assault** | attacks defence stations and batteries, protects troop ships |
| **Picket / defender** | holds near the planet, engages anything that comes within range |

Each ship design carries a **default strategy** (set in the designer, guessed from its weapons), and a
new ship gets it when built. Changing a ship's, group's or fleet's strategy is an ordinary order you can
give in any turn, for example when you see an enemy fleet approaching (D15).
Fleets have a **fleet doctrine** (posture: Aggressive, Hold, Defend planet, Evasive) and can
override per group.

### 10.6 The strategy editor (UX)

- One screen: the three layers as tabs ("Simple / Settings / Rules"). Rules use dropdowns,
  never free text or code.
- **The test range:** a sandbox inside the editor that runs your strategy against a chosen enemy
  fleet (any designs you know, or AI defaults), as fast as possible or watched. You see the result
  in seconds. This is how players learn, and it uses the real battle sim.
- Strategies are saved per empire; share and import them as a text code.
- **Battle reports explain behaviour:** "Your Skirmishers withdrew at 2:10 (rule: hull < 50%)",
  "Escorts' point defence stopped 64% of the missiles", "Railguns did 70% of your damage". Every
  report entry can open the strategy in the editor.

### 10.7 Watching

- **Auto-director camera** (cinematic: follows the action, cuts to kills and big volleys) and a
  free orbit camera; follow any ship.
- Speed 0.5×–8×, pause, **timeline scrubbing** (a deterministic replay with periodic snapshots
  makes jumping cheap), skip to the result.
- **Tactical overlay:** target lines, weapon ranges, hull, heat, current rule per ship.
- **No intervention while watching** (D16). The outcome is fixed when the turn is processed.
- Watching is optional. "Skip battles" shows only the report.

### 10.8 Weapons and mounts (realistic families)

| Family | Behaviour in the sim | Countered by |
|--------|----------------------|--------------|
| **Lasers** | instant hit, damage falls off with range, need reactor power, produce heat | range, reflective armour |
| **Kinetics** (coilgun → railgun → mass driver) | projectiles with travel time; the shooter leads its target; dodgeable by acceleration at long range | agility, ECM, distance |
| **Missiles** | homing entities, limited ammo, long range | point defence, decoys, ECM |
| **Particle beams** (mid game) | ignore part of armour, short to medium range | magnetic deflectors |
| **Drones / fighters** (later, D33) | small autonomous craft from carriers | point defence, interceptors |
| **Gardener weapons** (artifacts) | exotic | — |

**Mounts:** *turrets* (wide arc, smaller weapons) and *spinal mounts* (fixed forward, big
weapons). A spinal-mount ship must point at its target, which is where real 3D movement matters.

### 10.9 Damage model

Armour (ablative) → hull. Deflectors in the late game. Hits can knock out **subsystems** (drive,
weapons, sensors, reactor), shown on the ship and in the report. Crew experience improves
accuracy and reaction time; long-lived species keep their veterans longer (§5.7).

### 10.10 Heat (D25)

A heat bar per ship: energy weapons and hard acceleration build heat, radiators shed it, and
overheating forces a cool-down. It fits the strategy approach naturally (a "cool down when heat
> 80%" rule). **Decided:** the sim is built so that heat can be switched on; the first prototype is tested without it
and with it.

### 10.11 Planets in battle

Defence stations, ground batteries and deflector domes have their own simple strategies (picket,
target priority). Planets don't move.

### 10.12 Scale and performance

- Draft limit: ~60 ships per side plus missiles and drones. Identical designs keep their
  individual ships (real 3D), but the UI groups them.
- The battle sim runs in a **web worker** in the browser and in plain Node for the CLI.
- Target: a typical battle resolves in well under one second without rendering, so turn processing
  stays fast and balance batches can run thousands of battles.

### 10.13 AI and balance

- The **AI uses the same strategy system**: it chooses strategies from the library based on known
  enemy designs, and adjusts designs and strategies after lost battles.
- **Strategy lab** (CLI): round-robin tournaments of all default strategies across many fleet
  compositions. That finds dominant strategies and gaps in the rock-paper-scissors triangle.
- **Exploit hunt:** an offline search (e.g. random or evolutionary mutation of rule lists) looks
  for degenerate strategies that beat everything. Anything found is fixed in the rules before
  players find it.

---

## 11. Ground combat, bombardment, conquest

Details: [6-ground-combat.md](design/6-ground-combat.md).

- **Invasion:** troop transports land; the battle is resolved with modifiers (species troop traits,
  armour tech, gravity mismatch: high-g troops on a low-g world fight better, the reverse is a
  penalty, a realistic and nice twist).
- Special cases: Sylphae gas giant colonies need special airborne troops; Mur undercities double
  defence.
- **Bombardment:** kinetic strikes reduce defences, buildings and population (with diplomatic
  consequences).
- **Relativistic kill vehicles (late):** planet-killers. A real-world interstellar concern. A war
  crime in game terms: every species' attitude collapses, and the Custodians react (§14.2).
  *Optional rule.*
- **Conquered populations** keep their species and assimilate slowly (stability penalty at first).

---

## 12. Diplomacy

Details: [5-diplomacy.md](design/5-diplomacy.md).

### 12.1 Contact

Needs a tanglelink exchange (§6.4). Contacts can share contacts ("introduce us").

### 12.2 Relations

- An attitude value with clear **reasons listed** ("+20 trade treaty, −15 habitat overlap, −30
  you colonised near our home").
- **Habitat overlap** (same environmental profile) is a permanent source of friction;
  complementary species get along more easily.

### 12.3 Treaties

Non-aggression, trade, research sharing, map sharing, defensive alliance, full alliance;
exchanges of tech, credits, systems; demands and tribute.

### 12.4 The Concord (council)

Forms once at least half of all species know each other. Votes every 10 turns (50 years) on a
**Speaker**; 2/3 of the votes (by population) wins (§15). Possibly also votes on **cluster
laws** (e.g. ban on RKVs, open borders). Laws come later, not in v1 (D26).

### 12.5 AI personality

From species society and traits, plus some randomness; species-flavoured diplomatic text.

---

## 13. Intelligence and leaders

### 13.1 Intelligence (light)

Agents are trained at the capital and assigned to a rival in contact: **steal tech, sabotage,
incite unrest, gather intel**. Defence: counter-intelligence rating. One screen, no per-agent
micromanagement.

### 13.2 Leaders

- Two kinds: **Governors** (colony or sector) and **Admirals** (fleet).
- **Lifespan in turns from the species:** Kith leaders last 2–3 turns, Corundi and Qelloth
  leaders 30+. Fits the 5-year turns and gives long-lived species a flavourful edge.
- 1–3 skills each, levelling with experience.

---

## 14. Events, Custodians, endgame threat

### 14.1 Random events (realistic first)

Stellar flares (red dwarfs!) damaging unprotected colonies, comets and impact threats, rogue
planets passing through, plagues, a Gardener cache discovered, a genetic breakthrough, unrest,
derelict generation ships, first-contact moments with narrative text.

### 14.2 Custodians (instead of space monsters)

Automated Gardener guardians at key ruin sites: strong stations or swarms. Beat them for
artifacts (techs, Legacy keys). They also **react to atrocities** (RKV use), making them a
cluster-wide police force.

### 14.3 The Approach (late-game threat, optional)

Mid-game, a growing anomaly appears **at the edge of the map in one direction**, coming at sublight.
Thanks to telescopes it is visible decades (many turns) ahead, and the countdown is part of the
drama. Decoding Gardener ruins reveals what it is and why the Veil existed: it hid the cluster from
*this*. Now the cluster is visible again. Players can unite, prepare, or exploit the chaos.
Defeating it is a victory condition (§15).

**Decided (D27):** the Approach is an option, on by default. Without it, the game is a sandbox with only
the Custodians.

---

## 15. Victory

| Victory | How |
|---------|-----|
| **Conquest** | the last empire (and its allies) standing |
| **Concord** | elected Speaker with 2/3 of the votes |
| **Legacy** | gather 3 Gardener keys (from Custodian sites) and complete the Archive megaproject |
| **The Approach** | deal the decisive blow to the threat (if enabled) |
| **Score** | highest score at the turn limit |

---

## 16. UX and accessibility

### 16.1 The 3D star map (D3)

- **Idle rotation:** a slow orbit around the galactic north axis (~1 revolution per 3–4 minutes),
  with ease-in/ease-out. **Stops immediately** on any pointer or keyboard input or when a panel
  opens. **Resumes** after ~20 s idle (configurable, can be switched off). Respects
  `prefers-reduced-motion` (no rotation for users who asked their OS to reduce motion).
- **Depth cues:** a galactic reference plane with **distance rings every 5 ly** (one ring = one
  turn at max speed), **drop lines** from every star to the plane, size and brightness falling off
  with depth, fog with distance, labels fading behind.
- **Stars:** colour by spectral type, size by luminosity (log-compressed), multiple systems shown as
  a small cluster.
- **Camera:** orbit around the focus; double-click a star to fly to it; keyboard shortcuts;
  "home" key.
- **Neighbourhood mode** for the selected star: lines to the nearest systems labelled with
  **distance and travel turns at your current speed**.
- **Range spheres:** supply range, telescope range, drive range of the selected fleet.
- **Flatten toggle:** one key to project everything onto the plane for planning (positions stay
  correct in x/y; height is shown as small numbers).
- **Fleet paths** with an ETA in turns; fleets in transit as moving markers.
- **System view:** zoom into a system with 3D orbits (log-scaled), planets and moons; habitability
  badges for your species.

### 16.2 Accessibility rules

- **Explain every number:** each value has a tooltip breaking it down ("Industry 42 = 30 workers ×
  1.2 + Fusion Plant +6").
- **Progressive disclosure:** advanced controls (sliders, the full designer, detailed tables) are
  behind "More…".
- **Turn summary:** "what changed and what needs you" as a short list; click goes to the spot.
- **Undo within the turn** (comes naturally: orders are commands queued until end of turn).
- **Advisors:** optional suggestions per area (research, colonies, military).
- **Tutorial scenario:** a short guided start (Small map, 3 species, explained step by step).
- **Encyclopedia "Starfacts":** the real data behind each star and planet. An educational bonus:
  "Barnard's Star: 5.96 ly, discovered moving fast in 1916…"
- Colour-blind-safe palettes; scalable UI; full keyboard play.

### 16.3 Screens

Title (hero screen, [7-title-and-versions.md](design/7-title-and-versions.md)) · What's new · Map (3D) · System view · Colony panel · Empire overview (table of all colonies) · Research ·
Ship designer · Fleets · Diplomacy · Intelligence · Leaders · Turn report · Battle · Starfacts ·
Settings · Game setup (species, region, size).

---

## 17. AI and automation

- Same principle as StarLord: **AI and player automation are the same code,** split by area:
  exploration, colonisation, economy, research, design, military, diplomacy, battle.
- **Battles are automated by design** (D10): the "battle AI" is the strategy interpreter, plus the
  AI's choice of strategies (§10.13). Strategic AI per area grows phase by phase.
- Automation switches for the other areas (colonies, research, design, fleets) come after the core
  game works (D8).
- AI personalities from species (§12.5).
- **Headless AI-vs-AI runs from the first sim milestone:** balance, soak and invariant checks.

---

## 18. Multiplayer

- Architecture from day one: a deterministic lockstep sim and a game record (orders per turn plus
  state hash).
- Transport: **GameHub** (games.futuremagic.de), taken from StarLord: simultaneous turns,
  rejoining with a seat token, chat, a turn timer.
- **No live battle sessions needed:** battles are resolved inside the turn from the strategies (§10.1),
  so human-vs-human battles cost nothing extra. Each client replays them locally for watching.
- Hotseat? *Probably not* (needs fog-of-war juggling).

---

## 19. Technical architecture

### 19.1 Repo layout (new monorepo, pnpm, TypeScript)

```
astralis/
  packages/
    catalog/   offline pipeline: raw catalogs → curated systems.json / planets.json (+ licences)
    sim/       pure rules: state, RNG, commands, processTurn, generation, battle; no DOM
    ai/        controllers (AI = automation), including the battle AI
  apps/
    web/       React + three.js game
    cli/       headless runner, balance, soak, replay
    lab/       dev viewers: map prototype, planet generator, battle sandbox
  public/      art, audio
  docs/        design.md (this), plan, balance
```

### 19.2 Carried over from StarLord (D7: infrastructure, not rules)

- Seeded RNG, state hash, game record, lockstep host/peer (`packages/sim/src/{rng,hash,record,lockstep}.ts`).
- GameHub networking (`apps/web/src/net/*`).
- three.js layer pieces (`apps/web/src/three`: stage, materials, effects, particles, labels, billboards).
- Changelog/"What's new" mechanics (versions 0.001 + 0.001 per build, D39), asset generation via OpenRouter, publishing to apps.futuremagic.de.
- The rules of thumb: commands only, `playerView`, rules as data, no `Math.random`/`Date` in sim/ai.

**Not** carried over: rule data, economy, combat, galaxy generation, UI screens.

### 19.3 Determinism in a 3D world (D14)

- JS `+ - * / sqrt` are exact and identical in every engine (IEEE 754), but `Math.sin/cos/atan2/pow/exp/log`
  are **not guaranteed** identical across browsers. A real-time 3D battle sim needs trigonometry
  constantly, so this matters a lot more now.
- **The library:** most likely the one you meant is **stdlib-js** (`@stdlib/math/base/special/*`,
  Apache-2.0). Its functions are ports of FreeBSD's msun, which goes back to Sun's **fdlibm** C library.
  They are written in plain JavaScript arithmetic, so the results are bit-identical in every
  engine. Source check: [stdlib `sin` notes its FreeBSD origin](https://github.com/stdlib-js/math-base-special-sin/blob/main/src/main.c).
  Each function is a separate small package, so we only bundle what we use.
- **Rules:**
  - The sim and AI import math only through one facade, `sim/math.ts` (sin, cos, atan2, pow, exp,
    log, hypot…, backed by stdlib).
  - A lint rule forbids `Math.*` (except `Math.sqrt/abs/min/max/floor/round/sign` and similar
    exact ops) in `sim`/`ai`.
  - A **cross-engine golden test** runs the same battle in Node, Chromium and Firefox and compares
    state hashes.
- Distances between systems are computed once at game start and stored.
- No physics engine in the sim: the battle movement model (§10.3) is simple enough to write
  ourselves, and that keeps determinism in our own hands.
- Rendering (three.js) may use native `Math` freely, because it only *displays* the sim state.

### 19.4 Rendering

- three.js. Stars as shader sprites; planets **rendered procedurally from their physical
  parameters** (shader: type, temperature, water, clouds, ice), so we need no texture per planet
  and every invented planet looks right.
- Species portraits and short videos generated through OpenRouter (as in StarLord).
- Performance target: 300 systems plus overlays at 60 fps on a mid-range laptop.

### 19.5 Quality

- Unit tests for rules; invariant checks every turn in soak runs; replay verification.
- Visual checks of the map and battles by screenshot in a headless browser (cleaned up reliably).
- A project gate (one command, cheap and expensive tiers) set up when coding starts.

---

## 20. Art and audio

- Visual style: realistic space art, restrained UI (dark, clean, information-dense but calm).
- Per species: portrait, short animated intro, ship silhouette family, music sting.
- Music: ambient orchestral/electronic; per-era variation.
- Sound: UI clicks and battle sounds, cinematic but subdued (D28), not realistic silence.

---

## 21. Roadmap (phases with exit criteria)

| Phase | Content | Done when |
|-------|---------|-----------|
| **P0 Design and feasibility** | iterate this document; versions, changelog and What's new from build 0.001; the star-logo of the title screen as part of the map prototype; catalog pipeline spike (counts per radius checked); **3D map prototype with idle rotation** using the real data; planet generator viewer; **battle sim spike** (a few ships with two strategies, deterministic across browsers) | you can read depth on the map and say "yes, that's it"; real counts confirmed |
| **P1 Sim foundations** | state, commands, turns, map and homeworld generation, planets and habitability, colonies, growth, the research skeleton, movement, supply, exploration, colonisation, fog of war; CLI with a simple AI | AI-vs-AI games run 120 turns headless, deterministic, invariants green |
| **P2 Combat** | deterministic 3D battle sim, default strategies, strategy editor (simple + settings layers first, rules layer next), test range, battle viewer with auto-director, ship designer basics, strategy lab, invasion | you prepare a fleet, watch a battle and understand from the report why it went that way; the strategy lab shows no single dominant default strategy |
| **P3 Playable alpha** | the full hero title screen (living scene, toys, sound, seamless transition to setup); all core screens; a full single-player game against AI start to finish; tutorial start | you play a complete game and enjoy it |
| **P4 Depth** | diplomacy and contact, the Concord, intelligence, leaders, events, Custodians, the Approach, victories | all victory types reachable in AI games |
| **P5 Content and balance** | pick calibration harness (§5.13); species editor; Core 12 species with full art, then 24+; full tech tree; balance by batch runs | win-rate spread in an agreed band |
| **P6 Automation and multiplayer** | auto-battle, area automation, GameHub online play | online game with two humans played through |
| **P7 Polish and release** | audio, Starfacts, performance, publish | public URL |

---

## 22. Risks and mitigations

| Risk | Mitigation |
|------|-----------|
| 3D map hard to read | P0 prototype first; rotation, plane and drop lines, flatten toggle; test with you before anything else |
| Sublight start feels slow | tier 1 = 1 ly/turn; probes faster; real planets already known at start (things to plan); first turns move many things in parallel |
| Real map unfair (fixed geography) | home-star profiles, fairness check, random regions, varied invented planets |
| Red dwarf vs. Sun-like systems unbalanced | star-locking and flares versus compact-system links (§7.8); the calibration harness compares system shapes; luck is allowed within a band (D19) |
| 26 species = huge art and balance effort | Core 12 first; traits from a shared list; balance with AI batch runs |
| Floating-point desyncs | §19.3 rules, enforced by a lint/test |
| Watch-only combat feels passive | test range in the editor, explanatory reports, strong cinematics; fleet doctrine + rules make preparation the decision; check early in the P0 spike |
| Degenerate strategies dominate | strategy lab tournaments, exploit hunt (§10.13) |
| Pick system unbalanced like MOO2 | measured costs, calibration harness, refund cap, convex costs (§5.13) |
| Scope creep | phases with exit criteria; optional rules (light delay, heat, RKVs, the Approach) behind toggles |

---

## 23. Open questions (answer by number)

**Resolved:** Q1 → D21, Q2 → D22, Q4 → D23, Q5 → D12, Q6 → D24, Q7 → D13, Q10 → D25, Q11 → D26,
Q12 → D27, Q13 → D28, Q14 → D29, Q15 → D30, Q17 → D15, Q18 → D16, Q20 → D31, Q21 → D18, Q22 → D32,
Q23 → D33, Q24 → D19, Q25 → D17, Q26/Q27 → D34, Q28 → D35, Q35/Q36 → D36, Q41 → D37,
Q29–Q34, Q37–Q40, Q42–Q46 → D38. **Postponed:** Q3 (the roster, D11).
**Obsolete through D10:** Q8, Q9.

| # | Question | Recommendation |
|---|----------|----------------|
| Q16 | Working title "Astralis": keep? | your call |

---

## Appendix A — Draft species concepts (illustrative only, not decided)

The roster will be built with the sheet in §5 later. These concepts show the range the sheet must
cover.

| # | Name | Concept | Home world | Signature |
|---|------|---------|------------|-----------|
| 1 | **Humans** | adaptable primates | temperate rocky world, G star (Sol if on the map) | Adaptive (cheap genetic adaptation), Diplomatic |
| 2 | **Vael** | dwellers of the twilight band on a tidally locked world | eyeball planet, red dwarf | thrive on red-dwarf worlds (the most common!), flare-hardened, light-shy |
| 3 | **Oolu** | subsurface-ocean beings who had never seen the sky before uplift | ice moon of a gas giant | colonise ice moons natively, pressure-adapted, poor on surfaces |
| 4 | **Brathak** | dense heavy-world natives | super-Earth, 2.5 g | high-g crews (ships accelerate harder → early speed bonus), strong troops, slow breeding |
| 5 | **Sylphae** | cloud-deck floaters | gas giant atmosphere | the only species that colonises gas giants early; poor at metals; can't be invaded on their gas giants by normal troops |
| 6 | **Corundi** | slow silicon-based lithovores | hot rocky world, K star | huge industry, very long-lived, very slow growth |
| 7 | **Myriad** | colonial swarm organism (hive) | humid jungle world | fast growth, immune to subversion, weak diplomacy |
| 8 | **The Lattice** | post-biological machine minds | (origin world abandoned) | no biological needs (every world is Harsh at best); they *build* population with industry |
| 9 | **Tessit** | mobile photosynthetic plant-folk | bright F/G star world | need bright light, large stable populations, pacifist bonuses |
| 10 | **Skethi** | ammonia-based cold-world natives | 200 K tundra world | love cold outer worlds, fast-thinking (research), hate heat |
| 11 | **Hallowfleet** | nomads whose homeworld was lost | none: starts as a habitat fleet in a belt | mobile capital, cheap belt habitats, traders |
| 12 | **Qelloth** | hydrocarbon-lake dwellers with slow chemistry | Titan-like moon, 95 K | very long-lived, patient, research bonus, slow at everything else |
| 13 | **Mur** | blind cave dwellers on a flare-scorched world | underground, red dwarf | undercity bonus (bombing resistant), mining bonus |
| 14 | **Kiriel** | gliders from a low-g, dense-air world | small world with thick atmosphere | ace pilots (battle initiative), fragile, low-g only |
| 15 | **Ulqua** | colour-speaking cephalopods | global ocean world | masters of deception (espionage), ocean worlds |
| 16 | **Tharn** | herd-collectivist grazers | grassland world | high stability, strong defence, slow to anger |
| 17 | **Wardens** | biological servants created by the Gardeners | a Gardener vault world | start with an artifact tech, low creativity |
| 18 | **Mycel** | planetary fungal network | damp, dim world | every connected colony boosts the others; spore colony ships are cheap |
| 19 | **Ixit** | radiotrophic organisms that eat radiation | irradiated world near a flare star | love irradiated worlds others avoid |
| 20 | **Vorr** | pack-hunting apex predators | rugged world | aggressive, strong ship combat, unstable politics |
| 21 | **Sorrin** | trade-guild culture | archipelago world | credits bonus, mercenaries, trade treaties |
| 22 | **Kith** | small, short-lived fast breeders (15-year life) | warm world | explosive growth, leaders die fast, creative |
| 23 | **Aumaru** | once-favoured species in decline | old Gardener-built garden world | rich start, negative growth trend, "Twilight" story event |
| 24 | **Abyssals** | chemosynthetic vent life from a dark world | moon of a brown dwarf | colonise dark worlds (rogue planets, brown dwarf moons) |
| 25 | **Keth'ra** | water-hoarding desert arthropods | hot arid world | arid specialists, industry, tough troops |
| 26 | **Seren** | beings with a long-range electrical sense | tidally locked ocean world | sensor and detection bonus, ECM in battle |
