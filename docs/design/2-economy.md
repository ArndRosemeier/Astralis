# Astralis — Economy (detail)

Part of the design plan ([design.md](../design.md) §7). Draft, planning only. All numbers are
starting values for calibration by AI batch runs.

## 1. Units

| Quantity | Unit | Notes |
|----------|------|-------|
| Population | **billions** (shown "4.2 bn") | fractional internally; one decimal on screen |
| Industry | points per turn | spent locally (per colony) |
| Research | points per turn | empire pool |
| Credits | per turn, plus a treasury | empire pool |
| Stability | 0–100 per colony | §6 |

Population is fractional, so work is split by **percentages**, not by dragging individual
workers. Small colonies work fine that way.

## 2. Population caps

### 2.1 Base cap by planet size

| Size | Radius (Earth = 1) | Base cap (bn) | Example |
|------|--------------------|---------------|---------|
| Tiny | < 0.5 | 3 | the Moon, Titan, Europa |
| Small | 0.5–0.8 | 6 | Mars |
| Medium | 0.8–1.25 | 10 | Earth, Venus |
| Large | 1.25–1.6 | 14 | super-Earth |
| Huge | 1.6–2.0 | 18 | big super-Earth (above 2.0: mini-Neptune) |
| Ice giant / gas giant | — | 0 (Aerial species: 20 / 30) | Neptune / Jupiter |
| Belt | — | 0 (habitats only) | |
| Habitat Ring | — | 4 (8 with Megastructure Engineering) | built as a project |

**Homeworld:** +25% cap (established infrastructure). Earth for humans: 10 × 1.25 = 12.5 bn.

### 2.2 Habitability multiplier (design.md §4.2), with habitat tech

| Rating | Start | + Arcologies | + Sealed Undercities | + Paraterraforming | Max |
|--------|-------|--------------|----------------------|--------------------|-----|
| Ideal | 100% | | | | 100% (Gaia: 125%) |
| Good | 70% | +10 | | | 80% |
| Harsh | 40% | +15 | | | 55% |
| Hostile | 15% (Hardy: 25%) | | +10 | +10 | 35% (Hardy: 45%) |
| Lethal | 0% | | +10 | +10 | 20% |

### 2.3 Other cap factors (multiply)

- **Usable surface** on star-locked worlds: ×0.4 / ×0.6 (design.md §4.2, D34).
- **Ecumenopolis** ×1.5; **Gaia** ×1.25 (covered in the table above).
- **Repeatable Advanced Biology:** +3% each.

**Formula:** `cap = base(size) × homeworld × rating% × usable surface × tech bonuses`

Example: a Medium, Harsh world, not star-locked, at the start of the game: 10 × 0.40 = 4.0 bn.
The same world after Arcologies: 10 × 0.55 = 5.5 bn.

## 3. Growth

Per turn (5 years):

```
growth = r × P × (1 − P / cap) + 0.1        (only while P < cap)
r      = 0.4 × reproduction × environment × bonuses
```

| Factor | Values |
|--------|--------|
| reproduction (species) | ×0.5 / ×0.75 / ×1 / ×1.5 / ×2 |
| environment | Ideal/Good ×1, Harsh ×0.8, Hostile/Lethal ×0.5 (Closed Ecologies: ×0.625) |
| Cloning Centre | ×1.5 while P < cap / 2 |
| Growth focus | ×1.5 |
| Volatiles deposit in the system | ×1.15 |
| Synthetic frame | no growth formula: assembles `0.05 × industry` bn per turn, paid from industry |

Over the cap (e.g. after damage): the population shrinks by 10% of the excess per turn.

Example: a new colony with 1 bn on a 4 bn world grows by 0.4 × 1 × 0.75 + 0.1 = 0.4 bn in its first
turn and nears 3.5 bn after about 8 turns (40 years).

## 4. Work and output

### 4.1 Base output

| Field | Per working bn | Plus |
|-------|----------------|------|
| Industry | 3 | buildings (+ per worker or flat), deposits, system links |
| Research | 3 | buildings, deposits, natives |
| Commerce | 3 credits | buildings, trade treaties |

Every species aptitude (−1 … +2) and every percentage bonus goes into **one additive pool per
field** (design.md §5.13): +20% from the species and +15% from a tech give +35%, not ×1.38.

### 4.2 Colony focus (default allocation)

| Focus | Industry / Research / Commerce | Notes |
|-------|--------------------------------|-------|
| Balanced | 40 / 30 / 30 | default |
| Industry | 70 / 15 / 15 | |
| Research | 15 / 70 / 15 | |
| Commerce | 15 / 15 / 70 | |
| Growth | 34 / 33 / 33 | growth ×1.5, output −20% |
| Custom | sliders | advanced, under "More…" |

### 4.3 Taxes (one empire-wide setting)

