# Astralis — Research (detail)

Part of the design plan ([design.md](../design.md) §8). Draft, planning only. All numbers are
starting values for calibration.

## 1. Rules

### 1.1 Structure

- **Six fields:** Propulsion, Energy & Weapons, Materials, Life Sciences, Computing, Society.
- Each field has **8 tiers**. Each tier offers **3 projects** (occasionally 4).
- To open tier N of a field, you must have finished **one** project of tier N−1 in that field.
  There are **no cross-field prerequisites** (Q29). This keeps the tree readable as six
  independent ladders.
- **The pick rule (MOO2's signature, softened):** the first project you finish in a tier is your
  *pick*. The other projects of that tier stay available at **×2 cost** (Normal species), or ×1
  (Creative), or become locked (Rigid). See species §5.9.
- After tier 8, each field has a **repeatable** project (§8).
- **Gardener studies** (§9) are a seventh, special list, unlocked only by artifacts.

### 1.2 Research flow

- **One project at a time, with a queue** (Q30). Research points from all colonies go into the
  current project; overflow carries into the next one. That is the simplest model, as in MOO2.
- The research screen shows six columns (the fields), the current tier's options as cards, and a
  queue bar at the bottom.

### 1.3 Costs and pacing

| Tier | Cost (research points) | Typical turn reached (average empire) |
|------|------------------------|----------------------------------------|
| 1 | 40 | 3–8 |
| 2 | 80 | 8–18 |
| 3 | 150 | 15–30 |
| 4 | 260 | 25–45 |
| 5 | 420 | 35–60 |
| 6 | 650 | 50–75 |
| 7 | 1000 | 65–95 |
| 8 | 1500 | 80–115 |

Pacing check (to be verified by AI batch runs): a start empire makes ~12 research per turn, a
mid-game empire 100–250, a large late-game empire 500+. The full pick path (48 picks) costs about
24,500. A research-focused empire finishes all picks around turn 90–110 of 120. A balanced empire
gets about 6 of the 8 tiers in most fields.

### 1.4 Miniaturisation

Each further tier you finish in a field shrinks the *space* of that field's older ship components
by 10%, down to 50%. Old weapons stay useful as light, cheap options (as in MOO2).

### 1.5 The Gardener starter kit (what everyone starts with)

| Field | Starting knowledge |
|-------|--------------------|
| Propulsion | Fusion Torch (speed 1 ly/turn), supply range 6 ly, probes |
| Energy & Weapons | Fusion Reactor, Pulse Laser, Coilgun, Chemical Missile |
| Materials | Composite Armour, Corvette and Frigate hulls, Defence Platform, civil hulls |
| Life Sciences | Pressure Domes, Cryo-colonisation |
| Computing | Basic Telescopes (8 ly, giant planets), Battle Computer I, tanglelinks |
| Society | your species' government (fixed, governments doc) |

---

## 2. Propulsion

| Tier | Projects |
|------|----------|
| **1** | **Improved Fusion:** drive speed 1.5 ly/turn · **Extended Tankage:** supply range +2 ly · **Lightweight Probes:** probes −50% cost, probe sensors reveal moons |
| **2** | **Fuel Skimming:** gas giant outposts become fuel depots (+3 ly supply from that system) · **Orbital Tugs:** in-system settlement projects (system links) −30% cost · **Cryo Stabilisation:** colony ships carry +1 pop, transports +50% capacity |
| **3** | **Antimatter Catalysis:** speed 2.25 · **Deep-Space Depots:** Fuel Depot station, a supply node in any system · **Combat Thrusters:** battle acceleration +20% |
| **4** | **Magnetic Sails:** supply range +3 ly · **Interstellar Logistics:** population transfers −50% cost and travel one speed tier faster · **Vectored Thrust:** turn rate +30%, evasion against kinetics +10% |
| **5** | **Antimatter Beam Core:** speed 3.0 · **Laser Launch Network:** Launch Laser building; civil ships starting there travel one tier faster · **Fusion Afterburners:** battle top speed +25% |
| **6** | **Ramscoop:** speed 3.75, supply +2 ly · **Deep Hibernation:** supply range +4 ly · **Battle Drive:** battle acceleration +30% (stacks with Combat Thrusters) |
| **7** | **Relativistic Drive:** speed 4.5 · **Starlifting:** every system with your colony extends supply +3 ly; ships built there −10% cost · **Strategic Redeployment:** fleets moving between your own systems travel one tier faster |
| **8** | **Field Theory:** with a Gardener drive artifact unlocks the Field Drive (5 ly/turn), otherwise speed +10% · **Relativistic Impactors:** the RKV weapon (optional rule, see ground combat doc) · **Beamed Power Network:** all ships leaving your colony systems travel one tier faster |

**Repeatable — Advanced Propulsion:** supply range +1 ly, battle acceleration +5%.

Note: drive tiers are in the odd tiers (1, 3, 5, 6, 7). A player who prefers range or battle
manoeuvre can skip a drive and buy it later at ×2. That is the intended tension.

---

## 3. Energy & Weapons

| Tier | Projects |
|------|----------|
| **1** | **Point-Defence Laser:** PD component against missiles · **Railgun:** kinetic line tier 2 · **Fusion Missile:** missile line tier 2 |
| **2** | **UV Laser:** laser line tier 2 · **High-Output Reactor:** ship power ×1.3 · **Guided Slugs:** kinetic accuracy at long range +20% |
| **3** | **X-Ray Laser:** laser tier 3 · **Mass Driver:** spinal kinetic weapon · **Droplet Radiators:** heat dissipation +50%, laser damage +10% |
| **4** | **Neutral Particle Beam:** particle line tier 1 · **Antimatter Warhead:** missile tier 3 · **Magnetic Deflectors:** deflector component (particle beams −40%, kinetics −15%), Planetary Deflector building |
| **5** | **Antimatter Reactor:** ship power ×1.7 (replaces ×1.3), Antimatter Plant building · **Hypervelocity Railgun:** kinetic tier 3 · **Swarm Missile:** missile tier 4 (splits into several warheads) |
| **6** | **Gamma-Ray Laser (graser):** laser tier 4 · **Proton Lance:** particle tier 2, spinal · **Flak Railgun:** kinetic point defence, strong against swarms |
| **7** | **Antiproton Beam:** particle tier 3 · **Autonomous Missile:** missile tier 5 (re-targets, evades point defence) · **Graser Point Defence:** best point defence |
| **8** | **Relativistic Slug Thrower:** ultimate spinal kinetic · **Planetary Laser Grid:** huge planet-based laser battery · **Coherent Arrays:** all lasers +25% range |

**Repeatable — Advanced Weapons:** weapon damage +5%.

The four weapon families and their counters are described in design.md §10.8. Each family has
one line in this field, so a player can specialise or spread out.

---

## 4. Materials

| Tier | Projects |
|------|----------|
| **1** | **Destroyer Hull** · **Titanium Composite:** armour tier 2 · **Automated Mining:** deposits +25% |
| **2** | **Orbital Construction:** Orbital Shipyard building (ship cost −15%; needed for Cruiser and larger) · **Whipple Shielding:** armour layer that halves kinetic and missile penetration · **Deep Core Mining:** Deep Mine building |
| **3** | **Cruiser Hull** · **Carbon Nanotube Armour:** armour tier 3 · **Asteroid Mining:** belt outposts give +industry to the system, belt habitats −30% cost · **Environmental Assault Gear:** invasions of Aerial and Aquatic colonies possible, troops +10% on Hostile worlds |
| **4** | **Reflective Armour:** lasers −30% · **Nanofabrication:** buildings −20% cost · **Robotic Factories:** Robotic Factory building |
| **5** | **Battleship Hull** · **Diamondoid Armour:** armour tier 4 · **Self-Repairing Hulls:** ships repair 2% hull per battle second after 10 s without hits, and fully between turns anywhere |
| **6** | **Space Elevators:** Space Elevator building · **Metamaterial Armour:** armour tier 5, ECM +1 · **Megastructure Engineering:** Habitat Rings hold twice the population |
| **7** | **Dreadnought Hull** · **Programmable Matter:** armour adapts, −20% from the weapon family that hit most this battle · **Molecular Assemblers:** Nanoforge building |
| **8** | **Dyson Swarm:** system megaproject · **Fortress Stations:** Star Fortress hull · **Monocrystal Hulls:** hull points +50% |

**Repeatable — Advanced Materials:** armour +5%, building cost −2%.

---

## 5. Life Sciences

Habitat caps refer to the habitability ratings in design.md §4.2 (base: Ideal 100%, Good 70%,
Harsh 40%, Hostile 15%, Lethal 0% at start).

| Tier | Projects |
|------|----------|
| **1** | **Arcologies:** Good +10%, Harsh +15% cap · **Closed Ecologies:** growth +25% on Hostile/Lethal colonies, dome stress halved · **Genetic Survey:** genetic adaptation I (widen one axis of all your species by one step; you choose the axis) |
| **2** | **Ecopoiesis:** terraforming level 1 (Terraforming Station building, one-step projects) · **Cloning Vats:** Cloning Centre building · **Xenobiology:** native biospheres +3 research each, natives join peacefully more easily |
| **3** | **Sealed Undercities:** Hostile +10%, Lethal 0 → 10% (Lethal worlds become colonisable) · **Gene Therapy:** leader tenure +50%, stability +5 · **Adaptation II:** another axis step |
| **4** | **Paraterraforming:** Hostile +10%, Lethal +10% (world-houses) · **Atmosphere Processors:** terraforming −40% time, chemistry changes become possible · **Universal Antidotes:** immune to plague events, conquered populations assimilate 25% faster |
| **5** | **Orbital Habitats:** Habitat Ring project (population in orbit around any body in a system with your colony) · **Neural Lace:** research +10%, stability +5 · **Engineered Microbiomes:** Harsh worlds count as Good for growth speed |
| **6** | **Full Terraforming:** terraforming may reach your Ideal temperature and chemistry · **Adaptation III:** another axis step · **Bioindustry:** industry +10% |
| **7** | **Gaia Transformation:** project turning an Ideal world into a Gaia world (+25% cap, +10 stability) · **Longevity Treatment:** leader tenure ×2, stability +10 · **Pantropy:** settle Hostile worlds with an engineered variant of your species that rates them Harsh |
| **8** | **Ecumenopolis:** city-world project for Ideal/Good worlds (+50% cap, +10% industry) · **Mind Uploading:** bombardment and invasion kill no population (minds are backed up); leaders never die of age · **Seedships:** colony ships −50% cost and carry +2 pop |

**Repeatable — Advanced Biology:** population cap +3%.

Genetic adaptation (Survey, II, III) always applies to **all** your species. Synthetic species get
"chassis upgrades" with the same effect from the same projects.

---

## 6. Computing

| Tier | Projects |
|------|----------|
| **1** | **Interferometry:** telescope range 12 ly, resolves rocky planets · **Targeting Computers:** Battle Computer II (+10% accuracy) · **Research Networks:** Research Institute building |
| **2** | **ECM Suite:** ECM component (missiles and kinetics −20% accuracy against the ship) · **Planetary Defence Network:** planet batteries +25% accuracy, detection +2 ly · **Administrative AI:** administration limit +2 colonies |
| **3** | **Gravitational Lens Telescope:** telescope range 18 ly, resolves moons · **Quantum Sensors:** fleet detection range ×1.5 · **Battle Computer III:** +20% accuracy (replaces II) |
| **4** | **Machine Learning Labs:** AI Lab building · **Cyberwarfare:** espionage +1 · **Deep-Space Tracking:** drive plumes seen at 2× range, relativistic impactors can be detected |
| **5** | **Quantum Computing:** Quantum Research Centre building · **Predictive Tactics:** strategy rules re-evaluate twice as often, evasion +10% · **Automated Governance:** colonies without a governor get +10 stability |
| **6** | **Battle Computer IV:** +30% accuracy · **Advanced ECM:** ECM −35% · **Telescope Swarm:** telescope range 30 ly, resolves everything |
| **7** | **Artificial General Intelligence:** research +25%, industry +10%, stability −5 (not for Synthetic species) · **Neural Net Defence:** planet defences +30% accuracy · **Sentient Ships:** crews gain experience twice as fast; unmanned warships possible (no crew experience, battle acceleration +30%) |
| **8** | **Archive Decryption:** progress toward the Gardener Archive (Legacy victory) · **Hyperintelligence:** research +30% (replaces AGI's +25%) · **Total Awareness:** espionage defence +3, all known species' colonies visible |

**Repeatable — Advanced Computing:** research +3%.

Telescope ranges and what they resolve feed the discovery mechanic (design.md §3.3).

---

## 7. Society

| Tier | Projects |
|------|----------|
| **1** | **Interstellar Law:** stability +5, administration limit +1 · **Trade Charters:** Commerce Exchange building, trade treaties +25% · **Intelligence Service:** Intelligence Bureau building, espionage +1 |
| **2** | **Colonial Administration:** administration limit +3, one extra governor · **Xenolinguistics:** attitude +10 with all, contacts can be shared · **Propaganda:** Holo-Commons building |
| **3** | **Bureaucratic Reform:** administration limit +2, governors +1 skill level · **Academies:** new leaders start one level higher, research +5% · **Civil Defence:** +2 garrison units per colony, militia strength +25% |
| **4** | **Interstellar Banking:** credits +15%, buying −25% · **Counterintelligence:** espionage defence +2 · **Cultural Exchange:** research treaties +50%, assimilation +25% |
| **5** | **Mass Media:** Media Network building · **Diplomatic Corps:** reputation +10, AI treaty acceptance + · **Sector Governance:** sectors with a governor count half towards the administration limit |
| **6** | **Constitutional Reform:** your (fixed) government becomes its mature form · **Deep Cover Operations:** espionage +2 · **Post-Scarcity Commerce:** credits +25% |
| **7** | **Cluster Media:** stability +10, enemies' war weariness +50% · **Xeno-Integration:** mixed-species colonies have no penalty, assimilation ×2 · **Free Trade Zone:** trade treaties +50%, foreign system links give the full bonus |
| **8** | **Grand Embassies:** attitude +15 with everyone, other members' Concord vote intentions shown · **Utopia Project:** stability +20 · **Psychohistory:** industry and credits +10%, AI intentions shown |

**Repeatable — Advanced Society:** stability +2, credits +3%.

---

## 8. Repeatables

After tier 8, each field has one repeatable project. It starts at 2000 points and gets 500 more
each time. Its effects are listed at the end of each field above. Repeatables keep late-game
research meaningful without new mechanics.

## 9. Gardener studies (artifacts)

Artifacts come from Gardener ruins and defeated Custodians (design.md §14). Each artifact unlocks
one study, researched normally (cost = tier 6 of the matching field).

| Study | Effect |
|-------|--------|
| **Field Drive** | 5 ly/turn, the speed of light in game terms (needs Field Theory) |
| **Veil Shield** | a true energy shield: absorbs damage and regenerates in battle |
| **Lattice Armour** | armour that ignores the first hit of every battle second |
| **Custodian Interface** | Custodians treat you as neutral |
| **Seed Vault** | one instant terraforming step per turn, empire-wide |
| **Archive Key (×3)** | one of the three keys for the Legacy victory |
| **Gardener Lens** | telescopes see the whole map, and through the light delay |

The Wardens' origin pick ("Gardener vault", species §5.10) starts with one of these.

## 10. Decisions

Q29 (no cross-field prerequisites), Q30 (one project at a time with a queue) and Q31 (miniaturisation) are accepted (design.md D38).
