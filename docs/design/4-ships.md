# Astralis — Ships: hulls and components (detail)

Part of the design plan ([design.md](../design.md) §9, §10). Draft, planning only. Battle units:
1 distance unit = 1000 km; a typical battle volume is ~300 units across. All numbers are
starting values for calibration with the strategy lab.

## 1. Design principles

- **Space is the budget.** Each hull has space; components use it (like MOO2).
- **Power is the second budget.** The built-in reactor gives power; energy weapons draw it.
  Kinetics need little power and missiles none. That makes the weapon families differ at design
  time, not only in battle.
- **Armour is heavy:** the more armour, the slower the ship accelerates. Tough-but-slow versus
  light-but-agile is a real choice in 3D.
- **The drive isn't a component.** Every hull has an integrated drive at your current speed
  tier. Refits upgrade it. That keeps the designer short.
- **Civil ships are fixed designs** (Q37). Colony ship, outpost ship, transport and depot ship
  improve automatically with tech and need no designing.

## 2. Hulls

| Hull | Space | Hull points | Battle accel (units/s²) | Cost | Upkeep | Fleet capacity | Needs |
|------|-------|-------------|-------------------------|------|--------|----------------|-------|
| Probe (unmanned) | 2 | 5 | — (never fights) | 12 | 0 | 0 | start |
| Corvette | 10 | 20 | 10 | 25 | 0.5 | 1 | start |
| Frigate | 20 | 45 | 8 | 45 | 1 | 1 | start |
| Destroyer | 35 | 80 | 6.5 | 80 | 1.5 | 2 | Destroyer Hull (Materials 1) |
| Cruiser | 60 | 150 | 5 | 140 | 2.5 | 3 | Cruiser Hull (Materials 3) + Orbital Shipyard |
| Battleship | 100 | 280 | 3.5 | 240 | 4 | 5 | Battleship Hull (Materials 5) + Orbital Shipyard |
| Dreadnought | 160 | 480 | 2.5 | 400 | 6 | 8 | Dreadnought Hull (Materials 7) + Orbital Shipyard |
| Defence Platform (station) | 40 | 120 | immobile | 80 | 1 | 0 | start; built at a colony, stays there |
| Star Fortress (station) | 200 | 800 | immobile | 600 | 5 | 0 | Fortress Stations (Materials 8) + Orbital Shipyard |

**Spinal mounts:** one per hull, Destroyer and larger.

**Civil ships (fixed designs):**

| Ship | Cost | Upkeep | Carries | Notes |
|------|------|--------|---------|-------|
| Colony ship | 100 | 1 | 1 bn (+1 / +2 with techs) | used up on founding |
| Outpost ship | 40 | 0.5 | outpost kit | used up on founding |
| Transport | 40 | 0.5 | 4 troop units (built loaded) | for invasions; people move by transfer order (economy doc §9) |
| Depot ship | 60 | 1 | depot kit | deploys a Fuel Depot station in any system (Deep-Space Depots, Propulsion 3) |

Civil ships are unarmed. In battle they follow the "Evasive" doctrine and are the favourite target
of Raider strategies.

## 3. Battle acceleration and mass

```
acceleration = hull accel × space / (space + armour space)
               × (1 + crew g-tolerance + propulsion techs)
```

- An unarmoured ship moves at the hull's full acceleration. A cruiser with 24 of 60 space in armour
  moves at 60/84 ≈ 71%.
- Crew g-tolerance (species §5.3): Low −20%, High +20%, Crushing +40%.
- Techs: Combat Thrusters +20%, Battle Drive +30%, Advanced Propulsion +5% each.
- Unmanned warships (Sentient Ships, Computing 7): +30%, but no crew experience.
- Turn rate follows the same factor. Vectored Thrust +30%.

## 4. Power (and heat)

```
power available = hull space × reactor factor
reactor factor  = Fusion 0.5 · High-Output 0.65 · Antimatter 0.85
```

- Example: a fusion cruiser (60 space) has 30 power.
- An **Auxiliary Reactor** component (4 space, +4 power) lets energy-heavy designs go further.
- **Heat (if switched on, D25):** each second, firing adds heat equal to the power used. Radiators
  remove `hull space × 0.4` per second (Droplet Radiators +50%). A ship running everything at once
  overheats slowly; strategies can say "cool down at 80%".

