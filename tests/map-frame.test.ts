import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createGame,DEFAULT_OPTIONS} from '../packages/sim/src/generation';
import {SPECIES} from '../packages/sim/src/species';
import {mapOrigin,mapCoordinates} from '../apps/web/src/map-frame';
import {distance} from '../packages/sim/src/math';

test('each species and multiplayer seat has its capital at the map origin',()=>{
 for(const species of SPECIES){
  const game=createGame({...DEFAULT_OPTIONS,size:'Small',players:2,speciesId:species.id},SPECIES);
  const before=JSON.stringify(game.systems);
  for(const empire of game.empires){const origin=mapOrigin(game,empire.id);assert.ok(origin.planets.some(p=>p.id===empire.capital));assert.deepEqual(mapCoordinates(origin,origin),[0,0,0]);assert.deepEqual(mapCoordinates(origin,origin,true),[0,0,0]);
   for(const star of game.systems){const point=mapCoordinates(star,origin);assert.ok(Math.abs(Math.hypot(...point)-distance(star,origin))<1e-8);}
  }
  assert.equal(JSON.stringify(game.systems),before);
 }
});
test('home frame follows a capital relocated to another system',()=>{
 const game=createGame({...DEFAULT_OPTIONS,players:2},SPECIES),empire=game.empires[0],old=mapOrigin(game,0);
 const next=game.systems.find(s=>s.id!==old.id)!;empire.capital=next.planets[0].id;
 assert.equal(mapOrigin(game,0).id,next.id);
});
