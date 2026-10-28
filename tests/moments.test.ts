import {VERSION} from '../packages/sim/src/rules';
import {hash} from '../packages/sim/src/math';
import {test} from 'node:test';
import assert from 'node:assert/strict';
import {achievementFixture} from './achievement-fixture';
import {collectMoments} from '../apps/web/src/moments';
import {processTurn,serialize,deserialize} from '../packages/sim/src/engine';
import {observedSystem} from '../packages/sim/src/intel';
import {previewOrders} from '../apps/web/src/turn-orders';
import {FIELDS,TECHS} from '../packages/sim/src/rules';
import {buildMomentScene} from '../apps/web/src/moment-scene';
import {disposeModel} from '../apps/web/src/ship-model';
test('resolved settlement, survey, research, construction and launch yield distinct real accomplishments',()=>{
 const {game,pioneer,colonizer,building}=achievementFixture();const after=processTurn(game,[{empire:0,type:'fleet-order',fleet:colonizer.id,planet:pioneer.id,order:'colonise'}]);const events=collectMoments(game,after,0);
 for(const kind of ['colony','discovery','research','construction','launch','growth'])assert.ok(events.some(e=>e.kind===kind),kind+' missing: '+events.map(e=>e.kind));assert.equal(events[0].kind,'colony');assert.equal(events[0].planet?.id,pioneer.id);assert.equal(events.find(e=>e.kind==='construction')?.buildingId,building.id);assert.equal(events.find(e=>e.kind==='research')?.techId,'improved-fusion');
 assert.equal(new Set(events.map(e=>e.id)).size,events.length);assert.deepEqual(collectMoments(after,after,0),[]);assert.deepEqual(collectMoments(after,game,0),[]);
});
test('orders and cancellations never celebrate uncommitted achievements',()=>{
 const {game,home}=achievementFixture();game.empires[0].credits=9999;const planned=previewOrders(game,[{id:'buy',label:'Buy',kind:'command',command:{empire:0,type:'buy',planet:home.id}}]);assert.deepEqual(planned.errors,{});assert.deepEqual(collectMoments(game,planned.state,0),[]);assert.deepEqual(collectMoments(game,previewOrders(game,[]).state,0),[]);
});
test('discovery scenes respect telescope observations rather than revealing hidden planets',()=>{
 const {game}=achievementFixture();const next=structuredClone(game);next.turn++;const system=next.systems.find(s=>!game.empires[0].known.includes(s.id)&&s.planets.length>0)!;next.empires[0].known.push(system.id);next.empires[0].observations![system.id]={systemId:system.id,observed:0,due:0,worlds:[]};const event=collectMoments(game,next,0).find(e=>e.systemId===system.id)!;assert.equal(event.system?.planets.length,0);assert.equal(event.count,0);
});
test('splitting a fleet is not a ship launch and old or rival achievements are not replayed',()=>{
 const {game}=achievementFixture(),next=structuredClone(game);next.turn++;const fleet=next.fleets.find(f=>f.owner===0&&f.ships.length>1)!;next.fleets.push({...fleet,id:'split',ships:[fleet.ships.pop()!]});next.empires[1].techs.push('improved-fusion');assert.equal(collectMoments(game,next,0).length,0);next.seed++;assert.deepEqual(collectMoments(game,next,0),[]);
});
test('outpost growth, diplomacy, artifacts, repair and setbacks are represented without rewarding losses',()=>{
 const {game,home}=achievementFixture(),next=structuredClone(game);next.turn++;const target=next.systems.flatMap(s=>s.planets).find(p=>p.id===home.id)!;target.owner=1;next.empires[0].keys++;next.empires[0].leaders.push({id:'qa',name:'Ari',role:'Governor',skill:'Industry',level:1,age:0} as never);next.relations[0].contact=true;game.relations[0].contact=false;
 const events=collectMoments(game,next,0);for(const kind of ['setback','artifact','leader','contact'])assert.ok(events.some(e=>e.kind===kind));assert.equal(events.some(e=>e.kind==='victory'),false);
 const old=structuredClone(game);old.systems.flatMap(s=>s.planets).find(p=>p.id===home.id)!.outpost=true;const grown=structuredClone(old);grown.turn++;grown.systems.flatMap(s=>s.planets).find(p=>p.id===home.id)!.outpost=false;assert.ok(collectMoments(old,grown,0).some(e=>e.kind==='colony'));
});
test('each research field builds a finite 3D assembly at initial and finished poses',()=>{
 const {game}=achievementFixture();for(const field of FIELDS){const tech=TECHS.find(t=>t.field===field)!,scene=buildMomentScene({id:tech.id,kind:'research',turn:1,owner:0,title:tech.name,subtitle:tech.description,color:'#b39aff',importance:85,field},game);for(const progress of [0,.3,.7,1]){scene.update(progress*8,progress);scene.root.traverse(o=>{assert.ok([...o.position.toArray(),...o.scale.toArray(),...o.quaternion.toArray()].every(Number.isFinite));});}disposeModel(scene.root);}
});

test('repair, treaties and repeatable research retain the correct accomplishment identity',()=>{
 const {game}=achievementFixture(true),after=processTurn(game);assert.ok(collectMoments(game,after,0).some(e=>e.kind==='repair'));assert.ok(collectMoments(game,after,0).some(e=>e.kind==='contact'));
 const next=structuredClone(after);next.turn++;next.relations[0].trade=true;next.empires[0].repeatables={'continuous-propulsion':2};after.empires[0].repeatables={'continuous-propulsion':1};const events=collectMoments(after,next,0);assert.ok(events.some(e=>e.kind==='treaty'));assert.ok(events.some(e=>e.kind==='research'&&e.techId==='continuous-propulsion'));
});
test('every actual scene in a busy turn supports animation and a completed still pose',()=>{
 const {game,pioneer,colonizer}=achievementFixture(true),after=processTurn(game,[{empire:0,type:'fleet-order',fleet:colonizer.id,planet:pioneer.id,order:'colonise'}]);
 for(const event of collectMoments(game,after,0)){const scene=buildMomentScene(event,after);for(const progress of [0,.5,1]){scene.update(progress*8,progress);scene.root.traverse(o=>assert.ok([...o.position.toArray(),...o.scale.toArray()].every(Number.isFinite),event.kind));}disposeModel(scene.root);}
});
test('build 0.012 saves upgrade without changing the existing campaign',()=>{
 const {game}=achievementFixture();game.version='0.012';const save={...JSON.parse(serialize(game)),version:'0.012',checksum:hash(game),state:game},restored=deserialize(JSON.stringify(save));assert.equal(restored.version,VERSION);assert.deepEqual(restored.fleets,game.fleets);assert.equal(JSON.stringify(restored.systems),JSON.stringify(game.systems));
});