| Tax | Credits per bn | Stability |
|-----|----------------|-----------|
| Low | 0.5 | +10 |
| Normal | 1.0 | 0 |
| High | 1.5 | −10 |

## 5. Credits, upkeep, buying

- **Income:** commerce output + taxes + trade treaties.
- **Upkeep:** buildings (§7), outposts (0.5 each), ships (ships doc), leaders (1 each, 2 for
  high level).
- **Buying:** finish the current item of a colony's queue for **2 credits per missing industry
  point**, or 4 if nothing has been invested yet. Interstellar Banking makes it 25% cheaper.
- **Debt:** if the treasury would drop below zero, stability −10 everywhere, buying is blocked, and
  the buildings with the highest upkeep produce nothing that turn. This is shown as a warning a
  turn ahead.

## 6. Stability

Starts from the government's base (governments doc), then:

| Modifier | Value |
|----------|-------|
| Species Stability aptitude | −10 / +10 / +20 |
| Species lifespan Long / Ancient | +10 (the "Stability +1" from species §5.7) |
| Tax | +10 / 0 / −10 |
| Dome stress (Hostile / Lethal colony) | −10 / −15 (Hardy: 0; Closed Ecologies: halved) |
| Overcrowded (population above 95% of the cap) | −5 |
| Over the administration limit | −2 on every colony per colony over the limit (outposts count ¼) |
| War weariness | up to −20, from losses and length of wars |
| Recently conquered | −30, decaying 2 per turn (Ephemeral ×3, Short ×2, Ancient ×0.5) |
| Mixed species in a colony | Xenophobic −20, Neutral −5, Cosmopolitan 0 |
| Governor | +5 to +15 |
| Buildings and techs | Holo-Commons +10, Media Network +10, … |
| Debt | −10 |

| Stability | State | Effect |
|-----------|-------|--------|
| 75–100 | Content | output +10% |
| 50–74 | Normal | — |
| 25–49 | Unrest | output −20%, no growth bonus from buildings |
| 10–24 | Disorder | output −50%, the build queue stops |
| 0–9 | Revolt | each turn a chance the colony declares independence; garrison troops reduce it |

## 7. Buildings

Each building can be built once per colony unless noted. Upkeep is in credits per turn.

| Building | Unlocked by | Cost | Upkeep | Effect |
|----------|------------|------|--------|--------|
| Gardener Foundry | homeworld only | — | 0 | +10 industry |
| Gardener Archive | homeworld only | — | 0 | +5 research |
| Spaceport | start | 50 | 1 | can build warships; fleet capacity +2 |
| Fusion Plant | start | 60 | 1 | +1 industry per industry worker |
| Planetary Defence Grid | start | 80 | 1 | planet battery in battles; garrison +25% |
| Militia Barracks | start | 50 | 1 | +4 garrison troops; troops raised here are Trained |
| Research Institute | Research Networks (Computing 1) | 80 | 1 | +1 research per scientist |
| Commerce Exchange | Trade Charters (Society 1) | 70 | 1 | +1 credit per merchant; trade treaty income +10% |
| Intelligence Bureau | Intelligence Service (Society 1) | 100 | 2 | capital only; +1 agent; espionage +1 |
| Orbital Shipyard | Orbital Construction (Materials 2) | 120 | 2 | ships −15% cost; needed for Cruiser and larger; fleet capacity +3 |
| Deep Mine | Deep Core Mining (Materials 2) | 100 | 1 | +3 industry, +6 if the world has a metals deposit |
| Cloning Centre | Cloning Vats (Life 2) | 80 | 1 | growth ×1.5 while below half the cap |
| Terraforming Station | Ecopoiesis (Life 2) | 120 | 2 | allows terraforming projects at this colony |
| Holo-Commons | Propaganda (Society 2) | 60 | 1 | stability +10 |
| Planetary Deflector | Magnetic Deflectors (Weapons 4) | 150 | 2 | planet takes −40% damage in battle; bombardment halved |
| Robotic Factory | Robotic Factories (Materials 4) | 150 | 2 | +1 industry per worker, +3 industry |
| AI Lab | Machine Learning Labs (Computing 4) | 180 | 2 | +1 research per scientist, +3 research |
| Antimatter Plant | Antimatter Reactor (Weapons 5) | 250 | 3 | industry +20% |
| Launch Laser | Laser Launch Network (Propulsion 5) | 200 | 2 | civil ships launched here travel one speed tier faster |
| Quantum Research Centre | Quantum Computing (Computing 5) | 400 | 3 | +2 research per scientist; one per system |
| Media Network | Mass Media (Society 5) | 150 | 2 | stability +10; war weariness halved here |
| Space Elevator | Space Elevators (Materials 6) | 250 | 2 | colony, outpost and transport ships −30% here; industry +10% |
| Nanoforge | Molecular Assemblers (Materials 7) | 400 | 3 | +2 industry per worker |
| Planetary Laser Grid | Planetary Laser Grid (Weapons 8) | 300 | 3 | very strong planet battery |

