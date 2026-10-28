import { test } from 'node:test';
import assert from 'node:assert/strict';
import { productionFixture } from '../src/production.ts';
import { productionOrders } from '../../ai/src/controller.ts';
import { applyCommand, assertInvariants, processTurn } from '../../sim/src/engine.ts';
import { colonies } from '../../sim/src/rules.ts';
import type { GameState } from '../../sim/src/types.ts';

const setup = (picks: string[] = []) => productionFixture({ seed: 'CONTROLLER-TEST', style: 'Balanced', picks });
const home = (game: GameState) => colonies(game, 0).find(planet => planet.id === game.empires[0]!.capital)!;

test('production controller is deterministic and never mutates the input', () => {
  const game = setup(['terraformers', 'genetic-plasticity']);
  const before = JSON.stringify(game);
  const first = productionOrders(game, 0);
  assert.deepEqual(productionOrders(game, 0), first);
  assert.equal(JSON.stringify(game), before);
  assert.ok(first.length > 0);
});

test('human automation stays within enabled areas and cannot dispatch spies or start wars', () => {
  const game = setup(); game.empires[0]!.ai = false;
  assert.deepEqual(productionOrders(game, 0), []);
  game.empires[0]!.automation.research = true;
  const orders = productionOrders(game, 0);
  assert.ok(orders.length > 0);
  assert.ok(orders.every(order => order.type === 'research' || order.type === 'adapt'));
});

test('administratively overextended AI stops settlement, lowers tax and recruits support', () => {
  const game = setup(), original = home(game), system = game.systems.find(system => system.id === original.systemId)!;
  for (let index = 0; index < 30; index++) system.planets.push({ ...structuredClone(original), id: `overextended-${index}`, buildings: [], queue: [] });
  game.empires[0]!.credits = 200;
  const orders = productionOrders(game, 0);
  assert.ok(!orders.some(order => order.type === 'queue' && (order.item.id === 'settlement' || order.item.id === 'colony')));
  assert.ok(orders.some(order => order.type === 'tax' && order.tax === 'Low'));
  assert.ok(orders.some(order => order.type === 'hire' && order.role === 'Governor'));
  assert.ok(orders.some(order => order.type === 'research' && ['interstellar-law', 'administrative-ai', 'propaganda', 'colonial-administration'].includes(order.tech)));
});

test('Terraformer AI actually queues useful terraforming', () => {
  const game = setup(['terraformers']);
  const colony = home(game); colony.temperature = 440;
  colony.buildings.push('holo-commons', 'media-network', 'research-institute', 'commerce-exchange', 'terraforming-station');
  game.empires[0]!.techs.push('ecopoiesis');
  assert.ok(productionOrders(game, 0).some(order => order.type === 'queue' && order.planet === colony.id && order.item.id === 'terraform'));
});

test('Genetic plasticity AI prioritizes its discounted adaptation research', () => {
  const game = setup(['genetic-plasticity']);
  game.turn = 20;
  assert.ok(productionOrders(game, 0).some(order => order.type === 'research' && order.tech === 'genetic-survey'));
  game.empires[0]!.techs.push('genetic-survey');
  assert.ok(productionOrders(game, 0).some(order => order.type === 'adapt' && order.axis === 'temperature'));
});

test('Genetic plasticity does not displace propulsion on the first turn', () => {
  const game = setup(['genetic-plasticity']);
  assert.ok(productionOrders(game, 0).some(order => order.type === 'research' && order.tech === 'improved-fusion'));
});

test('AI uses espionage after diplomatic contact', () => {
  const game = setup(); game.relations[0]!.contact = true;
  assert.ok(productionOrders(game, 0).some(order => order.type === 'spy' && order.target === 1));
});

test('Cybernetic damaged warships pause to repair instead of wasting a return trip', () => {
  const game = setup(['cybernetic']);
  const fleet = game.fleets.find(fleet => fleet.owner === 0 && fleet.ships.some(ship => ship.kind === 'warship'))!;
  fleet.ships[0]!.hp = 3;
  fleet.systemId = game.systems.find(system => system.planets.every(planet => planet.owner === null))!.id;
  assert.ok(!productionOrders(game, 0).some(order => order.type === 'move' && order.fleet === fleet.id));
});

test('AI troop transports invade an enemy colony when orbit is uncontested', () => {
  const game = setup();
  const enemy = colonies(game, 1)[0]!;
  game.relations[0]!.contact = true; game.relations[0]!.state = 'War';
  game.fleets = game.fleets.filter(fleet => fleet.owner !== 1);
  game.empires[0]!.known.push(enemy.systemId);
  game.fleets.push({ id: 'test-transport', owner: 0, name: 'Assault', systemId: enemy.systemId, destination: null, remaining: 0, origin: null, ships: [{ id: 'troop-ship', designId: 'transport', kind: 'transport', hp: 15, experience: 0, troops: 4 }], order: 'hold', targetPlanet: null, strategy: 'Evasive' });
  assert.ok(productionOrders(game, 0).some(order => order.type === 'fleet-order' && order.fleet === 'test-transport' && order.order === 'invade'));
});

test('AI does not send an underpowered expedition into a known planetary battery', () => {
  const game = setup();
  const enemy = colonies(game, 1)[0]!, origin = game.systems.find(system => system.id === home(game).systemId)!;
  const target = game.systems.find(system => system.id === enemy.systemId)!;
  target.x = origin.x + 3; target.y = origin.y; target.z = origin.z;
  game.relations[0]!.contact = true; game.relations[0]!.state = 'War';
  game.empires[0]!.known.push(target.id);
  game.empires[0]!.observations![target.id] = { systemId: target.id, observed: game.turn, due: game.turn, worlds: target.planets.map(planet => ({ id: planet.id, owner: planet.owner, population: planet.population, buildings: [...planet.buildings] })) };
  const fleet = game.fleets.find(fleet => fleet.owner === 0 && fleet.ships.some(ship => ship.kind === 'warship'))!;
  assert.ok(!productionOrders(game, 0).some(order => order.type === 'move' && order.fleet === fleet.id && order.target === target.id));
});

test('controller commands are legal and a 120-turn autonomous campaign preserves invariants', () => {
  let game = setup(['terraformers', 'genetic-plasticity']);
  const check = structuredClone(game);
  for (const command of productionOrders(check, 0)) assert.equal(applyCommand(check, command), null, JSON.stringify(command));
  while (game.winner === null && game.turn < 120) { game = processTurn(game); assertInvariants(game); }
  assert.ok(game.turn > 0);
  assert.ok(game.winner !== null);
});