## 5. Weapons

### 5.1 Mount sizes

| Mount | Space | Damage | Range | Arc |
|-------|-------|--------|-------|-----|
| Light | ×1 | ×1 | ×1 | turret, wide |
| Medium | ×2.5 | ×2.5 | ×1.05 | turret |
| Heavy | ×5 | ×5.5 | ×1.1 | turret, narrower |
| Spinal | ×10 | ×12 | ×1.25 | fixed forward ±10°; the ship must turn to aim |

Bigger mounts are a bit more efficient per space; spinal mounts are most efficient but hardest to
use. That is where real 3D movement and good strategies pay off.

### 5.2 Weapon lines (Light-mount values)

Power per Light mount: lasers 2, particle beams 3, kinetics 1, missiles 0.

| Line | Tier | Weapon | Damage | Rate | Range | Space | Special |
|------|------|--------|--------|------|-------|-------|---------|
| Lasers | 1 | Pulse Laser | 4 | 1/s | 60 | 3 | hit instantly; damage falls from 100% at half range to 40% at max |
| | 2 | UV Laser | 6 | 1/s | 70 | 3 | |
| | 3 | X-Ray Laser | 9 | 1/s | 80 | 3 | |
| | 4 | Gamma-Ray Laser | 13 | 1/s | 90 | 3 | |
| Kinetics | 1 | Coilgun | 6 | 0.5/s | 50 | 3 | slug speed 10 units/s, can be dodged at range |
| | 2 | Railgun | 9 | 0.5/s | 60 | 3 | speed 15 |
| | 3 | Hypervelocity Railgun | 13 | 0.5/s | 70 | 3 | speed 25 |
| | spinal | Mass Driver | 60 (as spinal) | 0.25/s | 90 | 30 | speed 20 |
| | spinal | Relativistic Slug Thrower | 200 (as spinal) | 0.1/s | 150 | 30 | speed 60, nearly undodgeable |
| Missiles | 1 | Chemical Missile | 15 | 1 salvo / 6 s | 150 | 4 | 6 salvos of ammo, homing |
| | 2 | Fusion Missile | 22 | 1 / 6 s | 180 | 4 | |
| | 3 | Antimatter Warhead | 35 | 1 / 6 s | 200 | 4 | |
| | 4 | Swarm Missile | 4 × 12 | 1 / 8 s | 200 | 4 | splits; point defence must kill each warhead |
| | 5 | Autonomous Missile | 45 | 1 / 6 s | 250 | 4 | evades point defence, re-targets |
| Particle | 1 | Neutral Particle Beam | 8 | 1/s | 40 | 4 | ignores 50% of armour |
| | spinal | Proton Lance | 70 (as spinal) | 0.5/s | 60 | 40 | ignores 50% of armour |
| | 3 | Antiproton Beam | 14 | 1/s | 50 | 4 | ignores 75% of armour |

### 5.3 Point defence

| PD | Space | Power | Range | Effect |
|----|-------|-------|-------|--------|
| PD Laser | 2 | 1 | 15 | 30% chance per second to kill a missile in range |
| Flak Railgun | 3 | 0.5 | 20 | 40%, hits every warhead of a swarm in its cone |
| Graser PD | 2 | 1 | 25 | 60% |

### 5.4 Planet weapons

Planets fight with the **Planetary Defence Grid** (battery strength = your best laser and kinetic
tier, scaled by colony size) and the **Planetary Laser Grid** (very strong, long range). Defence
Platforms and Star Fortresses are designed like ships.

## 6. Defence

### 6.1 Armour (by Materials tech)

| Armour | Points per space | Notes |
|--------|------------------|-------|
| Composite | 4 | start |
| Titanium Composite | 6 | |
| Carbon Nanotube | 9 | |
| Diamondoid | 13 | |
| Metamaterial | 17 | ECM +1 |

Empire-wide armour modifiers: **Reflective Armour** (lasers −30%), **Programmable Matter** (−20%
against the family that hit most), **Monocrystal Hulls** (hull points +50%).

Damage goes to armour first, then to hull. Particle beams pass partly through armour (§5.2).

