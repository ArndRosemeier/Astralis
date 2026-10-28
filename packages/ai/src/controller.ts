/** Deterministic production AI. Every action uses the same commands as a human. */
import type { BuildOrder, Command, Empire, Fleet, Focus, GameState, Planet, Species, StarSystem } from '../../sim/src/types';
import { canMove, canQueue, cost, relation, score } from '../../sim/src/engine';
import { aptitude, autoDesign, availableResearch, BUILDINGS, canBuild, capacity, colonies, designStats, government, habitability, has, output, pick, researchCost, speciesFor, stability } from '../../sim/src/rules';
import { distance, seedHash } from '../../sim/src/math';
import { observedSystem } from '../../sim/src/intel';

type Intent = Command extends infer C ? C extends Command ? Omit<C, 'empire'> : never : never;
const resourceTechs: Record<string, number> = {
  'improved-fusion': 155, 'interferometry': 125, 'research-networks': 140,
  'interstellar-law': 145, 'trade-charters': 110, 'extended-tankage': 110,
  'propaganda': 125, 'administrative-ai': 110, 'colonial-administration': 115,
  'bureaucratic-reform': 105, 'ecopoiesis': 100, 'genetic-survey': 95,
  'orbital-construction': 95, 'destroyer-hull': 80, 'cruiser-hull': 85,
  'gravitational-lens-telescope': 90, 'antimatter-catalysis': 100,
  'neural-lace': 115, 'gene-therapy': 110, 'mass-media': 110,
  'constitutional-reform': 145, 'utopia-project': 115, 'cluster-media': 115,
  'sealed-undercities': 90, 'paraterraforming': 90, 'arcologies': 95,
  'machine-learning-labs': 100, 'quantum-computing': 100, 'robotic-factories': 100,
  'interstellar-banking': 105, 'artificial-general-intelligence': 100,
  'artificial-general-intelligence-agi': 100, 'hyperintelligence': 100,
  'intelligence-service': 85, 'counterintelligence': 80,
};
const compareId = (a: string, b: string) => a < b ? -1 : a > b ? 1 : 0;

export function administrationLimit(game: GameState, empire: Empire) {
  return government(speciesFor(game, empire), empire).admin + (has(empire, 'administrative-ai') ? 2 : 0) + (has(empire, 'colonial-administration') ? 3 : 0) + (has(empire, 'bureaucratic-reform') ? 2 : 0);
}

function fleetPower(game: GameState, fleet: Fleet) {
  const empire = game.empires[fleet.owner]!, species = speciesFor(game, empire);
  return fleet.ships.reduce((sum, ship) => {
    const design = game.designs[fleet.owner]?.find(design => design.id === ship.designId);
    if (!design) return sum;
    const stats = designStats(design, empire, species);
    return sum + stats.damage * 4 + ship.hp + stats.armour * .5;
  }, 0);
}

function pathStep(game: GameState, fleet: Fleet, destination: StarSystem, known: Set<string>) {
  if (fleet.systemId === destination.id) return null;
  if (!canMove(game, fleet, destination.id)) return destination;
  const current = game.systems.find(system => system.id === fleet.systemId)!;
  return game.systems.filter(system => known.has(system.id) && !canMove(game, fleet, system.id) && distance(system, destination) < distance(current, destination) - .1)
    .sort((a, b) => distance(a, destination) + distance(a, current) * .15 - distance(b, destination) - distance(b, current) * .15 || compareId(a.id, b.id))[0] ?? null;
}

function terraformGain(planet: Planet, species: Species, empire: Empire) {
  const improved = { ...planet, temperature: planet.temperature + Math.max(-50, Math.min(50, species.temperature - planet.temperature)) };
  if (Math.abs(species.temperature - planet.temperature) < 25) improved.chemistry = species.chemistry;
  return capacity(improved, species, empire) - capacity(planet, species, empire);
}
function terraformPotential(planet: Planet, species: Species, empire: Empire) {
  return capacity({ ...planet, temperature: species.temperature, chemistry: species.chemistry }, species, empire) - capacity(planet, species, empire);
}

