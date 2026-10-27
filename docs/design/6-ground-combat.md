# Astralis — Ground combat, bombardment, conquest (detail)

Part of the design plan ([design.md](../design.md) §11). Draft, planning only.

## 1. Where it sits in the turn

Everything is resolved inside `processTurn`, with no pauses (in the spirit of D15):

1. movement
2. space battles (design.md §10)
3. **landings**, if the conditions of the invasion order are met (§3)
4. **ground combat**
5. **bombardment**
6. conquest effects (§8)

## 2. Orbit control

A side has **orbit control** over a colony when, after the space battle, no armed enemy ships or
stations remain in the system (or there was no battle because nobody defended).

## 3. The invasion order (no holdup, like strategies)

An invasion is a standing order on a fleet carrying troops (transports or warships with troop
pods). It has two conditions that the player sets in advance:

| Condition | Default |
|-----------|---------|
| Land only if orbit control is won | on |
| Land only if the estimated chance of success is at least X% | 60% |

- The **estimate** is computed at turn end from what you know (intel age is shown). It runs the
  ground combat rules many times, which is cheap.
- If a condition fails, the troops stay in orbit and try again next turn.
- "Land anyway" without orbit control: each surviving defence platform or planet battery destroys
  25% of the transports before landing.
- The invasion planner shows the **current** estimate during your turn, with the breakdown and a
  hint ("2 more transports raise this to 80%").

## 4. Troops

| Unit | Strength | Source |
|------|----------|--------|
| Assault troops | 10 | transports (4 units, built loaded; ships doc §2), troop pods (1 each) |
| Garrison troops | 10 | Militia Barracks (+4), or a "Raise garrison" project (2 units for 20 industry) |
| Militia | 5 | the population: 1 unit per 2 bn (Hive mind: strength 7.5; Synthetic: 10) |

## 5. Strength modifiers

All modifiers go into one additive pool per side, as everywhere else (design.md §5.13).

| Modifier | Value |
|----------|-------|
| Species Troops aptitude | −25% / +25% / +50% |
| Government | Autocracy / Communion +25% |
| Ground armour (from Materials armour tech) | Titanium +10%, Nanotube +20%, Diamondoid +30%, Metamaterial +40% |
| Personal weapons (best laser or kinetic tier) | +5% per tier above 1 |
| **Gravity mismatch** (attacker) | fighting on a lighter world than home: High +15%, Crushing +30%; on a heavier world: −15% per gravity class |
| Hostile environment (attacker on a world they rate Hostile/Lethal) | −20% (Environmental Assault Gear halves it; Hardy: none) |
| Experience (not militia) | Trained +5%, Veteran +10%, Elite +15% |
| Defence Grid (defender) | +25% |
| Subterranean species defending | +50% |
| Cybernetic special | +25% |
| Leaders | Admiral "Ground Assault" or Governor "Fortification" skill +10–20% |

## 6. Resolution

- Up to 10 rounds. Each round both sides deal damage at the same time:
  `damage = Σ (unit strength × modifiers) × random(0.8 … 1.2) × 0.1`.
  Each 10 points of damage remove one unit. Militia go first, then garrison troops.
- The side left with units wins. After 10 rounds with both sides left, the defender holds.
- **The attacker can't retreat:** a failed invasion loses all its landed troops.
- Deterministic through the game's seeded RNG.

## 7. Special worlds

| Target | Rule |
|--------|------|
| **Aerial colonies** (gas giants, crushing atmospheres) | only with Environmental Assault Gear (Materials 3) (Q45) |
| **Aquatic colonies** (oceans, subsurface oceans) | the same; under-ice colonies also defend +50% |
| **Habitat Rings** | normal invasion, but militia at half strength (no terrain) |
| **Outposts** | no defenders: captured by any landing troops, or destroyed by an armed ship (order: capture / destroy) |
| **Natives** | defend with their own troops and modifiers |

Exotic species thereby get a natural defence. They have to be out-teched, not just out-numbered.

## 8. Conquest effects

**On success:**

- The colony changes owner. Its population stays, with its own species and aptitudes.
- Each building has a 25% chance to be destroyed.
- "Recently conquered": stability −30, fading (economy doc §6).
- **Tech capture:** 50% chance to gain one tech the defender has and you lack (Q46).
- **Capital lost:** the defender moves its capital to its largest colony, with 1 turn of disorder (output −50%).

**Integration:** a conquered population is *integrating* for a while (−25% output, may rebel),
then becomes full citizens:

| Lifespan | Ephemeral | Short | Normal | Long | Ancient |
|----------|-----------|-------|--------|------|---------|
| Integration (turns) | 4 | 6 | 10 | 16 | 24 |

It is shortened by Communion (×1.5 speed), Cosmopolitan, Universal Antidotes, Cultural Exchange
and Xeno-Integration.

**Integrated populations can colonise** with *their* environment profile. Conquering (or
befriending) a species with a different profile opens up new worlds for your empire, as in MOO2,
and matters even more here.

**Elimination:** an empire with no colonies left is out. (Nomad fleet origin: its habitat ships
count as colonies.)

## 9. Bombardment

A standing order for a fleet with orbit control: **Bombard: defences / infrastructure /
population**.

- Bombard rating = the fleet's total weapon damage × 0.1 per turn.
- Order of damage: defences first (grid, platforms), then buildings, then population (up to −15%
  per turn).
- It also kills militia and garrison, so it is the usual preparation for an invasion.
- Planetary Deflector: halved. Subterranean species: population losses halved. Mind Uploading:
  no population losses.
- Diplomatic cost: −5 attitude with everyone, −20 with the victim (diplomacy doc §3).

## 10. Relativistic impactors (optional rule)

The game's weapon of mass destruction: a real concern of interstellar strategy, made a war crime
in game terms.

- Needs **Relativistic Impactors** (Propulsion 8). Built at a colony: 300 industry, at least 3 turns.
- **Launch order** at any colony within 15 ly. It flies at 0.99 c (~5 ly per turn). The attacker
  knows the arrival turn.
- **Defence:** with Deep-Space Tracking, an impactor is detected 1 turn before arrival. A detected
  impactor can be destroyed by a Planetary Laser Grid (50%) or Graser point defence of ships in the
  system (25% per fleet).
- **On impact:** the colony is destroyed (all population and buildings), and the world becomes
  Lethal for 20 turns.
- **Consequences:** attitude −100 with everyone, reputation −50, and the **Custodians** declare war
  on the user and start raiding their systems (design.md §14.2).
- AI use: only by Opportunist/Militarist personalities in desperate wars, or in retaliation.

## 11. Revolts and independence

- A colony in **Revolt** (stability below 10) has a chance each turn to declare independence:
  10% minus 1% per garrison unit.
- An independent colony becomes a small neutral minor with its garrison. It can be re-invaded or
  re-joined by an offer, once the reasons for the revolt are fixed.

## 12. Presentation

- Ground combat is **not** shown in 3D in v1. The turn report shows a card: forces and
  modifiers on both sides, a round-by-round strength chart, the outcome, and captured techs.
- The invasion planner (§3) is the main UI: odds, breakdown, hints.
- A short cinematic for captured capitals can come later.

## 13. Decisions

Q43 (invasion orders with conditions), Q44 (impactors on by default), Q45 (assault gear for aerial and aquatic colonies) and Q46 (tech capture) are accepted (design.md D38).