That is 24 buildings, inside the planned 25–30. A few slots remain free for buildings the playtests ask for.

## 8. Projects (in a colony's build queue, not buildings)

| Project | Needs | Cost | Time (min.) | Effect |
|---------|-------|------|-------------|--------|
| In-system settlement | a colony in the system | Strong link 50 · Good 75 · Weak 100 · Remote 130 | 1 turn | new colony (1 bn) or outpost on another body of the system |
| Terraforming step | Terraforming Station | 100 × size factor (Tiny 0.5 … Huge 2) | 3–10 turns | temperature or atmosphere one step towards your Ideal |
| Habitat Ring | Orbital Habitats | 200 | 2 turns | +4 bn cap around any body in the system |
| Gaia Transformation | Gaia Transformation, Ideal world | 600 | 10 turns | Gaia world |
| Ecumenopolis | Ecumenopolis, Ideal/Good world | 1000 | 15 turns | ×1.5 cap, industry +10% |
| Dyson Swarm | Dyson Swarm | 2000 | 20 turns | all your colonies in the system: industry +50% |
| Gardener Archive (Legacy) | 3 Archive Keys + Archive Decryption, capital | 3000 | 10 turns | Legacy victory (design.md §15) |

"Time (min.)" is a floor that money and industry can't shorten. Terraforming takes decades whatever you pay.

## 9. Founding colonies, outposts, transfers

| Item | Cost | Notes |
|------|------|-------|
| Colony ship | 100 industry | carries 1 bn (+1 Cryo Stabilisation, +2 Seedships); founding uses up the ship |
| Outpost ship | 40 industry | claims a body; supply node |
| In-system settlement | §8 | no ship needed |
| Population transfer | order, 20 credits per bn | travels at the drive speed; Interstellar Logistics halves the cost |

**Outposts:** no population. They claim a body, act as a supply node, deliver deposits (§10) and,
after Fuel Skimming, act as a fuel depot on gas giants. Upkeep 0.5.

## 10. Deposits

| Deposit | Effect | Where |
|---------|--------|-------|
| Metals (normal / rich) | +3 / +6 industry | rocky worlds, belts |
| Volatiles | growth ×1.15 for the system's colonies; +2 ly supply | ice moons, comets, gas giants |
| Rare elements | +4 research | belts, small rocky worlds |
| Exotics (gems, unusual isotopes) | +6 credits | rare, anywhere |

A deposit on a colonised world goes fully to that colony. A deposit on an outpost goes to the best-linked colony in the
system at the link's share (Strong 100%, Good 75%, Weak 40%, Remote 15%; design.md §7.8).

## 11. Natives

Worlds with a complex biosphere sometimes have **sapient natives** (2–6 bn, their own species
sheet with Troops and Stability). They can join peacefully (a diplomacy-like offer, easier with
Xenobiology and Cosmopolitan) or be invaded. Joined natives keep working at their own aptitudes.

## 12. Starting state (every empire)

| Item | Value |
|------|-------|
| Homeworld | 8 bn of 12.5 bn cap (Medium homeworld; other sizes per origin) |
| Buildings | Gardener Foundry, Gardener Archive, Spaceport, Fusion Plant, Planetary Defence Grid |
| Ships | 1 colony ship, 2 probes, 2 corvettes |
| Treasury | 50 credits |
| Tax | Normal |

**Resulting start output** (Balanced focus, average species):

- Industry: 3.2 bn workers × (3 + 1 Fusion) + 10 Foundry ≈ **23**
- Research: 2.4 × 3 + 5 Archive ≈ **12**
- Credits: 2.4 × 3 + 8 tax ≈ **15**, minus upkeep ≈ 4 (3 buildings, 2 corvettes) → **+11 per turn**

A colony ship (100) therefore takes about 4–5 turns at the start. A first tier-1 tech (40) takes
about 3–4 turns.

## 13. Expected curve (for calibration)

| Turn | Colonies (typical) | Population | Industry | Research |
|------|--------------------|------------|----------|----------|
| 1 | 1 | 8 bn | 23 | 12 |
| 20 | 4–6 | 18 bn | 70 | 40 |
| 50 | 10–15 | 45 bn | 250 | 150 |
| 80 | 15–25 | 80 bn | 500 | 300 |
| 120 | 20–35 | 120 bn | 900 | 550 |

The balance harness compares real AI games with this curve and reports deviations.

## 14. Decisions

Q32 (per-worker building bonuses), Q33 (3-step taxes) and Q34 (population in billions, split by percentages) are accepted (design.md D38).