### 6.2 Defensive components

| Component | Space | Effect |
|-----------|-------|--------|
| Whipple Layer | 10% of hull space | kinetic and missile damage −25% |
| Magnetic Deflector | 5% of hull space | particle beams −40%, kinetics −15% |
| ECM Suite | 5% of hull space | missiles and kinetics −20% accuracy (Advanced ECM −35%) |
| Veil Shield (artifact) | 10% of hull space | shield = 30% of hull points, regenerates 2% per second |

### 6.3 Subsystem damage

Each hull hit has a chance (higher when armour is gone) to knock out a subsystem: **drive** (no
acceleration), **weapons** (a random weapon), **sensors** (accuracy −30%), **reactor** (power
halved). Damaged subsystems are repaired between turns.

## 7. Other components

| Component | Space | Effect |
|-----------|-------|--------|
| Auxiliary Reactor | 4 | +4 power |
| Extended Sensors | 3 | detection +50%, accuracy +5% |
| Fuel Tanks | 3 | this ship may go 2 ly beyond supply range |
| Troop Pod | 5 | carries 1 troop unit (assault warships) |
| Battle computer | built-in | current tier (Battle Computer I–IV) |

## 8. Costs

```
ship cost = hull cost + Σ component cost
weapons   = 3 per space × (1 + 0.1 × tier)
armour    = 2 per space
others    = 3 per space (artifacts 6)
```

- Orbital Shipyard −15%, Autocracy −10% (Imperium −20%), Starlifting −10% at those systems,
  Federation +10%. All additive.
- Miniaturisation (research doc §1.4) lowers the space of older components, not their cost.

Example: a fusion-era **Frigate "Line"** = 20 space: 3 × Pulse Laser (9 space, 6 power), 1 × PD
Laser (2), 9 armour space (36 armour points). Power 10 available, 7 used. Cost 45 + 9×3.3 + 2×3.3
+ 9×2 ≈ 99. Acceleration 8 × 20/29 ≈ 5.5.

## 9. Fleet capacity

```
capacity = 6 + 2 per Spaceport + 3 per Orbital Shipyard + 2 per Admiral
```

Every capacity point over the limit costs 3 extra credits per turn. One bar on the fleet screen
shows "Fleet capacity 27 / 30".

## 10. Crew experience

| Level | Accuracy and evasion | Reached after |
|-------|----------------------|---------------|
| Green | +0% | new ship |
| Trained | +5% | 1 battle (or built at a colony with Militia Barracks) |
| Veteran | +10% | 3 battles |
| Elite | +15%, reacts faster | 6 battles |

Lifespan matters (species §5.7): experience drops one level every **3 turns** (Ephemeral),
**8 turns** (Short), **18 turns** (Normal), and never (Long, Ancient). Sentient Ships doubles
experience gain. Unmanned ships have none.

## 11. Repair

- In a system with your colony: fully repaired between turns.
- Elsewhere inside supply range: 25% per turn.
- Outside supply: none (Self-Repairing Hulls: full repair anywhere).

## 12. Refit

At a Spaceport (up to Destroyer) or Orbital Shipyard (any size): the ship takes the new design.
Cost = difference in component cost + 10% of the new design. Takes 1 turn. Upgrading the drive to
the current tier alone costs 10% of the hull cost.

## 13. The designer (UX)

- **Templates first:** pick a role (Line, Brawler, Skirmisher, Sniper, Escort, Missile boat,
  Interceptor, Raider, Assault, Defender) and a hull, then press "Auto-design". You get the best
  design with your current tech, plus the matching default strategy (design.md §10.5). The AI
  uses the same code.
- **Manual design:** a list of slots with space, power (and heat) shown as bars. Stats: armour,
  hull, damage per second at short/medium/long range, acceleration, cost and upkeep.
- **Effectiveness preview:** quick duels (1 vs 1 and 5 vs 5) against a known enemy design, using
  the real battle sim (the strategy editor's test range).
- Designs that are outdated get a marker, with a one-click "update to newest tech" (a new design,
  then refit).

## 14. Decisions

Q37 (fixed civil designs), Q38 (power budget) and Q39 (armour slows acceleration) are accepted (design.md D38).
