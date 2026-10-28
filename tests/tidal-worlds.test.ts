import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createWorld} from '../apps/web/src/world-model';
import {tidalProfile} from '../apps/web/src/tidal-profile';
import {achievementFixture} from './achievement-fixture';
import {deserialize,serialize} from '../packages/sim/src/engine';
import {hash} from '../packages/sim/src/math';

test('locked worlds choose art from physical conditions without mutating the planet',()=>{const {home}=achievementFixture();home.locked=true;home.kind='rocky';home.temperature=290;home.water=.5;home.pressure=1;const before=structuredClone(home);assert.equal(tidalProfile(home)?.climate,'ocean');assert.deepEqual(home,before);assert.equal(tidalProfile({...home,temperature:190})?.climate,'frost');assert.equal(tidalProfile({...home,temperature:500})?.climate,'rock');assert.equal(tidalProfile({...home,pressure:0})?.climate,'rock');assert.equal(tidalProfile({...home,water:0})?.climate,'rock');assert.equal(tidalProfile({...home,locked:false}),null);assert.equal(tidalProfile({...home,kind:'gas'}),null);});
test('locked planet terrain holds its orientation across animation frames',()=>{const {home}=achievementFixture();const locked=createWorld({...home,locked:true});locked.update(0);const angle=locked.planet.rotation.y;locked.update(90);assert.equal(locked.planet.rotation.y,angle);const rotating=createWorld({...home,locked:false});rotating.update(0);const first=rotating.planet.rotation.y;rotating.update(90);assert.notEqual(rotating.planet.rotation.y,first);});
test('the presentation update preserves 0.013 campaign saves',()=>{const {game}=achievementFixture();game.version='0.013';const save=JSON.parse(serialize(game));save.version='0.013';save.checksum=hash(game);const restored=deserialize(JSON.stringify(save));assert.equal(restored.turn,game.turn);assert.equal(hash(restored.systems),hash(game.systems));});
