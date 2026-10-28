import { test } from 'node:test';
import assert from 'node:assert/strict';
import { productionFixture } from '../src/production.ts';
import { canQueue, processTurn } from '../../sim/src/engine.ts';
import { colonies, output, speciesFor, stability } from '../../sim/src/rules.ts';
import type { GameState } from '../../sim/src/types.ts';

const fixture = () => {
  const game = productionFixture({ seed: 'BUILDING-BINDINGS', style: 'Balanced' });
  for (const empire of game.empires) empire.ai = false;
  return game;
};
const home = (game: GameState) => colonies(game, 0).find(planet => planet.id === game.empires[0]!.capital)!;
const near = (actual: number, expected: number) => assert.ok(Math.abs(actual - expected) < .002, `${actual} !== ${expected}`);

test('Robotic Factory supplies its flat three industry as well as per-worker output', () => {
  const game = fixture(), planet = home(game), empire = game.empires[0]!;
  const before = output(game, planet, empire);
  planet.buildings.push('robotic-factory');
  const after = output(game, planet, empire);
  near(after.industry - before.industry, before.workers[0]! + 3);
});

test('AI Lab supplies its flat three research as well as per-scientist output', () => {
  const game = fixture(), planet = home(game), empire = game.empires[0]!;
  const before = output(game, planet, empire);
  planet.buildings.push('ai-lab');
  const after = output(game, planet, empire);
  near(after.research - before.research, (before.workers[1]! + 3) * .9); // Autocracy research penalty.
});

test('Space Elevator adds ten percent industry', () => {
  const game = fixture(), planet = home(game), empire = game.empires[0]!;
  const before = output(game, planet, empire);
  planet.buildings.push('space-elevator');
  near(output(game, planet, empire).industry, before.industry * 1.1);
});

test('building Militia Barracks actually raises four garrison units', () => {
  const game = fixture(), planet = home(game), before = planet.garrison;
  planet.queue = [{ kind: 'building', id: 'militia-barracks' }]; planet.progress = 10000;
  const after = processTurn(game);
  assert.equal(home(after).garrison, before + 4);
});

test('troop transports built at Militia Barracks start trained', () => {
  const game = fixture(), planet = home(game);
  planet.buildings.push('militia-barracks');
  planet.queue = [{ kind: 'ship', id: 'transport' }]; planet.progress = 10000;
  const after = processTurn(game);
  const transport = after.fleets.filter(fleet => fleet.owner === 0).flatMap(fleet => fleet.ships).find(ship => ship.kind === 'transport');
  assert.ok(transport);
  assert.ok(transport.experience >= 1);
});

test('Intelligence Bureau construction adds an agent and is capital-only', () => {
  const game = fixture(), planet = home(game), original = game.empires[0]!.agents;
  game.empires[0]!.techs.push('intelligence-service');
  planet.queue = [{ kind: 'building', id: 'intelligence-bureau' }]; planet.progress = 10000;
  const system = game.systems.find(system => system.id === planet.systemId)!;
  const other = { ...structuredClone(planet), id: 'noncapital-bureau', buildings: [], queue: [] };
  system.planets.push(other);
  assert.notEqual(canQueue(game, other, { kind: 'building', id: 'intelligence-bureau' }), null);
  const after = processTurn(game);
  assert.equal(after.empires[0]!.agents, original + 1);
});

test('Intelligence Bureau improves the actual espionage success process', () => {
  const baseline = fixture(), bureau = fixture();
  home(bureau).buildings.push('intelligence-bureau');
  for (const game of [baseline, bureau]) {
    game.relations[0]!.contact = true;
    game.empires[0]!.spyTarget = 1; game.empires[0]!.spyMission = 'steal';
    game.empires[1]!.techs = ['railgun'];
  }
  let baselineSuccess = 0, bureauSuccess = 0;
  for (let index = 0; index < 512; index++) {
    const left = structuredClone(baseline), right = structuredClone(bureau);
    left.rng = right.rng = Math.imul(index + 1, 0x9e3779b9) >>> 0;
    baselineSuccess += Number(processTurn(left).empires[0]!.techs.includes('railgun'));
    bureauSuccess += Number(processTurn(right).empires[0]!.techs.includes('railgun'));
  }
  assert.ok(bureauSuccess > baselineSuccess, `${bureauSuccess} bureau successes vs ${baselineSuccess} reference`);
});

test('Planetary Deflector halves bombardment damage after orbit is uncontested', () => {
  const baseline = fixture(), deflector = fixture();
  for (const game of [baseline, deflector]) {
    const colony = home(game);
    colony.buildings = colony.buildings.filter(building => !['planetary-defence-grid', 'planetary-laser-grid'].includes(building));
    colony.garrison = 20;
    game.fleets = game.fleets.filter(fleet => fleet.owner === 1);
    const bomber = game.fleets.find(fleet => fleet.ships.some(ship => ship.kind === 'warship'))!;
    bomber.systemId = colony.systemId; bomber.destination = null; bomber.order = 'bombard-defences'; bomber.targetPlanet = colony.id;
    game.relations[0]!.contact = true; game.relations[0]!.state = 'War';
  }
  home(deflector).buildings.push('planetary-deflector');
  const baselineDamage = 20 - home(processTurn(baseline)).garrison;
  const defendedDamage = 20 - home(processTurn(deflector)).garrison;
  assert.ok(baselineDamage > 0);
  near(defendedDamage, baselineDamage * .5);
});

test('Media Network halves war weariness separately from its flat morale bonus', () => {
  const baseline = fixture(), media = fixture();
  baseline.turn = media.turn = 50;
  home(media).buildings.push('media-network');
  const morale = (game: GameState) => stability(game, home(game), game.empires[0]!, speciesFor(game, game.empires[0]!));
  const baselinePeace = morale(baseline), mediaPeace = morale(media);
  baseline.relations[0]!.state = media.relations[0]!.state = 'War';
  near(mediaPeace - morale(media), (baselinePeace - morale(baseline)) * .5);
});

test('Quantum Research Centre is limited to one per system rather than one per empire', () => {
  const game = fixture(), planet = home(game), empire = game.empires[0]!;
  empire.techs.push('quantum-computing');
  planet.buildings.push('quantum-research-centre');
  const other = { ...structuredClone(planet), id: 'second-quantum', buildings: [], queue: [] };
  game.systems.find(system => system.id === planet.systemId)!.planets.push(other);
  assert.notEqual(canQueue(game, other, { kind: 'building', id: 'quantum-research-centre' }), null);
  const elsewhere = game.systems.find(system => system.id !== planet.systemId)!;
  const remote = { ...other, id: 'remote-quantum', systemId: elsewhere.id };
  elsewhere.planets.push(remote);
  assert.equal(canQueue(game, remote, { kind: 'building', id: 'quantum-research-centre' }), null);
});
