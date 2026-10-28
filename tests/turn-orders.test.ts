import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createGame,DEFAULT_OPTIONS} from '../packages/sim/src/generation';
import {SPECIES} from '../packages/sim/src/species';
import {applyCommand,processTurn,serialize,canMove} from '../packages/sim/src/engine';
import {fleetPosition} from '../packages/sim/src/travel';
import {distance} from '../packages/sim/src/math';
import {emptyOrders,orderReducer,previewOrders,withoutShipCourses,type PlannedOrder} from '../apps/web/src/turn-orders';
import {encodeExpedition,decodeExpedition} from '../apps/web/src/save-expedition';
const fixture=()=>createGame({...DEFAULT_OPTIONS,size:'Small',players:2,tutorial:false,approach:false},SPECIES);
test('every turn action can be cancelled, undone, redone and saved without committing its effects',()=>{
 const g=fixture(),capital=g.empires[0].capital,before=serialize(g);
 const orders:PlannedOrder[]=[{id:'a',kind:'command',label:'Focus',command:{empire:0,type:'focus',planet:capital,focus:'Industry'}},{id:'b',kind:'command',label:'Research',command:{empire:0,type:'research',tech:'improved-fusion'}},{id:'c',kind:'command',label:'Construction',command:{empire:0,type:'queue',planet:capital,item:{kind:'ship',id:'probe'}}}];
 let history=emptyOrders();for(const order of orders)history=orderReducer(history,{type:'append',order});const full=previewOrders(g,history.orders);assert.deepEqual(full.errors,{});assert.equal(full.commands.length,3);
 history=orderReducer(history,{type:'remove',id:'b'});assert.equal(previewOrders(g,history.orders).state.empires[0].research.length,0);
 history=orderReducer(history,{type:'undo'});assert.equal(serialize(previewOrders(g,history.orders).state),serialize(full.state));history=orderReducer(history,{type:'redo'});assert.equal(history.orders.length,2);
 history=orderReducer(history,{type:'replace',orders:[]});assert.equal(serialize(previewOrders(g,history.orders).state),before);history=orderReducer(history,{type:'undo'});assert.equal(history.orders.length,2);
 const restored=decodeExpedition(encodeExpedition(g,0,history.orders));assert.equal(serialize(restored.state),before);assert.deepEqual(restored.orders,history.orders);assert.equal(serialize(previewOrders(restored.state,restored.orders).state),serialize(previewOrders(g,history.orders).state));
 assert.equal(serialize(g),before);
});
test('queued routes do not depart, can be changed for individual ships, and cancel independently',()=>{
 const g=fixture(),f=g.fleets.find(f=>f.owner===0&&f.ships.length>1)!,ids=f.ships.map(s=>s.id),targets=g.systems.filter(s=>!canMove(g,f,s.id));
 const orders:PlannedOrder[]=[{id:'a',label:'2 ships',kind:'course',empire:0,shipIds:ids,target:targets[0].id},{id:'b',label:'1 ship',kind:'course',empire:0,shipIds:[ids[0]],target:targets[1].id}];
 const result=previewOrders(g,orders);assert.deepEqual(result.errors,{});
 for(const fleet of result.state.fleets.filter(f=>f.ships.some(s=>ids.includes(s.id))))assert.ok(distance(fleetPosition(result.state,fleet),fleetPosition(g,f))<.001);
 assert.equal(result.state.fleets.find(f=>f.ships.some(s=>s.id===ids[0]))!.destination,targets[1].id);
 const cancelled=previewOrders(g,withoutShipCourses(orders,[ids[0]]));assert.deepEqual(cancelled.errors,{});assert.equal(cancelled.state.fleets.find(f=>f.ships.some(s=>s.id===ids[0]))!.destination,null);assert.equal(cancelled.state.fleets.find(f=>f.ships.some(s=>s.id===ids[1]))!.destination,targets[0].id);
});
test('midflight course changes start at the current point and remain cancellable until End turn',()=>{
 let g=fixture();g.empires.forEach(e=>{e.ai=false;});const f=g.fleets.find(f=>f.owner===0&&f.ships.length>1)!,ids=f.ships.map(s=>s.id),home=f.systemId;
 g=processTurn(g,[{empire:0,type:'move',fleet:f.id,target:'alpha-centauri'}]);const travelling=g.fleets.find(v=>v.id===f.id)!;assert.ok(travelling.destination);const before=fleetPosition(g,travelling);assert.ok(distance(before,g.systems.find(s=>s.id===home)!)>.5);
 const order:PlannedOrder={id:'reroute',label:'Return home',kind:'course',empire:0,shipIds:[ids[0]],target:home};const preview=previewOrders(g,[order]);assert.deepEqual(preview.errors,{});
 const detached=preview.state.fleets.find(f=>f.ships.some(s=>s.id===ids[0]))!;assert.equal(detached.destination,home);assert.ok(distance(fleetPosition(preview.state,detached),before)<.001);
 assert.equal(serialize(previewOrders(g,[]).state),serialize(g));const next=processTurn(g,preview.commands),changed=next.fleets.find(f=>f.ships.some(s=>s.id===ids[0]))!;
 assert.ok(changed.systemId===home&&!changed.destination||distance(fleetPosition(next,changed),g.systems.find(s=>s.id===home)!)<distance(before,g.systems.find(s=>s.id===home)!));
 const restored=decodeExpedition(encodeExpedition(preview.state,0));assert.ok(distance(fleetPosition(restored.state,restored.state.fleets.find(f=>f.id===detached.id)!),before)<.001);
});
test('dependent actions are flagged instead of silently committing a partial batch',()=>{
 const g=fixture(),command={empire:0,type:'strategy' as const,fleet:'missing',strategy:'Brawler'};const result=previewOrders(g,[{id:'bad',kind:'command',label:'Dependent strategy',command}]);assert.ok(result.errors.bad);assert.equal(result.commands.length,0);assert.equal(serialize(result.state),serialize(g));
});

 test('cancellation never applies a later fleet action to a reused fleet ID',()=>{
 const g=fixture(),fleet=g.fleets.find(f=>f.owner===0&&f.ships.length>1)!,first=fleet.ships[0].id,second=fleet.ships[1].id;
 const route:PlannedOrder={id:'route',kind:'course',label:'Move first',empire:0,shipIds:[first],target:'alpha-centauri'},preview=previewOrders(g,[route]),detached=preview.state.fleets.find(f=>f.ships.some(s=>s.id===first))!;
 const strategy:PlannedOrder={id:'strategy',kind:'command',label:'Strategy',command:{empire:0,type:'strategy',fleet:detached.id,strategy:'Brawler'},guard:{fleetShips:[first]}};
 const replacement:PlannedOrder={...route,id:'other',shipIds:[second]};const result=previewOrders(g,[replacement,strategy]);assert.deepEqual(result.errors,{});assert.equal(result.state.fleets.find(f=>f.ships.some(s=>s.id===first))!.strategy,'Brawler');assert.notEqual(result.state.fleets.find(f=>f.ships.some(s=>s.id===second))!.strategy,'Brawler');
 });
 test('a shifted construction queue is flagged instead of buying the wrong item',()=>{
 const g=fixture(),planet=g.systems.flatMap(s=>s.planets).find(p=>p.id===g.empires[0].capital)!;planet.queue=[{kind:'ship',id:'probe'},{kind:'ship',id:'colony'}];g.empires[0].credits=1000;
 const buy:PlannedOrder={id:'buy',kind:'command',label:'Buy colony',command:{empire:0,type:'buy',planet:planet.id},guard:{queue:JSON.stringify(planet.queue[1])}};
 const result=previewOrders(g,[buy]);assert.ok(result.errors.buy);assert.equal(result.state.empires[0].credits,1000);assert.equal(result.commands.length,0);
 });
