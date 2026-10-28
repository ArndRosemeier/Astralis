import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createGame,DEFAULT_OPTIONS} from '../packages/sim/src/generation';
import {SPECIES} from '../packages/sim/src/species';
import {assertInvariants,deserialize,processTurn,serialize} from '../packages/sim/src/engine';

function unlimitedGame(){
 const game=createGame({...DEFAULT_OPTIONS,turnLimit:null,size:'Small',players:2,approach:false,tutorial:false},SPECIES);
 game.concord.dissolved=true;
 for(const empire of game.empires){empire.ai=false;empire.automation={colonies:false,research:false,fleets:false};}
 return game;
}

test('no turn limit continues beyond all selectable deadlines and survives saving',()=>{
 for(const turn of [0,59,89,119,179,239,9999]){
  const game=unlimitedGame();game.turn=turn;
  const restored=deserialize(serialize(game));assert.equal(restored.options.turnLimit,null);
  const next=processTurn(restored);assert.equal(next.turn,turn+1);assert.equal(next.winner,null);assert.equal(next.victory,null);assertInvariants(next);
  assert.equal(serialize(processTurn(game)),serialize(next),'save/load must preserve deterministic unlimited turns');
 }
});

test('unlimited turns keep conquest victory active',()=>{
 const game=unlimitedGame();
 for(const system of game.systems)for(const planet of system.planets)if(planet.owner===1){planet.owner=null;planet.population=0;}
 game.fleets=game.fleets.filter(f=>f.owner!==1);
 const next=processTurn(game);assert.equal(next.winner,0);assert.equal(next.victory,'Conquest');
});

test('finite turn limits still award score victory after saving',()=>{
 const game=unlimitedGame();game.options.turnLimit=240;game.turn=239;
 const next=processTurn(deserialize(serialize(game)));assert.equal(next.turn,240);assert.equal(next.victory,'Score');assert.notEqual(next.winner,null);
});