export function productionOrders(game: GameState, id: number): Command[] {
  const empire = game.empires[id];
  if (!empire || empire.eliminated || game.winner !== null) return [];
  const autoResearch = empire.ai || empire.automation.research;
  const autoColonies = empire.ai || empire.automation.colonies;
  const autoFleets = empire.ai || empire.automation.fleets;
  if (!autoResearch && !autoColonies && !autoFleets) return [];
  const orders: Command[] = [];
  const emit = (intent: Intent) => orders.push({ ...intent, empire: id } as Command);
  const species = speciesFor(game, empire);
  const worlds = colonies(game, id);
  const known = new Set(empire.known);
  const systems = new Map(game.systems.map(system => [system.id, system]));
  const observedSystems = game.systems.filter(system => known.has(system.id)).map(system => observedSystem(game, id, system));
  const ownFleets = game.fleets.filter(fleet => fleet.owner === id);
  const ownedOutputs = worlds.map(planet => output(game, planet, empire));
  const averageStability = ownedOutputs.reduce((sum, value) => sum + value.stability, 0) / Math.max(1, worlds.length);
  const poorestStability = Math.min(100, ...ownedOutputs.map(value => value.stability));
  const admin = administrationLimit(game, empire);
  const strained = worlds.length >= admin - 1 || averageStability < 55;
  const warRelations = game.relations.filter(relation => relation.state === 'War' && (relation.a === id || relation.b === id));
  const atWar = warRelations.length > 0;
  const military = empire.personality === 'Militarist' || empire.personality === 'Opportunist';
  const expansionist = empire.personality === 'Expansionist';
  const scholar = empire.personality === 'Scholar';
  const trader = empire.personality === 'Trader' || empire.personality === 'Diplomat';
  const synthetic = species.frame === 'Synthetic';
  const fleetUpkeep = ownFleets.reduce((sum, fleet) => sum + fleet.ships.reduce((sum, ship) => {
    const design = game.designs[id]?.find(design => design.id === ship.designId);
    return sum + (design ? designStats(design, empire, species).upkeep : ship.kind === 'probe' ? 0 : 1);
  }, 0), 0);
  const netIncome = ownedOutputs.reduce((sum, value) => sum + value.credits, 0) - fleetUpkeep - empire.leaders.length;
  let availableCash = empire.credits;
  let plannedExpansion = 0;
  let queuedColonisers = 0;
  const newDesigns = new Set<string>();
  const reservations = new Set(ownFleets.filter(fleet => fleet.targetPlanet).map(fleet => fleet.targetPlanet));
  const capacityCache = new Map<string, number>();
  const projectedMoraleCache = new Map<string, number>();
  const targetCapacity = (target: Planet) => {
    let value = capacityCache.get(target.id);
    if (value === undefined) { value = capacity(target, species, empire); capacityCache.set(target.id, value); }
    return value;
  };
  const unclaimedKnown = observedSystems.flatMap(system => system.planets).filter(target => target.owner === null);

  // Estimate the new colony's morale before ordering expansion. Hive immunity is an actual
  // advantage, but ordinary empires must research administration instead of suicidally growing.
  const expansionAllowed = (target?: Planet) => {
    if (!target) return worlds.length + plannedExpansion < admin + (pick(species, 'hive-mind') ? 10 : 4);
    let baseMorale = projectedMoraleCache.get(target.id);
    if (baseMorale === undefined) {
      const future = { ...target, owner: id, speciesId: species.id, population: 1, buildings: [], integration: 0 };
      baseMorale = stability(game, future, empire, species);
      projectedMoraleCache.set(target.id, baseMorale);
    }
    const prospective = baseMorale - Math.max(0, worlds.length + plannedExpansion + 1 - admin) * 2 + Math.max(0, worlds.length - admin) * 2;
    return prospective >= 38 && (pick(species, 'hive-mind') || poorestStability >= 30);
  };

  if (autoResearch && empire.research.length === 0) {
    const candidates = availableResearch(empire).filter(tech => Number.isFinite(researchCost(empire, species, tech.id)));
    const thermalWorlds = worlds.filter(planet => terraformPotential(planet, species, empire) > .1);
    const researchUtility = (tech: typeof candidates[number]) => {
      let value = resourceTechs[tech.id] ?? 55;
      if (strained && ['propaganda', 'administrative-ai', 'colonial-administration', 'bureaucratic-reform', 'interstellar-law', 'gene-therapy', 'constitutional-reform', 'mass-media'].includes(tech.id)) value += 100;
      if (pick(species, 'genetic-plasticity') && (game.turn >= 15 || worlds.length >= 3) && ['genetic-survey', 'adaptation-ii', 'adaptation-iii'].includes(tech.id)) value += 25;
      if (thermalWorlds.length > 0 && ['ecopoiesis', 'atmosphere-processors', 'full-terraforming'].includes(tech.id)) value += 70;
      if (scholar && ['research-networks', 'machine-learning-labs', 'quantum-computing', 'neural-lace'].includes(tech.id)) value += 55;
      if (military && ['destroyer-hull', 'cruiser-hull', 'orbital-construction', 'point-defence-laser', 'fusion-missile', 'uv-laser', 'targeting-computers', 'environmental-assault-gear'].includes(tech.id)) value += 55;
      if (trader && ['trade-charters', 'interstellar-banking', 'post-scarcity-commerce', 'xenolinguistics'].includes(tech.id)) value += 50;
      if (empire.keys >= 3 && (tech.id === 'archive-decryption' || tech.field === 'Computing')) value += 120;
      if (synthetic && tech.field === 'Materials') value += 20;
      // Make forward progress in the fields that contain missing administration/biology goals.
      if (strained && tech.field === 'Society') value += 35;
      if (pick(species, 'genetic-plasticity') && worlds.length >= 3 && tech.field === 'Life Sciences') value += 10;
      return value / Math.sqrt(Math.max(1, researchCost(empire, species, tech.id)));
    };
    candidates.sort((a, b) => researchUtility(b) - researchUtility(a) || compareId(a.id, b.id));
    if (candidates[0]) emit({ type: 'research', tech: candidates[0].id });
  }
  if (autoResearch && ['genetic-survey', 'adaptation-ii', 'adaptation-iii'].some(tech => has(empire, tech))) {
    if (!pick(species, 'temperature-wide')) emit({ type: 'adapt', axis: 'temperature' });
    if (has(empire, 'adaptation-ii') && !pick(species, 'gravity-wide')) emit({ type: 'adapt', axis: 'gravity' });
  }

  if (autoColonies) {
    const tax = poorestStability < 60 && availableCash > 60 && netIncome > -5 ? 'Low' : availableCash < 20 && averageStability >= 65 ? 'High' : 'Normal';
    if (tax !== empire.tax) emit({ type: 'tax', tax });
    if (!empire.leaders.some(leader => leader.role === 'Governor') && availableCash >= 100 && (strained || game.turn > 12)) { emit({ type: 'hire', role: 'Governor' }); availableCash -= 50; }
    const waitingColonisers = ownFleets.filter(fleet => fleet.ships.some(ship => ship.kind === 'colony')).length;
    const transports = ownFleets.filter(fleet => fleet.ships.some(ship => ship.kind === 'transport')).length;
    const armedShips = ownFleets.reduce((sum, fleet) => sum + fleet.ships.filter(ship => ship.kind === 'warship').length, 0);
    const militaryCapacity = 6 + worlds.reduce((sum, planet) => sum + (planet.buildings.includes('spaceport') ? 2 : 0) + (planet.buildings.includes('orbital-shipyard') ? 3 : 0), 0);
    let transportPlans = 0;
    let warshipPlans = 0;
    const build = (planet: Planet, item: BuildOrder) => { if (canQueue(game, planet, item)) return false; emit({ type: 'queue', planet: planet.id, item }); return true; };
    const buildById = (planet: Planet, ids: string[]) => {
      for (const buildingId of ids) {
        const building = BUILDINGS.find(building => building.id === buildingId);
        if (building && canBuild(building, empire, planet) && build(planet, { kind: 'building', id: buildingId })) return true;
      }
      return false;
    };
    for (const planet of worlds) {
      const local = systems.get(planet.systemId)!;
      const incomeCrisis = netIncome < -5 && availableCash < 100;
      const desiredFocus: Focus = incomeCrisis ? 'Commerce' : scholar ? 'Research' : military || synthetic || expansionist ? 'Industry' : trader ? 'Commerce' : 'Balanced';
      const focus = planet.population < 2 && !synthetic && !incomeCrisis ? 'Growth' : planet.queue.length && planet.progress > 0 && !incomeCrisis && planet.population < 5 ? 'Industry' : desiredFocus;
      if (planet.focus !== focus) emit({ type: 'focus', planet: planet.id, focus });
      if (planet.queue.length) {
        const item = planet.queue[0]!;
        const important = item.kind === 'building' && ['holo-commons', 'media-network', 'research-institute', 'fusion-plant'].includes(item.id);
        const price = Math.ceil(Math.max(0, cost(game, planet, item) - planet.progress) * (planet.progress ? 2 : 4));
        if (important && price > 0 && price < availableCash - 80 && availableCash > 150) { emit({ type: 'buy', planet: planet.id }); availableCash -= price; }
        continue;
      }
      const morale = stability(game, planet, empire, species);
      if (empire.keys >= 3 && has(empire, 'archive-decryption') && planet.id === empire.capital && build(planet, { kind: 'project', id: 'legacy' })) continue;
      if (morale < 70 && buildById(planet, ['holo-commons', 'media-network'])) continue;
      if (buildById(planet, ['fusion-plant', 'research-institute', 'commerce-exchange'])) continue;
      const thermal = Math.abs(planet.temperature - species.temperature) > 35 || planet.chemistry !== species.chemistry;
      if (thermal && terraformPotential(planet, species, empire) > .1 && (terraformGain(planet, species, empire) > .05 || habitability(planet, species, empire).axes[0]! >= 2 || planet.chemistry !== species.chemistry)) {
        if (buildById(planet, ['terraforming-station'])) continue;
        if (planet.buildings.includes('terraforming-station') && build(planet, { kind: 'project', id: 'terraform' })) continue;
      }
      if (buildById(planet, ['robotic-factory', 'ai-lab', 'quantum-research-centre'])) continue;
      const localTarget = local.planets.filter(target => target.owner === null && targetCapacity(target) >= 2 && expansionAllowed(target)).sort((a, b) => targetCapacity(b) - targetCapacity(a))[0];
      if (localTarget && expansionAllowed() && build(planet, { kind: 'project', id: 'settlement' })) { plannedExpansion++; continue; }
      const externalTarget = unclaimedKnown.find(target => targetCapacity(target) >= 2 && expansionAllowed(target));
      if (externalTarget && waitingColonisers + queuedColonisers < Math.max(1, Math.min(3, Math.ceil(worlds.length / 5))) && expansionAllowed() && availableCash > 30 && build(planet, { kind: 'ship', id: 'colony' })) { queuedColonisers++; continue; }
      if (buildById(planet, ['spaceport', 'orbital-shipyard', 'deep-mine', 'holo-commons', 'media-network', 'space-elevator', 'antimatter-plant'])) continue;
      if (atWar && armedShips > 2 && transports + transportPlans < 2 && build(planet, { kind: 'ship', id: 'transport' })) { transportPlans++; continue; }
      if ((atWar || military || game.options.approach && game.turn > 60) && armedShips + warshipPlans < militaryCapacity * (atWar ? 1.1 : .6)) {
        const hull = has(empire, 'cruiser-hull') && planet.buildings.includes('orbital-shipyard') ? 'cruiser' : has(empire, 'destroyer-hull') ? 'destroyer' : 'frigate';
        const doctrine = seedHash(`${game.seed}:${id}:${planet.id}`) % 3 === 0 ? 'Missile boat' : 'Line of battle';
        const design = autoDesign(empire, doctrine, hull);
        if (planet.buildings.includes('spaceport') && designStats(design, empire, species).valid) {
          if (!game.designs[id]!.some(existing => existing.id === design.id) && !newDesigns.has(design.id)) { emit({ type: 'design', design }); newDesigns.add(design.id); }
          emit({ type: 'queue', planet: planet.id, item: { kind: 'ship', id: design.id } }); warshipPlans++; continue;
        }
      }
      if (has(empire, 'gaia-transformation') && build(planet, { kind: 'project', id: 'gaia' })) continue;
      if (has(empire, 'ecumenopolis') && build(planet, { kind: 'project', id: 'ecumenopolis' })) continue;
      buildById(planet, ['militia-barracks', 'planetary-defence-grid', 'intelligence-bureau']);
    }
  }

  if (autoFleets) for (const fleet of ownFleets.filter(fleet => !fleet.destination)) {
    const local = systems.get(fleet.systemId)!;
    const damaged = fleet.ships.some(ship => { const design = game.designs[id]!.find(design => design.id === ship.designId); return design && ship.hp < designStats(design, empire, species).hp * .65; });
    if (damaged) {
      if (pick(species, 'cybernetic') || local.planets.some(planet => planet.owner === id)) continue;
      const repair = game.systems.filter(system => system.planets.some(planet => planet.owner === id)).sort((a, b) => distance(local, a) - distance(local, b))[0];
      const step = repair && pathStep(game, fleet, repair, known); if (step) { emit({ type: 'move', fleet: fleet.id, target: step.id }); continue; }
    }
    const coloniser = fleet.ships.some(ship => ship.kind === 'colony');
    const outpost = fleet.ships.some(ship => ship.kind === 'outpost' || ship.kind === 'depot');
    if (coloniser || outpost) {
      const targets = observedSystems.flatMap(system => system.planets)
        .filter(target => target.owner === null && !reservations.has(target.id) && (!coloniser || targetCapacity(target) >= 1.5 && expansionAllowed(target)))
        .sort((a, b) => (targetCapacity(b) - distance(local, systems.get(b.systemId)!) * .35) - (targetCapacity(a) - distance(local, systems.get(a.systemId)!) * .35) || compareId(a.id, b.id));
      const target = targets.find(target => target.systemId === local.id || pathStep(game, fleet, systems.get(target.systemId)!, known));
      if (target) {
        reservations.add(target.id);
        if (target.systemId === local.id) emit({ type: 'fleet-order', fleet: fleet.id, order: coloniser ? 'colonise' : 'outpost', planet: target.id });
        else { const step = pathStep(game, fleet, systems.get(target.systemId)!, known)!; emit({ type: 'move', fleet: fleet.id, target: step.id }); if (step.id === target.systemId) emit({ type: 'fleet-order', fleet: fleet.id, order: coloniser ? 'colonise' : 'outpost', planet: target.id }); }
      }
      continue;
    }
    if (fleet.ships.every(ship => ship.kind === 'probe')) {
      const candidates = game.systems.filter(system => !canMove(game, fleet, system.id));
      candidates.sort((a, b) => (known.has(a.id) ? 40 : 0) + distance(local, a) - (known.has(b.id) ? 40 : 0) - distance(local, b) || compareId(a.id, b.id));
      if (candidates[0]) emit({ type: 'move', fleet: fleet.id, target: candidates[0].id });
      continue;
    }
    const transport = fleet.ships.some(ship => ship.kind === 'transport');
    const enemies = observedSystems.flatMap(system => system.planets).filter(planet => planet.owner !== null && relation(game, id, planet.owner)?.state === 'War');
    const localEnemy = enemies.filter(planet => planet.systemId === local.id).sort((a, b) => a.garrison - b.garrison)[0];
    if (localEnemy) {
      const hostilePower = game.fleets.filter(other => other.owner !== id && other.systemId === local.id && relation(game, id, other.owner)?.state === 'War').reduce((sum, other) => sum + fleetPower(game, other), 0);
      const ownPower = ownFleets.filter(other => other.systemId === local.id).reduce((sum, other) => sum + fleetPower(game, other), 0);
      if (transport && hostilePower <= ownPower * .8) emit({ type: 'fleet-order', fleet: fleet.id, order: 'invade', planet: localEnemy.id });
      else if (!transport) emit({ type: 'fleet-order', fleet: fleet.id, order: 'bombard-defences', planet: localEnemy.id });
      continue;
    }
    const defenseEstimate = (planet: Planet) => {
      const system = systems.get(planet.systemId)!;
      const ships = game.fleets.filter(other => other.owner !== id && other.systemId === system.id && !other.destination && relation(game, id, other.owner)?.state === 'War').reduce((sum, other) => sum + fleetPower(game, other), 0);
      const batteries = observedSystems.find(observed => observed.id === system.id)?.planets.filter(other => other.owner !== null && relation(game, id, other.owner)?.state === 'War' && (other.buildings.includes('planetary-defence-grid') || other.buildings.includes('planetary-laser-grid'))).reduce((sum, other) => {
        const mounts = Math.min(6, Math.max(2, Math.floor(other.population / 2)));
        return sum + 120 + other.population * 8 + mounts * 16 * (other.buildings.includes('planetary-laser-grid') ? 3 : 1) + Math.max(4, 40 - mounts * 3) * 2;
      }, 0) ?? 0;
      return ships + batteries;
    };
    const invasionTargets = enemies.filter(planet => !transport || speciesFor(game, game.empires[planet.owner!]!).medium === 'Land' || has(empire, 'environmental-assault-gear'))
      .filter(planet => {
        const support = ownFleets.filter(other => other.id !== fleet.id && (transport ? other.systemId === planet.systemId && !other.destination || other.destination === planet.systemId : other.systemId === local.id && !other.destination)).reduce((sum, other) => sum + fleetPower(game, other), 0);
        return fleetPower(game, fleet) + support >= defenseEstimate(planet) * (transport ? 1 : 1.15);
      })
      .sort((a, b) => distance(local, systems.get(a.systemId)!) - distance(local, systems.get(b.systemId)!) || a.garrison - b.garrison);
    const invasion = invasionTargets.find(target => pathStep(game, fleet, systems.get(target.systemId)!, known));
    if (invasion) { const step = pathStep(game, fleet, systems.get(invasion.systemId)!, known)!; emit({ type: 'move', fleet: fleet.id, target: step.id }); if (step.id === invasion.systemId) emit({ type: 'fleet-order', fleet: fleet.id, order: transport ? 'invade' : 'bombard-defences', planet: invasion.id }); continue; }
    if (!transport) {
      const ruins = observedSystems.filter(system => !system.planets.some(planet => planet.owner !== null && relation(game, id, planet.owner)?.state === 'War') && system.planets.some(planet => planet.ruins && planet.custodian <= fleetPower(game, fleet) * .35)).sort((a, b) => distance(local, a) - distance(local, b));
      const target = ruins.find(system => pathStep(game, fleet, system, known));
      if (target) { const step = pathStep(game, fleet, target, known)!; emit({ type: 'move', fleet: fleet.id, target: step.id }); }
    }
  }

  // Diplomacy and intelligence remain exclusively AI decisions; enabling a human's colony
  // automation must never unexpectedly declare a war or dispatch spies on their behalf.
  if (empire.ai) {
    const contacts = game.relations.filter(relation => relation.contact && (relation.a === id || relation.b === id));
    const totalPower = ownFleets.reduce((sum, fleet) => sum + fleetPower(game, fleet), 0);
    for (const contact of contacts) {
      const other = contact.a === id ? contact.b : contact.a;
      if (contact.state === 'War') {
        if (averageStability < 30 && game.turn % 5 === id % 5) emit({ type: 'diplomacy', target: other, action: 'peace' });
        continue;
      }
      if (game.turn % 4 === id % 4 && contact.attitude >= 0) {
        if (!contact.trade) emit({ type: 'diplomacy', target: other, action: 'trade' });
        else if (!contact.research && (scholar || trader)) emit({ type: 'diplomacy', target: other, action: 'research' });
      }
      const knownPower = game.fleets.filter(fleet => fleet.owner === other && known.has(fleet.systemId)).reduce((sum, fleet) => sum + fleetPower(game, fleet), 0);
      if (military && game.turn > 35 && contact.state === 'Neutral' && averageStability > 50 && totalPower > Math.max(150, knownPower * 1.25) && game.turn % 7 === id % 7) emit({ type: 'diplomacy', target: other, action: 'war' });
    }
    if (empire.agents > 0 && contacts.length) {
      const target = contacts.map(contact => contact.a === id ? contact.b : contact.a).filter(other => !game.empires[other]!.eliminated).sort((a, b) => Number(relation(game, id, b)?.state === 'War') - Number(relation(game, id, a)?.state === 'War') || a - b)[0];
      if (target !== undefined && (empire.spyTarget === null || game.turn % 8 === id % 8)) emit({ type: 'spy', target, mission: atWar ? 'sabotage' : scholar ? 'steal' : 'intel' });
    }
    if (game.concord.formed) {
      const candidates = game.empires.filter(empire => !empire.eliminated).sort((a, b) => colonies(game, b.id).reduce((sum, planet) => sum + planet.population, 0) - colonies(game, a.id).reduce((sum, planet) => sum + planet.population, 0)).slice(0, 2);
      if (!candidates.some(candidate => candidate.id === id)) {
        const ally = candidates.find(candidate => (relation(game, id, candidate.id)?.attitude ?? -100) > 35);
        if (ally && empire.vote !== ally.id) emit({ type: 'vote', target: ally.id });
      }
    }
  }
  return orders;
}
