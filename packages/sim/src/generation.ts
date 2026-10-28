import {updateIntel} from './intel';
import nearby from '../../catalog/src/systems.json';
import knownPlanets from '../../catalog/src/planets.json';
import type {Empire,GameOptions,GameState,Planet,Species,StarSystem} from './types';
import {distance,quant,random,seedHash,weighted} from './math';
import {autoDesign,capacity,designStats,pick,telescope,VERSION} from './rules';
type CatalogStar={id:string;name:string;x:number;y:number;z:number;spectral:string;luminosity:number;mass:number;temperature:number;distance:number;observationDepth?:string};
export const DEFAULT_OPTIONS:GameOptions={seed:'BEYOND-THE-VEIL',size:'Medium',players:4,speciesId:'humans',turnLimit:120,region:'Sol',lightDelay:true,heat:false,approach:true,impactors:true,difficulty:'Standard',tutorial:true};
export function createPlanet(system:CatalogStar,index:number,rng:{rng:number},known?:typeof knownPlanets[number]):Planet{
 const orbit=known?.orbit||Math.max(.01,Math.sqrt(Math.max(.00001,system.luminosity))*(.4+index*.55));
 const radius=known?.radius||(random(rng)<(system.spectral.startsWith('M')?.08:.22)?3+random(rng)*9:.35+random(rng)*1.65);const temp=known?.temperature||278*Math.sqrt(Math.sqrt(Math.max(.000001,system.luminosity)))/Math.sqrt(orbit)+15;
 const gas=radius>2.2;const water=random(rng);const temperature=quant(temp);
 const kind=gas?'gas':temperature<200?'ice':water>.88?'ocean':'rocky';
 const chemistry=temperature<180?'Reducing':water>.3&&temperature>250&&temperature<330?'Oxygen':'Carbonic';
 return {id:known?.id||`${system.id}-generated-${index}`,systemId:system.id,name:known?.name||`${system.name} ${String.fromCharCode(98+index)}`,kind,radius:quant(radius),gravity:quant(known?.mass&&radius?known.mass/(radius*radius):radius*(.6+random(rng)*1.2)),temperature,light:known?.hostLuminosity!=null?(known.hostLuminosity<.1?'Dim':known.hostLuminosity>3?'Bright':'Normal'):/^[MLTY>]/.test(system.spectral)?'Dim':/^[OBAF]/.test(system.spectral)?'Bright':'Normal',chemistry,pressure:gas?4:random(rng)<.2?1:2,water:kind==='ice'?.75:kind==='gas'?0:water,radiation:system.spectral.startsWith('M')?random(rng)<.35?2:1:0,locked:orbit<.15,orbit:quant(orbit),confirmed:!!known&&known.status==='confirmed',candidate:known?.status==='candidate',deposit:random(rng)<.4?weighted(rng,['metals','volatiles','rare','exotics'] as const):undefined,ruins:random(rng)<.09?1+Math.floor(random(rng)*3):0,custodian:0,owner:null,population:0,speciesId:null,buildings:[],queue:[],progress:0,focus:'Balanced',garrison:0,integration:0,terraformProgress:0};
}
export function createGame(options:GameOptions,roster:Species[],extended?:CatalogStar[],extendedKnown?:typeof knownPlanets):GameState{
 const seed=seedHash(options.seed);const rng={rng:seed};
 const radius={Small:15,Medium:20,Large:25,Huge:32}[options.size];
 let catalog:CatalogStar[]=extended||nearby;
 let centre={x:0,y:0,z:0};if(options.region==='Random'){const candidates=catalog.filter(s=>s.distance>5&&s.spectral.startsWith('G'));for(let attempt=0;attempt<96;attempt++){const candidate=weighted(rng,candidates);if(catalog.filter(s=>distance(s,candidate)<=radius).length>=options.players*2){centre=candidate;break;}}if(centre.x===0&&centre.y===0&&centre.z===0){const dense=catalog.filter(s=>s.distance<20&&s.spectral.startsWith('G'));centre=weighted(rng,dense)||centre;}}
 catalog=[...catalog].filter(s=>distance(s,centre)<=radius).sort((a,b)=>distance(a,centre)-distance(b,centre));if(catalog.length<options.players)throw new Error('This observed region has too few catalogued systems. Choose a larger map or fewer civilizations.');
 const systems:StarSystem[]=catalog.map(raw=>{
  const system:StarSystem={...raw,planets:[]};const known=(extendedKnown||knownPlanets).filter(p=>p.systemId===raw.id&&(p.status!=='candidate'||random(rng)<.6));
  for(const [i,p] of known.entries())system.planets.push(createPlanet(raw,i,rng,p));
  const additional=Math.max(0,3+Math.floor(random(rng)*4)-known.length);
  for(let i=0;i<additional;i++){const p=createPlanet(raw,known.length+i,rng);if(!system.planets.some(k=>Math.abs(k.orbit-p.orbit)<p.orbit*.2))system.planets.push(p);}
  for(const giant of [...system.planets].filter(p=>p.kind==='gas')){const moon=createPlanet(raw,system.planets.length,rng);Object.assign(moon,{id:giant.id+'-moon-1',name:giant.name+' I',kind:'ice',radius:.4,gravity:.18,temperature:giant.temperature,orbit:giant.orbit,water:.9,locked:false});system.planets.push(moon);}
  if(!system.planets.length)system.planets.push(createPlanet(raw,0,rng));
  system.planets.sort((a,b)=>a.orbit-b.orbit);return system;
 });
 const g:GameState={version:VERSION,seed,rng:rng.rng,turn:0,options:{...options,players:Math.min(options.players,roster.length)},systems,species:structuredClone(roster),empires:[],fleets:[],designs:{},relations:[],battles:[],reports:[],concord:{formed:false,nextSession:0,dissolved:false},approach:{distance:50,strength:0,defeated:false},winner:null,victory:null,history:[],nextId:1};
 const selected=roster.find(s=>s.id===options.speciesId)||roster[0];const pool=[selected,...roster.filter(s=>s.id!==selected.id).sort((a,b)=>seedHash(a.id+options.seed)-seedHash(b.id+options.seed))];
 const homes:StarSystem[]=[];
 for(let i=0;i<g.options.players;i++){
  const s=pool[i];let home:StarSystem;
  if(i===0&&s.id==='humans'&&systems.some(s=>s.id==='sol'))home=systems.find(s=>s.id==='sol')!;
  else{const suitable=systems.filter(st=>!homes.includes(st)&&((s.light==='Dim'&&st.spectral.startsWith('M'))||(s.light==='Bright'&&['A','F'].includes(st.spectral[0]))||(s.light==='Normal'&&['G','K'].includes(st.spectral[0]))));let candidates=suitable.length?suitable:systems.filter(s=>s.spectral[0]!=='Y'&&s.spectral[0]!=='T'&&!homes.includes(s));const reference={techs:[],capital:'',repeatables:{}} as unknown as Empire;const values=new Map(candidates.map(st=>[st.id,systems.filter(other=>distance(st,other)<=8).reduce((total,other)=>total+other.planets.reduce((n,p)=>n+capacity(p,s,reference),0)/(1+distance(st,other)*.1),0)]));const middle=[...values.values()].sort((a,b)=>a-b)[Math.floor(values.size/2)]||0;const fair=candidates.filter(st=>(values.get(st.id)||0)>=middle*.6&&(values.get(st.id)||0)<=middle*1.6);if(fair.length)candidates=fair;home=candidates.sort((a,b)=>{const score=(v:StarSystem)=>homes.length?Math.min(...homes.map(h=>distance(h,v))):12-Math.abs(v.distance-12);return score(b)-score(a);})[0]||systems[i];}
  homes.push(home);
  let p=i===0&&s.id==='humans'?home.planets.find(p=>p.name==='Earth'):undefined;
  if(!p){p=createPlanet(home,home.planets.length,g);p.name=s.id==='humans'?'New Earth':`${s.name} Prime`;p.id=`${home.id}-home-${i}`;home.planets.push(p);}
  Object.assign(p,{kind:s.medium==='Aerial'?'gas':s.medium==='Aquatic'?'ocean':'rocky',radius:1,gravity:s.gravity,temperature:s.temperature,light:s.light,chemistry:s.chemistry,pressure:s.medium==='Aerial'?4:2,water:s.medium==='Aquatic'?.9:.5,radiation:0,locked:false,owner:i,population:8,speciesId:s.id,buildings:['gardener-foundry','gardener-archive','spaceport','fusion-plant','planetary-defence-grid'],garrison:2,ruins:0});
  if(pick(s,'origin-large'))p.radius=1.4;if(pick(s,'origin-small'))p.radius=.65;if(pick(s,'origin-rich'))p.deposit='metals';if(pick(s,'origin-poor'))p.deposit=undefined;if(pick(s,'origin-nomad')){p.kind='habitat';p.name=s.name+' Hearth';p.radius=1;p.population=3;}
  const e:Empire={id:i,name:s.name==='Humans'?'Terran Union':`${s.name} ${s.government==='Unified'?'Consciousness':s.government==='Directorate'?'Consortium':'Sovereignty'}`,speciesId:s.id,color:s.color,ai:i>0,personality:weighted(g,['Expansionist','Militarist','Trader','Scholar','Diplomat','Isolationist','Opportunist']),credits:50,techs:[],research:[],researchProgress:0,tax:'Normal',known:[],capital:p.id,reputation:50,artifacts:[],keys:0,legacyProgress:0,vote:null,defy:false,leaders:[],agents:1,spyTarget:null,spyMission:'intel',automation:{colonies:false,research:false,fleets:false},eliminated:false,ready:false};g.empires.push(e);
  if(pick(s,'origin-vault')){e.artifacts.push('Veil Shield');p.ruins=1;}if(pick(s,'origin-twin')){const twin=createPlanet(home,90+i,g);Object.assign(twin,{id:p.id+'-twin',name:p.name+' Secundus',radius:.65,temperature:s.temperature,gravity:s.gravity,chemistry:s.chemistry,pressure:2,water:s.medium==='Aquatic'?.8:.5,kind:s.medium==='Aerial'?'gas':'rocky',radiation:0,owner:i,population:2,speciesId:s.id,locked:false});home.planets.push(twin);}
  const d=autoDesign(e);g.designs[i]=[d];
  const ships=[{id:`s${g.nextId++}`,designId:d.id,kind:'warship' as const,hp:designStats(d).hp,experience:0,troops:0},{id:`s${g.nextId++}`,designId:d.id,kind:'warship' as const,hp:designStats(d).hp,experience:0,troops:0}];
  g.fleets.push({id:`f${g.nextId++}`,owner:i,name:'First Expedition',systemId:home.id,destination:null,remaining:0,origin:null,ships,strategy:'Line of battle',order:'hold',targetPlanet:null});
  for(const kind of ['colony','probe','probe'] as const)g.fleets.push({id:`f${g.nextId++}`,owner:i,name:kind==='colony'?'Pioneer':'Pathfinder',systemId:home.id,destination:null,remaining:0,origin:null,ships:[{id:`s${g.nextId++}`,designId:kind,kind,hp:15,experience:0,troops:0}],strategy:'Evasive',order:'hold',targetPlanet:null});
  if(pick(s,'origin-nomad'))g.fleets.push({id:`f${g.nextId++}`,owner:i,name:'Hearth Convoy',systemId:home.id,destination:null,remaining:0,origin:null,ships:[{id:`s${g.nextId++}`,designId:'habitat',kind:'habitat',hp:100,experience:0,troops:0}],strategy:'Evasive',order:'hold',targetPlanet:null,nomadCapital:p.id});
  e.known=systems.filter(s=>distance(s,home)<=telescope(e)).map(s=>s.id);
  g.reports.push({id:`r${g.nextId++}`,turn:0,owner:i,category:'event',title:'The Veil has lifted',body:'The Gardener starter kit has awakened. Your people are ready to join the stars.',systemId:home.id});
 }
 for(let a=0;a<g.empires.length;a++)for(let b=a+1;b<g.empires.length;b++)g.relations.push({a,b,state:'Neutral',trade:false,research:false,contact:false,attitude:10,breaches:0,since:0,ceasefireUntil:0});
 // Three guaranteed guarded sites make a Legacy victory possible on every seed.
 for(let i=0;i<3;i++){const target=systems.filter(s=>!homes.includes(s))[Math.floor((i+1)*(systems.length-homes.length)/4)];if(target?.planets[0]){target.planets[0].ruins=3;target.planets[0].custodian=35+i*20;}}
 updateIntel(g,true);return g;
}
