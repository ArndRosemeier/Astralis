import type {GameState,Planet,Ship,StarSystem} from '../../../packages/sim/src/types';
import {observedSystem} from '../../../packages/sim/src/intel';
import {BUILDINGS,CIVIL,TECHS} from '../../../packages/sim/src/rules';
export type MomentKind='colony'|'outpost'|'discovery'|'research'|'construction'|'launch'|'growth'|'contact'|'treaty'|'artifact'|'victory'|'terraform'|'arrival'|'economy'|'repair'|'leader'|'setback';
export type Moment={id:string;turn:number;kind:MomentKind;title:string;subtitle:string;color:string;importance:number;systemId?:string;planet?:Planet;system?:StarSystem;techId?:string;field?:string;buildingId?:string;ship?:Ship;otherSpecies?:string;value?:number;before?:number;after?:number;count?:number;owner:number;battleId?:string};
export const MOMENT_COLORS:Record<MomentKind,string>={colony:'#75ffd1',outpost:'#8cdfff',discovery:'#88caff',research:'#c5a1ff',construction:'#ffc776',launch:'#7ee8ff',growth:'#9df5a8',contact:'#ffb5d5',treaty:'#f3d38a',artifact:'#eacbff',victory:'#ffd67e',terraform:'#8fefc1',arrival:'#87ceee',economy:'#ffd78a',repair:'#a6e2ef',leader:'#f1b8e4',setback:'#ff8c97'};
const fieldColors:Record<string,string>={'Propulsion':'#7ddcff','Energy & Weapons':'#ffc982','Materials':'#a9baff','Life Sciences':'#9df5b6','Computing':'#d4a0ff','Society':'#ffb4d8'};
const planets=(g:GameState)=>g.systems.flatMap(s=>s.planets);
/** Compare committed turns only. Orders and their undo/redo never award accomplishments. */
export function collectMoments(before:GameState,after:GameState,owner:number):Moment[]{
 if(after.turn<=before.turn||before.seed!==after.seed||before.empires[owner]?.speciesId!==after.empires[owner]?.speciesId)return [];
 const old=before.empires[owner],empire=after.empires[owner];if(!old||!empire)return [];
 const events:Moment[]=[],oldWorlds=new Map(planets(before).map(p=>[p.id,p])),oldShips=new Map(before.fleets.filter(f=>f.owner===owner).flatMap(f=>f.ships).map(s=>[s.id,s]));
 const add=(kind:MomentKind,key:string,title:string,subtitle:string,importance:number,extra:Partial<Moment>={})=>events.push({id:`${after.turn}:${kind}:${key}`,turn:after.turn,kind,title,subtitle,color:MOMENT_COLORS[kind],importance,owner,...extra});
 for(const p of planets(after)){
  const previous=oldWorlds.get(p.id);if(p.owner!==owner){if(previous?.owner===owner)add('setback',p.id,p.name,'A world lost',95,{systemId:p.systemId,planet:{...previous,owner:null,population:0}});continue;}
  if(previous?.owner!==owner||(previous.outpost&&!p.outpost)){const conquest=previous?.owner!==owner&&previous?.owner!==null&&previous?.owner!==undefined;add(conquest?'victory':p.outpost?'outpost':'colony',p.id,p.name,conquest?'A new flag above this world':p.outpost?'Your reach extends farther':'A new home among the stars',conquest?90:p.outpost?65:100,{planet:p,systemId:p.systemId,value:p.population});continue;}
  const buildings=p.buildings.filter(id=>!previous.buildings.includes(id));for(const id of buildings)add(['gaia','ecumenopolis','dyson'].includes(id)?'terraform':'construction',`${p.id}:${id}`,BUILDINGS.find(b=>b.id===id)?.name||id.replaceAll('-',' '),p.name,50,{planet:p,systemId:p.systemId,buildingId:id,count:buildings.length});
  if(Math.abs(p.temperature-previous.temperature)>=10||p.chemistry!==previous.chemistry)add('terraform',p.id,p.name,'A world reshaped',72,{planet:p,systemId:p.systemId,before:previous.temperature,after:p.temperature});
  if(!p.outpost&&Math.floor(p.population)>Math.floor(previous.population)&&p.population>=1)add('growth',p.id,p.name,`${Math.floor(p.population)} billion lives, one shared future`,35,{planet:p,systemId:p.systemId,before:previous.population,after:p.population});
 }
 const newSystems=new Set(empire.known.filter(id=>!old.known.includes(id)));
 for(const f of after.fleets.filter(f=>f.owner===owner)){
  const previous=before.fleets.find(old=>old.id===f.id);
  if(previous?.destination&&!f.destination){const system=after.systems.find(s=>s.id===f.systemId)!;const earlierVisit=before.reports.some(r=>r.owner===owner&&r.systemId===system.id&&r.category==='discovery'&&r.title.endsWith(' arrived'))||system.planets.some(p=>oldWorlds.get(p.id)?.owner===owner);
   if(!earlierVisit)newSystems.add(system.id);else add('arrival',f.id,system.name,f.name+' has arrived',20,{systemId:system.id,system:observedSystem(after,owner,system),ship:f.ships[0]});}
  for(const ship of f.ships){if(!oldShips.has(ship.id))add('launch',ship.id,after.designs[owner]?.find(d=>d.id===ship.designId)?.name||CIVIL.find(c=>c.id===ship.kind)?.name||'New spacecraft','Ready for the stars',55,{systemId:f.systemId,ship});else{const oldShip=oldShips.get(ship.id)!;if(ship.hp>oldShip.hp*1.2&&ship.hp-oldShip.hp>=3)add('repair',ship.id,f.name,'Back in fighting shape',25,{systemId:f.systemId,ship,before:oldShip.hp,after:ship.hp});}}
 }
 // Better instruments can resolve previously invisible worlds in an already known system.
 for(const id of empire.known){if(!old.known.includes(id)||newSystems.has(id))continue;const raw=after.systems.find(s=>s.id===id),prior=before.systems.find(s=>s.id===id);if(raw&&prior&&observedSystem(after,owner,raw).planets.length>observedSystem(before,owner,prior).planets.length)newSystems.add(id);}
 for(const id of newSystems){const raw=after.systems.find(s=>s.id===id);if(!raw)continue;const system=observedSystem(after,owner,raw);add('discovery',id,system.name,system.planets.length?`${system.planets.length} worlds revealed`:'A new point of light',80,{systemId:id,system,count:system.planets.length});}
 const techs=empire.techs.filter(id=>!old.techs.includes(id));for(const id of Object.keys(empire.repeatables||{}))if((empire.repeatables?.[id]||0)>(old.repeatables?.[id]||0))techs.push(id);
 for(const id of techs){const t=TECHS.find(t=>t.id===id);add('research',id,t?.name||id,t?.description||'New possibilities unlocked',85,{techId:id,field:t?.field,color:fieldColors[t?.field||'']||MOMENT_COLORS.research});}
 for(const r of after.relations.filter(r=>r.a===owner||r.b===owner)){
  const prior=before.relations.find(v=>v.a===r.a&&v.b===r.b),other=after.empires[r.a===owner?r.b:r.a];if(!other)continue;
  if(r.contact&&!prior?.contact)add('contact',String(other.id),other.name,'You are not alone',88,{otherSpecies:other.speciesId});
  else if(r.state==='Alliance'&&prior?.state!=='Alliance'||r.trade&&!prior?.trade||r.research&&!prior?.research||r.state==='Ceasefire'&&prior?.state==='War')add('treaty',String(other.id),other.name,r.state==='Alliance'?'Two civilizations, a shared horizon':r.state==='Ceasefire'?'The guns fall silent':r.trade&&!prior?.trade?'A new trade connection':'Knowledge crosses the void',60,{otherSpecies:other.speciesId});
 }
 for(const artifact of empire.artifacts.filter(id=>!old.artifacts.includes(id)))add('artifact',artifact,artifact,'The past opens a door',92);
 if(empire.keys>old.keys)add('artifact','key','An Archive Key',`${empire.keys} of 3 recovered`,94,{value:empire.keys});
 for(const leader of empire.leaders){const previous=old.leaders.find(l=>l.id===leader.id);if(!previous||leader.level>previous.level)add('leader',leader.id,leader.name,previous?`Experience becomes wisdom · Level ${leader.level}`:`A new ${leader.role.toLowerCase()} joins your story`,40,{value:leader.level});}
 const threshold=[100,250,500,1000,2500,5000,10000].filter(n=>old.credits<n&&empire.credits>=n).at(-1);if(threshold)add('economy',String(threshold),'A thriving civilization',`${threshold.toLocaleString('en-US')} credits in reserve`,30,{before:old.credits,after:empire.credits,value:threshold});
 for(const battle of after.battles.filter(b=>!before.battles.some(old=>old.id===b.id)&&(b.attacker===owner||b.defender===owner)))add(battle.winner===owner?'victory':battle.winner===null?'arrival':'setback',battle.id,after.systems.find(s=>s.id===battle.systemId)?.name||battle.name,battle.winner===owner?'The fleet holds the field':battle.winner===null?'Your ships return from the encounter':'A hard-fought loss',battle.winner===owner?90:70,{systemId:battle.systemId,battleId:battle.id,ship:after.fleets.find(f=>f.owner===owner&&f.systemId===battle.systemId)?.ships[0]});
 if(after.winner===owner&&before.winner===null)add('victory','campaign',empire.name,`${after.victory} victory`,120,{value:after.turn});
 return events.sort((a,b)=>b.importance-a.importance||a.id.localeCompare(b.id));
}
