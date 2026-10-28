import { test } from 'node:test';
import assert from 'node:assert/strict';
import { productionFixture, runProduction } from '../src/production.ts';
import { cost, processTurn } from '../../sim/src/engine.ts';
import { capacity, colonies, detection, habitability, output, researchCost, speciesFor, stability } from '../../sim/src/rules.ts';
import type { GameState, Planet } from '../../sim/src/types.ts';

const fixture = (picks: string[] = []) => {
  const game = productionFixture({ seed: 'PRODUCTION-HOOKS', style: 'Balanced', picks });
  for (const empire of game.empires) empire.ai = false;
  return game;
};
const home = (game: GameState) => colonies(game, 0).find(planet => planet.id === game.empires[0]!.capital)!;
const species = (game: GameState) => speciesFor(game, game.empires[0]!);

test('production adapter replays exactly and advances all-AI game to a real result', () => {
  const options = { seed: 'PRODUCTION-REPLAY', style: 'Balanced' as const, turns: 12 };
  const first = runProduction(options);
  assert.deepEqual(first, runProduction(options));
  assert.equal(first.turnsChecked, 12);
  assert.equal(first.victory, 'Score');
  assert.ok(first.outcomes.every(outcome => outcome.score > 0 && outcome.population > 0));
});

test('a stolen technology already queued for research is not awarded twice', () => {
  const game = fixture();
  game.empires[0]!.techs.push('orbital-construction');
  game.empires[0]!.research = ['orbital-construction'];
  game.empires[0]!.researchProgress = 1000;
  const after = processTurn(game);
  assert.equal(after.empires[0]!.techs.filter(tech => tech === 'orbital-construction').length, 1);
});

test('Subterranean improves radiation/temperature habitability in actual rules', () => {
  const control = fixture(), treated = fixture(['subterranean']);
  const world = { ...home(control), temperature: 415, radiation: 2, locked: false };
  assert.ok(habitability(world, species(treated)).rating < habitability(world, species(control)).rating);
});

test('Subterranean protects a colony from population bombardment', () => {
  const control = fixture(), treated = fixture(['subterranean']);
  const prepare = (game: GameState) => {
    const colony = home(game);
    colony.buildings = colony.buildings.filter(building => building !== 'planetary-defence-grid' && building !== 'planetary-laser-grid');
    game.fleets = game.fleets.filter(fleet => fleet.owner === 1);
    const bomber = game.fleets.find(fleet => fleet.ships.some(ship => ship.kind === 'warship'))!;
    bomber.systemId = colony.systemId; bomber.destination = null; bomber.order = 'bombard-population'; bomber.targetPlanet = colony.id;
    game.relations[0]!.contact = true; game.relations[0]!.state = 'War';
  };
  prepare(control); prepare(treated);
  assert.ok(home(processTurn(treated)).population > home(processTurn(control)).population);
});

test('Photosynthetic removes building upkeep and accelerates population growth', () => {
  const control = fixture(), treated = fixture(['photosynthetic']);
  for (const game of [control, treated]) { game.systems.find(system => system.id === home(game).systemId)!.spectral = 'G2V'; home(game).light = 'Normal'; }
  assert.ok(output(treated, home(treated), treated.empires[0]!).upkeep < output(control, home(control), control.empires[0]!).upkeep);
  const nextControl = processTurn(control), nextTreated = processTurn(treated);
  assert.ok(home(nextTreated).population > home(nextControl).population);
});

test('Photosynthetic does not waive upkeep at a dim M star', () => {
  const control = fixture(), treated = fixture(['photosynthetic']);
  for (const game of [control, treated]) { game.systems.find(system => system.id === home(game).systemId)!.spectral = 'M4V'; home(game).light = 'Dim'; }
  assert.equal(output(treated, home(treated), treated.empires[0]!).upkeep, output(control, home(control), control.empires[0]!).upkeep);
});

test('Photosynthetic habitability follows explicit dim light even on an unlocked world', () => {
  const control = fixture(), treated = fixture(['photosynthetic']);
  const normal = { ...home(control), locked: false, light: 'Normal' as const };
  const dim = { ...normal, light: 'Dim' as const };
  assert.equal(habitability(normal, species(treated)).axes[6], 0);
  assert.equal(habitability(dim, species(treated)).axes[6], 2);
  assert.equal(habitability(dim, species(control)).axes[6], 1);
});

