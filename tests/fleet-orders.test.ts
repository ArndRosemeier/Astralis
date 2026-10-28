import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createGame,DEFAULT_OPTIONS} from '../packages/sim/src/generation';
import {SPECIES} from '../packages/sim/src/species';
import {applyCommand,canMove,serialize,deserialize,assertInvariants} from '../packages/sim/src/engine';
import {planShipMoves} from '../packages/sim/src/fleet-orders';
function setup(){const g=createGame({...DEFAULT_OPTIONS,size:'Small',players:2,tutorial:false},SPECIES);const fleet=g.fleets.find(f=>f.owner===0&&f.ships.some(s=>s.kind==='warship'))!;fleet.ships.push({...structuredClone(fleet.ships[0]),id:`s${g.nextId++}`});const target=g.systems.find(s=>!canMove(g,fleet,s.id))!.id;return {g,fleet,target};}
test('selected ships split and move across fleets as a replayable batch',()=>{
 const {g,fleet,target}=setup(),other=g.fleets.find(f=>f.owner===0&&f.id!==fleet.id&&!canMove(g,f,target))!;
 const ids=[fleet.ships[0].id,...other.ships.map(s=>s.id)],before=serialize(g),result=planShipMoves(g,0,ids,target);
 assert.equal(result.error,null);assert.equal(serialize(g),before);assert.equal(result.orders.filter(c=>c.type==='split').length,1);
 const replay=deserialize(before);for(const order of result.orders)assert.equal(applyCommand(replay,order),null);
 for(const f of replay.fleets.filter(f=>f.owner===0))for(const ship of f.ships)assert.equal(f.destination,ids.includes(ship.id)?target:null);
 assert.ok(replay.fleets.every(f=>f.ships.length));assertInvariants(replay);assert.equal(serialize(deserialize(serialize(replay))),serialize(replay));
});
test('moving an entire fleet does not create a detachment',()=>{const {g,fleet,target}=setup(),result=planShipMoves(g,0,fleet.ships.map(s=>s.id),target);assert.equal(result.error,null);assert.deepEqual(result.orders,[{empire:0,type:'move',fleet:fleet.id,target}]);});
test('invalid group movement is atomic, including foreign, missing and already travelling ships',()=>{
 const {g,fleet,target}=setup(),id=fleet.ships[0].id;
 for(const ids of [[id,'missing'],[id,g.fleets.find(f=>f.owner===1)!.ships[0].id],[]])assert.equal(planShipMoves(g,0,ids,target).orders.length,0);
 assert.match(planShipMoves(g,0,[id],fleet.systemId).error!,/already here/);
 const other=g.fleets.find(f=>f.owner===0&&f.id!==fleet.id)!;other.destination=target;const before=serialize(g);
 const result=planShipMoves(g,0,[id,other.ships[0].id],target);assert.match(result.error!,/already in transit/);assert.deepEqual(result.orders,[]);assert.equal(serialize(g),before);
});
