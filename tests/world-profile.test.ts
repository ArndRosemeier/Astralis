import {test} from 'node:test';
import assert from 'node:assert/strict';
import {existsSync} from 'node:fs';
import type {Planet} from '../packages/sim/src/types';
import {worldProfile} from '../apps/web/src/world-profile';
import {achievementFixture} from './achievement-fixture';
import {deserialize,serialize} from '../packages/sim/src/engine';
import {hash} from '../packages/sim/src/math';

test('every world kind has a complete portrait with a shipped illustration regardless of locking',()=>{
 const expected:Record<Planet['kind'],string>={rocky:'Surface',ocean:'Surface',ice:'Surface',gas:'Atmosphere',habitat:'Habitat',belt:'Belt'};
 const {home}=achievementFixture();
 for(const kind of Object.keys(expected) as Planet['kind'][])for(const locked of [false,true])for(const temperature of [160,290,500,1200]){
  const p={...home,kind,locked,temperature},before=structuredClone(p),profile=worldProfile(p);
  assert.equal(profile.scene,expected[kind]);assert.ok(profile.title&&profile.description&&profile.alt);assert.ok(existsSync('public/'+profile.art),profile.art);assert.deepEqual(p,before);
 }
});
test('portraits distinguish actual environments instead of showing every solid world as a temperate coast',()=>{
 const {home}=achievementFixture();const p={...home,locked:false,kind:'rocky' as const,water:.5,pressure:1,temperature:290,chemistry:'Oxygen'};
 assert.equal(worldProfile(p).category,'temperate');assert.equal(worldProfile({...p,water:.95}).category,'ocean');assert.equal(worldProfile({...p,temperature:150}).category,'frozen');assert.equal(worldProfile({...p,water:0}).category,'desert');assert.equal(worldProfile({...p,pressure:0}).category,'airless');assert.equal(worldProfile({...p,temperature:700,pressure:90}).category,'clouded');assert.equal(worldProfile({...p,temperature:1200}).category,'volcanic');assert.match(worldProfile({...p,kind:'ocean',locked:true}).art,/tidal-ocean/);
});
test('the complete-portrait update preserves 0.014 saves',()=>{const {game}=achievementFixture();game.version='0.014';const saved={...JSON.parse(serialize(game)),version:'0.014'};const restored=deserialize(JSON.stringify(saved));assert.equal(hash(restored.systems),hash(game.systems));assert.equal(hash(restored.fleets),hash(game.fleets));});
