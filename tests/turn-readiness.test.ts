import {test} from 'node:test';
import assert from 'node:assert/strict';
import {achievementFixture} from './achievement-fixture';
import {output,researchChoices,researchRequired,TECHS} from '../packages/sim/src/rules';
import {processTurn,serialize} from '../packages/sim/src/engine';
import {turnSubmissionError} from '../packages/sim/src/turn-readiness';
import {Multiplayer} from '../apps/web/src/net/session';

test('research requirement uses the submitted draft, including cancellation and delegation',()=>{
 const {game}=achievementFixture(),e=game.empires[0];e.research=[];
 const before=serialize(game),tech=researchChoices(game,e)[0].id;
 assert.match(turnSubmissionError(game,0,[])!,/Choose a research/);
 assert.equal(turnSubmissionError(game,0,[{empire:0,type:'research',tech}]),null);
 assert.match(turnSubmissionError(game,0,[{empire:0,type:'research',tech},{empire:0,type:'cancel-research',index:0}])!,/Choose a research/);
 assert.equal(turnSubmissionError(game,0,[{empire:0,type:'automate',area:'research',value:true}]),null);
 assert.equal(serialize(game),before,'validation must not mutate the save');
 e.automation.research=true;assert.match(turnSubmissionError(game,0,[{empire:0,type:'automate',area:'research',value:false}])!,/Choose a research/);
});

test('locked and completed queue entries cannot satisfy research; repeatables can',()=>{
 const {game}=achievementFixture(),e=game.empires[0];e.techs=['improved-fusion'];e.research=['improved-fusion','advanced-propulsion'];
 assert.equal(researchRequired(game,e),true);
 const species=game.species.find(s=>s.id===e.speciesId)!;species.picks=['rigid'];
 const alternative=TECHS.find(t=>t.field==='Propulsion'&&t.tier===1&&t.id!=='improved-fusion')!;
 e.research=[alternative.id];assert.equal(researchRequired(game,e),true,'Rigid alternatives are not eligible');species.picks=[];
 e.techs=TECHS.filter(t=>t.tier<=8).map(t=>t.id);e.research=['advanced-propulsion'];assert.equal(researchRequired(game,e),false);
 e.research=[];assert.equal(researchRequired(game,e),true,'repeatable advances remain research');
 const all=TECHS.splice(0);try{assert.equal(researchRequired(game,e),false,'no eligible projects must not deadlock');}finally{TECHS.push(...all);}
});

test('trade goods pay half unused industry and never consume construction overflow',()=>{
 const {game,home}=achievementFixture();home.queue=[];home.progress=7;game.empires[0].researchProgress=0;
 const out=output(game,home,game.empires[0]);assert.equal(out.tradeGoods,Math.round(out.industry*.5*100)/100);
 const building=structuredClone(game),other=building.systems.flatMap(s=>s.planets).find(p=>p.id===home.id)!;other.queue=[{kind:'ship',id:'probe'}];
 assert.equal(output(building,other,building.empires[0]).tradeGoods,0);
 const next=processTurn(game),control=processTurn(building);
 assert.ok(Math.abs(next.empires[0].credits-control.empires[0].credits-out.tradeGoods)<.011);
 assert.equal(next.systems.flatMap(s=>s.planets).find(p=>p.id===home.id)!.progress,7);
 assert.equal(next.empires[0].researchProgress,control.empires[0].researchProgress);
});

test('synthetic assembly has priority and unrest/outposts cannot manufacture trade goods',()=>{
 const {game,home}=achievementFixture();home.queue=[];
 const synthetic=game.species.find(s=>s.frame==='Synthetic')!;home.speciesId=synthetic.id;home.assembly=1;home.population=1;
 let out=output(game,home,game.empires[0]);assert.ok(out.assemblyIndustry>0);assert.equal(out.tradeGoods,0);
 home.assembly=.4;out=output(game,home,game.empires[0]);assert.ok(out.tradeGoods>0);assert.ok(Math.abs(out.tradeGoods-(out.industry-out.assemblyIndustry)*.5)<.011);
 const before=home.population,next=processTurn(game),after=next.systems.flatMap(s=>s.planets).find(p=>p.id===home.id)!;
 assert.ok(Math.abs(after.population-before-out.assemblyIndustry*.05)<.011);
 home.outpost=true;assert.equal(output(game,home,game.empires[0]).tradeGoods,0);home.outpost=false;
 home.recentConquest=100;home.integration=20;game.empires[0].credits=0;game.empires[0].tax='High';out=output(game,home,game.empires[0]);assert.ok(out.stability<25);assert.equal(out.tradeGoods,0);
});

test('host rejects missing research and an expired timer pauses until research is selected',async()=>{
 const {game}=achievementFixture();game.empires[0].research=[];
 const host=Object.create(Multiplayer.prototype) as Multiplayer;let published=0;
 Object.assign(host,{packet:{game,version:game.version,seats:[{empire:0,token:'test',peer:1,name:'Test'}],pending:{},chat:[],turnSeconds:60,deadline:Date.now()-1},hub:{isHost:true,you:1,players:[{id:1}]},disconnected:new Map(),closed:false,publish:()=>published++,notify:()=>{},onError:()=>{}});
 await host.intent({type:'ready',token:'test',orders:[]},1);assert.equal(game.empires[0].ready,false);assert.equal(game.turn,0);
 host.tick();assert.equal(host.packet!.game.turn,0);assert.equal(host.packet!.deadline,undefined);assert.equal(game.empires[0].ready,false);assert.ok(published>0);
 const tech=researchChoices(game,game.empires[0])[0].id;
 await host.intent({type:'ready',token:'test',orders:[{type:'research',empire:0,tech}]},1);
 assert.equal(host.packet!.game.turn,1);assert.ok(host.packet!.deadline!>Date.now());
});
