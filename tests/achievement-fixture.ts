import type {Planet} from '../packages/sim/src/types';
import {createGame,DEFAULT_OPTIONS} from '../packages/sim/src/generation';
import {SPECIES} from '../packages/sim/src/species';
import {BUILDINGS,TECHS,researchCost,speciesFor} from '../packages/sim/src/rules';
import {cost,planetById} from '../packages/sim/src/engine';
export function achievementFixture(broad=false){
 const game=createGame({...DEFAULT_OPTIONS,size:'Small',players:2,approach:false,tutorial:false,lightDelay:false},SPECIES);game.empires.forEach(e=>{e.ai=false;e.automation={colonies:false,research:false,fleets:false};});
 const empire=game.empires[0],home=planetById(game,empire.capital)!,system=game.systems.find(s=>s.id===home.systemId)!;
 const pioneer={...structuredClone(home),id:'qa-new-dawn',name:'New Dawn',owner:null,population:0,speciesId:null,buildings:[],queue:[],progress:0,outpost:false};system.planets.push(pioneer);
 const shipyard=home;shipyard.queue=[{kind:'ship',id:'probe'}];shipyard.progress=cost(game,shipyard,shipyard.queue[0])-1;home.population=5.99;
 const industry:Planet={...structuredClone(home),id:'qa-haven',name:'Haven',population:2,buildings:[],queue:[],progress:0};system.planets.push(industry);
 const building=BUILDINGS.find(b=>!b.requires&&/factory|lab|farm/.test(b.id))||BUILDINGS[0];industry.queue=[{kind:'building',id:building.id}];industry.progress=cost(game,industry,industry.queue[0])-1;
 empire.research=['improved-fusion'];empire.researchProgress=researchCost(empire,speciesFor(game,empire),'improved-fusion')-1;empire.credits=99;
 const scout=game.fleets.find(f=>f.owner===0&&f.ships.some(s=>s.kind==='probe'))!;scout.destination='alpha-centauri';scout.origin=home.systemId;scout.remaining=.1;delete scout.travelFrom;
 const colonizer=game.fleets.find(f=>f.owner===0&&f.ships.some(s=>s.kind==='colony'))!;
 if(broad){empire.research=[...new Set(TECHS.filter(t=>t.tier===1).map(t=>t.field))].map(field=>TECHS.find(t=>t.tier===1&&t.field===field)!.id);empire.researchProgress=9999;game.fleets.find(f=>f.owner===0&&f.ships.some(s=>s.kind==='warship'))!.ships[0].hp=1;const visitor=game.fleets.find(f=>f.owner===1)!;visitor.systemId=home.systemId;visitor.destination=null;game.relations[0].contact=false;system.planets.push({...structuredClone(home),id:'qa-visitor-world',name:'Visitors’ Reach',owner:1,speciesId:game.empires[1].speciesId,queue:[],progress:0});}
 return {game,home,pioneer,industry,building,colonizer};
}