test('Spore-borne discounts colony ships and reduces founding population', () => {
  const control = fixture(), treated = fixture(['spore-borne']);
  assert.equal(cost(treated, home(treated), { kind: 'ship', id: 'colony' }), cost(control, home(control), { kind: 'ship', id: 'colony' }) * .6);
  const prepare = (game: GameState) => {
    const h = home(game), system = game.systems.find(system => system.id === h.systemId)!;
    const target: Planet = { ...structuredClone(h), id: 'hook-colony', name: 'Hook Colony', owner: null, population: 0, speciesId: null, queue: [], buildings: [] };
    system.planets.push(target);
    const fleet = game.fleets.find(fleet => fleet.owner === 0 && fleet.ships.some(ship => ship.kind === 'colony'))!;
    fleet.systemId = system.id; fleet.destination = null; fleet.order = 'colonise'; fleet.targetPlanet = target.id;
  };
  prepare(control); prepare(treated);
  const get = (game: GameState) => game.systems.flatMap(system => system.planets).find(planet => planet.id === 'hook-colony')!;
  assert.ok(get(processTurn(treated)).population < get(processTurn(control)).population);
});

test('Hive mind keeps stability at75 despite taxes, debt and integration', () => {
  const treated = fixture(['hive-mind']);
  treated.empires[0]!.tax = 'High'; treated.empires[0]!.credits = 0; home(treated).integration = 40;
  assert.equal(stability(treated, home(treated), treated.empires[0]!, species(treated)), 75);
});

test('Terraformers lowers terraforming cost in actual queue rules', () => {
  const control = fixture(), treated = fixture(['terraformers']);
  assert.equal(cost(treated, home(treated), { kind: 'project', id: 'terraform' }), cost(control, home(control), { kind: 'project', id: 'terraform' }) * .6);
});

test('Terraformers finishes a funded step in two turns rather than three', () => {
  let control = fixture(), treated = fixture(['terraformers']);
  for (const game of [control, treated]) {
    const colony = home(game); colony.temperature = 390; colony.buildings.push('terraforming-station');
    colony.queue = [{ kind: 'project', id: 'terraform' }]; colony.progress = 1000;
  }
  control = processTurn(processTurn(control)); treated = processTurn(processTurn(treated));
  assert.equal(home(control).temperature, 390);
  assert.ok(home(treated).temperature < 390);
});

test('Genetic plasticity halves adaptation research and improves final thermal tolerance', () => {
  const control = fixture(), treated = fixture(['genetic-plasticity']);
  assert.equal(researchCost(treated.empires[0]!, species(treated), 'genetic-survey'), researchCost(control.empires[0]!, species(control), 'genetic-survey') * .5);
  for (const game of [control, treated]) game.empires[0]!.techs.push('genetic-survey', 'adaptation-ii', 'adaptation-iii');
  let observed = false;
  for (let temperature = 340; temperature < 700; temperature++) {
    const world = { ...home(control), temperature };
    if (habitability(world, species(treated), treated.empires[0]!).rating < habitability(world, species(control), control.empires[0]!).rating) observed = true;
  }
  assert.ok(observed);
});

test('Electrosense expands actual detection range by50%', () => {
  const control = fixture(), treated = fixture(['electrosense']);
  assert.equal(detection(treated.empires[0]!, species(treated)), detection(control.empires[0]!, species(control)) * 1.5);
});

test('Radiotrophic improves irradiated worlds over Resistant prerequisite', () => {
  const control = fixture(['radiation-resistant']), treated = fixture(['radiation-resistant', 'radiotrophic']);
  const world = { ...home(control), radiation: 3 };
  assert.ok(habitability(world, species(treated)).rating < habitability(world, species(control)).rating);
});

test('Radiotrophic has no undocumented penalty on a clean homeworld', () => {
  const control = fixture(['radiation-resistant']), treated = fixture(['radiation-resistant', 'radiotrophic']);
  assert.equal(capacity(home(treated), species(treated), treated.empires[0]!), capacity(home(control), species(control), control.empires[0]!));
});

test('Random-region moon generation preserves unique planet IDs', () => {
  const game = productionFixture({ seed: 'PRODUCTION-PAIR-191838', style: 'Diplomat', region: 'Random' });
  const ids = game.systems.flatMap(system => system.planets.map(planet => planet.id));
  assert.equal(new Set(ids).size, ids.length);
});

test('Cybernetic repairs damaged ships outside own colonies and pays extra upkeep', () => {
  const control = fixture(), treated = fixture(['cybernetic']);
  const prepare = (game: GameState) => {
    const fleet = game.fleets.find(fleet => fleet.owner === 0 && fleet.ships.some(ship => ship.kind === 'warship'))!;
    fleet.systemId = game.systems.find(system => system.planets.every(planet => planet.owner === null))!.id;
    fleet.ships[0]!.hp = 3;
    return fleet.id;
  };
  const controlId = prepare(control), treatedId = prepare(treated);
  assert.ok(output(treated, home(treated), treated.empires[0]!).upkeep > output(control, home(control), control.empires[0]!).upkeep);
  const nextControl = processTurn(control), nextTreated = processTurn(treated);
  assert.ok(nextTreated.fleets.find(fleet => fleet.id === treatedId)!.ships[0]!.hp > nextControl.fleets.find(fleet => fleet.id === controlId)!.ships[0]!.hp);
});
