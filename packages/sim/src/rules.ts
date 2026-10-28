import {bonuses} from './effects';
import data from './rules-data.json';
import type {Empire,Fleet,GameState,Planet,ShipDesign,Species} from './types';
import {clamp,quant} from './math';
export const VERSION='0.013';
export const TECHS=[...data.techs,...['Propulsion','Energy & Weapons','Materials','Life Sciences','Computing','Society'].map((field,i)=>({id:['advanced-propulsion','advanced-weapons','advanced-materials','advanced-biology','advanced-computing','advanced-society'][i],name:['Advanced Propulsion','Advanced Weapons','Advanced Materials','Advanced Biology','Advanced Computing','Advanced Society'][i],field,tier:9,cost:2000,description:['Supply +1 ly; battle acceleration +5%.','Weapon damage +5%.','Armour +5%; building cost −2%.','Population capacity +3%.','Research +3%.','Stability +2; commerce +3%.'][i]}))];
export const BUILDINGS=data.buildings;
export const FIELDS=['Propulsion','Energy & Weapons','Materials','Life Sciences','Computing','Society'];
export const FOCUSES={Balanced:[.4,.3,.3],Industry:[.7,.15,.15],Research:[.15,.7,.15],Commerce:[.15,.15,.7],Growth:[.34,.33,.33]};
export const RATINGS=['Ideal','Good','Harsh','Hostile','Lethal','Uninhabitable'];
export const GOVERNMENTS={
 Autocracy:{stability:55,admin:8,industry:0,research:-.1,commerce:0,ships:-.1,troops:.25,mature:'Imperium'},
 Republic:{stability:60,admin:6,industry:0,research:.1,commerce:.2,ships:0,troops:0,mature:'Commonwealth'},
 Communion:{stability:70,admin:7,industry:0,research:-.15,commerce:0,ships:0,troops:.25,mature:'Ascendant Communion'},
 Federation:{stability:60,admin:12,industry:0,research:0,commerce:.1,ships:.1,troops:0,mature:'Grand Federation'},
 Technocracy:{stability:50,admin:7,industry:0,research:.25,commerce:-.1,ships:0,troops:0,mature:'Enlightened Technocracy'},
 Directorate:{stability:50,admin:8,industry:0,research:0,commerce:.3,ships:0,troops:0,mature:'Hegemony'},
 Unified:{stability:75,admin:10,industry:.2,research:-.1,commerce:0,ships:0,troops:0,mature:'Gestalt'}
};
export const HULLS=[
 {id:'corvette',name:'Corvette',space:10,hp:20,acceleration:10,cost:25,upkeep:.5,capacity:1,tier:0},
 {id:'frigate',name:'Frigate',space:20,hp:45,acceleration:8,cost:45,upkeep:1,capacity:1,tier:0},
 {id:'destroyer',name:'Destroyer',space:35,hp:80,acceleration:6.5,cost:80,upkeep:1.5,capacity:2,tier:1},
 {id:'cruiser',name:'Cruiser',space:60,hp:150,acceleration:5,cost:140,upkeep:2.5,capacity:3,tier:3},
 {id:'battleship',name:'Battleship',space:100,hp:280,acceleration:3.5,cost:240,upkeep:4,capacity:5,tier:5},
 {id:'dreadnought',name:'Dreadnought',space:160,hp:480,acceleration:2.5,cost:400,upkeep:6,capacity:8,tier:7},
 {id:'platform',name:'Defence Platform',space:40,hp:120,acceleration:0,cost:80,upkeep:1,capacity:0,tier:0},
 {id:'fortress',name:'Star Fortress',space:200,hp:800,acceleration:0,cost:600,upkeep:5,capacity:0,tier:8}
];
export const WEAPONS=[
 {id:'pulse-laser',name:'Pulse Laser',family:'laser',tier:0,damage:4,rate:1,range:60,space:3,power:2},
 {id:'uv-laser',name:'UV Laser',family:'laser',tier:2,damage:6,rate:1,range:70,space:3,power:2},
 {id:'x-ray-laser',name:'X-Ray Laser',family:'laser',tier:3,damage:9,rate:1,range:80,space:3,power:2},
 {id:'gamma-ray-laser',name:'Gamma-Ray Laser',family:'laser',tier:6,damage:13,rate:1,range:90,space:3,power:2},
 {id:'coilgun',name:'Coilgun',family:'kinetic',tier:0,damage:6,rate:.5,range:50,space:3,power:1},
 {id:'railgun',name:'Railgun',family:'kinetic',tier:1,damage:9,rate:.5,range:60,space:3,power:1},
 {id:'hypervelocity-railgun',name:'Hypervelocity Railgun',family:'kinetic',tier:5,damage:13,rate:.5,range:70,space:3,power:1},
 {id:'chemical-missile',name:'Chemical Missile',family:'missile',tier:0,damage:15,rate:1/6,range:150,space:4,power:0},
 {id:'fusion-missile',name:'Fusion Missile',family:'missile',tier:1,damage:22,rate:1/6,range:180,space:4,power:0},
 {id:'antimatter-warhead',name:'Antimatter Warhead',family:'missile',tier:4,damage:35,rate:1/6,range:200,space:4,power:0},
 {id:'swarm-missile',name:'Swarm Missile',family:'missile',tier:5,damage:48,rate:1/8,range:200,space:4,power:0},
 {id:'autonomous-missile',name:'Autonomous Missile',family:'missile',tier:7,damage:45,rate:1/6,range:250,space:4,power:0},
 {id:'neutral-particle-beam',name:'Neutral Particle Beam',family:'particle',tier:4,damage:8,rate:1,range:40,space:4,power:3},
 {id:'proton-lance',name:'Proton Lance',family:'particle',tier:6,damage:70,rate:.5,range:60,space:40,power:15},
 {id:'antiproton-beam',name:'Antiproton Beam',family:'particle',tier:7,damage:14,rate:1,range:50,space:4,power:3},
 {id:'mass-driver',name:'Mass Driver',family:'kinetic',tier:3,damage:60,rate:.25,range:90,space:30,power:8},
 {id:'relativistic-slug-thrower',name:'Relativistic Slug Thrower',family:'kinetic',tier:8,damage:200,rate:.1,range:150,space:30,power:10}
];
export const STRATEGIES=[
 {id:'Line of battle',text:'Hold formation at medium range. Concentrate fleet fire.'},
 {id:'Brawler',text:'Close rapidly and attack the nearest heavy target.'},
 {id:'Skirmisher',text:'Maintain range. Withdraw below 50% hull.'},
 {id:'Sniper',text:'Stay behind the line and engage the largest threat.'},
 {id:'Escort',text:'Screen friendly vessels; prioritize incoming missiles.'},
 {id:'Missile boat',text:'Launch long-range volleys. Withdraw when ammunition is spent.'},
 {id:'Interceptor',text:'Hunt vulnerable missile boats and transports.'},
 {id:'Raider',text:'Prioritize civilian shipping and avoid heavy warships.'},
 {id:'Planet assault',text:'Suppress planetary defenses and protect landing ships.'},
 {id:'Picket / defender',text:'Hold position near the planet. Engage approaching enemies.'}
];
export const CIVIL=[{id:'colony',name:'Colony ship',cost:100},{id:'probe',name:'Survey probe',cost:12},{id:'outpost',name:'Outpost ship',cost:40},{id:'transport',name:'Troop transport',cost:40},{id:'depot',name:'Depot ship',cost:60},{id:'impactor',name:'Relativistic impactor',cost:300}];
export const PROJECTS=[{id:'settlement',name:'In-system settlement',cost:75,description:'Establish a colony on an unclaimed world in this system.'},{id:'garrison',name:'Raise garrison',cost:20,description:'Train two garrison units.'},{id:'terraform',name:'Terraforming step',cost:100,description:'Improve temperature or atmospheric chemistry toward your species profile. At least 3 turns.'},{id:'habitat',name:'Habitat Ring',cost:200,description:'Construct a habitable orbital ring with capacity for 4 bn.'},{id:'gaia',name:'Gaia Transformation',cost:600,description:'Transform an ideal world. Minimum 10 turns.'},{id:'ecumenopolis',name:'Ecumenopolis',cost:1000,description:'Build a city-world. Minimum 15 turns.'},{id:'dyson',name:'Dyson Swarm',cost:2000,description:'System industry +50%. Minimum 20 turns.'},{id:'legacy',name:'Gardener Archive',cost:3000,description:'Complete the Legacy victory after collecting three keys and Archive Decryption. Minimum 10 turns.'}];
export const has=(e:Empire,id:string)=>e.techs.includes(id)||id==='gamma-ray-laser'&&e.techs.includes('gamma-ray-laser-graser');
export const pick=(s:Species,id:string)=>s.picks.includes(id);
export function aptitude(s:Species,field:string){const chosen=pick(s,field+'-2')?2:pick(s,field+'-1')?1:pick(s,field+'-minus')?-1:0;return clamp(chosen+(field==='industry'&&s.frame==='Lithic'?1:0),-1,2);}
export const speciesFor=(g:GameState,e:Empire)=>g.species.find(s=>s.id===e.speciesId)!;
export const colonies=(g:GameState,id:number)=>g.systems.flatMap(s=>s.planets).filter(p=>p.owner===id&&!p.outpost);
export function government(s:Species,e:Empire){const b={...GOVERNMENTS[s.government]};if(!has(e,'constitutional-reform'))return b;switch(s.government){case 'Autocracy':return {...b,admin:12,ships:-.2,research:0};case 'Republic':return {...b,commerce:.3,research:.15,stability:65};case 'Communion':return {...b,stability:80,research:-.05};case 'Federation':return {...b,admin:16};case 'Technocracy':return {...b,research:.35,stability:55};case 'Directorate':return {...b,commerce:.4};case 'Unified':return {...b,industry:.3,admin:14};}}
export function habitability(p:Planet,s:Species,e?:Empire){
 if(p.kind==='belt'||p.kind==='gas'&&s.medium!=='Aerial')return {rating:5,name:'Uninhabitable',reason:'No habitable surface',axes:[5]};
 if(p.kind==='habitat')return {rating:0,name:'Ideal',reason:'Engineered habitat',axes:[0]};
 const adaptation=(e?.techs.filter(t=>['genetic-survey','adaptation-ii','adaptation-iii'].includes(t)).length||0)*.2+(pick(s,'genetic-plasticity')&&e?.techs.includes('adaptation-iii')?.2:0);
 const tempWidth=pick(s,'temperature-wide')?100:pick(s,'temperature-narrow')?35:65;
 let temperature=Math.max(0,Math.ceil((Math.abs(p.temperature-s.temperature)-35)/(tempWidth*(1+adaptation))));
 let gravity=Math.max(0,Math.ceil((Math.abs(p.gravity-s.gravity)-.4)/(pick(s,'gravity-wide')?.8:pick(s,'gravity-narrow')?.25:.5)*(p.gravity>s.gravity?1.5:1)));
 let chemistry=s.frame==='Synthetic'||pick(s,'sealed-metabolism')?0:p.chemistry===s.chemistry?0:3;
 let pressure=p.pressure===0?3:p.pressure===1?2:p.pressure>=4&&s.medium!=='Aerial'?2:0;
 let medium=s.medium==='Aquatic'&&p.water<.3&&!pick(s,'amphibious')?3:s.medium==='Aerial'&&p.kind!=='gas'&&p.pressure<4?3:s.medium==='Land'&&p.water>.95&&!pick(s,'amphibious')?2:0;
 let radiation=Math.max(0,p.radiation-(pick(s,'radiation-resistant')||s.frame==='Lithic'?1:0)+(pick(s,'radiation-vulnerable')?1:0));
 if(pick(s,'radiotrophic'))radiation=0;
 let light=p.light&&p.light!==s.light?(pick(s,'photosynthetic')&&p.light==='Dim'?2:1):p.locked&&pick(s,'photosynthetic')?2:0;
 if(pick(s,'subterranean')){temperature=Math.max(0,temperature-1);radiation=Math.max(0,radiation-1);light=Math.max(0,light-1);}
 if(p.lethalUntil&&(e===undefined||p.lethalUntil>0))temperature=4;
 const axes=[temperature,gravity,chemistry,pressure,medium,radiation,light];const rating=clamp(Math.max(...axes),0,4);
 return {rating,name:RATINGS[rating],reason:['Temperature','Gravity','Atmospheric chemistry','Atmospheric pressure','Living medium','Radiation','Light'][axes.indexOf(rating)]+' limits habitability',axes};
}
export function capacity(p:Planet,s:Species,e:Empire){
 const r=habitability(p,s,e).rating;if(r===5)return 0;
 let base=p.kind==='habitat'?4:p.kind==='gas'?30:p.radius<.5?3:p.radius<.8?6:p.radius<1.25?10:p.radius<1.6?14:18;
 let mult=[1,.7,.4,pick(s,'hardy')?.25:.15,0][r]||0;
 if(has(e,'arcologies'))mult+=r===1?.1:r===2?.15:0;
 if(has(e,'sealed-undercities')&&r>=3)mult+=.1;
 if(has(e,'paraterraforming')&&r>=3)mult+=.1;
 if(p.kind==='habitat'&&has(e,'megastructure-engineering'))base*=2;
 return quant(base*mult*(1+(bonuses(e).capacity||0))*(p.id===e.capital?1.25:1)*(p.locked&&s.medium!=='Aquatic'&&s.medium!=='Aerial'&&!pick(s,'subterranean')?(p.pressure>=3||p.water>.9?.6:.4):1)*(p.buildings.includes('gaia')?1.25:1)*(p.buildings.includes('ecumenopolis')?1.5:1));
}
export function drive(e:Empire){return has(e,'field-theory')&&e.artifacts.includes('Field Drive')?5:has(e,'relativistic-drive')?4.5:has(e,'ramscoop')?3.75:has(e,'antimatter-beam-core')?3:has(e,'antimatter-catalysis')?2.25:has(e,'improved-fusion')?1.5:1;}
export function supply(e:Empire){return 6+(has(e,'extended-tankage')?2:0)+(has(e,'magnetic-sails')?3:0)+(has(e,'deep-hibernation')?4:0)+(has(e,'ramscoop')?2:0)+(bonuses(e).supply||0);}
export function telescope(e:Empire){return has(e,'telescope-swarm')?30:has(e,'gravitational-lens-telescope')?18:has(e,'interferometry')?12:8;}
export function detection(e:Empire,s:Species){return telescope(e)*(pick(s,'electrosense')?1.5:1)*(has(e,'quantum-sensors')?1.5:1);}
export function availableResearch(e:Empire){return TECHS.filter(t=>(t.tier===9||!has(e,t.id))&&(t.tier===1||TECHS.some(p=>p.field===t.field&&p.tier===t.tier-1&&has(e,p.id))));}
export function researchCost(e:Empire,s:Species,id:string){const t=TECHS.find(t=>t.id===id);if(!t)return Infinity;if(t.tier===9)return 2000+500*(e.repeatables?.[id]||0);const chosen=TECHS.some(p=>p.field===t.field&&p.tier===t.tier&&has(e,p.id));if(chosen&&pick(s,'rigid'))return Infinity;return t.cost*(chosen&&!pick(s,'creative')?2:1)*(pick(s,'genetic-plasticity')&&['genetic-survey','adaptation-ii','adaptation-iii'].includes(id)?.5:1);}
export function stability(g:GameState,p:Planet,e:Empire,s:Species){
 if(pick(s,'hive-mind'))return 75;
 const gov=government(speciesFor(g,e),e);const admin=(bonuses(e).admin||0)+gov.admin+(has(e,'administrative-ai')?2:0)+(has(e,'colonial-administration')?3:0)+(has(e,'bureaucratic-reform')?2:0);
 const r=habitability(p,s,e).rating;const cap=capacity(p,s,e);const warYears=g.relations.filter(r=>r.state==='War'&&(r.a===e.id||r.b===e.id)).reduce((n,r)=>n+Math.max(0,g.turn-r.since),0);
 return clamp(gov.stability+aptitude(s,'stability')*10+(s.frame==='Synthetic'?-10:0)+(pick(s,'lifespan-long')||pick(s,'lifespan-ancient')||s.frame==='Lithic'?10:0)+(e.tax==='Low'?10:e.tax==='High'?-10:0)-(r>=3&&!pick(s,'hardy')?(r===3?10:15)*(has(e,'closed-ecologies')?.5:1):0)-(p.population>cap*.95?5:0)-Math.max(0,colonies(g,e.id).length-admin)*2-Math.min(20,warYears*.5*(p.buildings.includes('media-network')?.5:1)*(speciesFor(g,e).government==='Autocracy'?.5:speciesFor(g,e).government==='Republic'?1.5:1))-Math.min(30,p.recentConquest??p.integration*2)+(p.buildings.includes('holo-commons')?10:0)+(p.buildings.includes('media-network')?10:0)+(e.credits<=0? -10:0)+(p.speciesId!==e.speciesId?(pick(speciesFor(g,e),'xenophobic')?-20:pick(speciesFor(g,e),'cosmopolitan')||speciesFor(g,e).government==='Federation'||has(e,'xeno-integration')?0:-5):pick(speciesFor(g,e),'xenophobic')?5:0)+(bonuses(e).stability||0)+(e.leaders.filter(l=>l.role==='Governor').length?5:0),0,100);
}
export function output(g:GameState,p:Planet,e:Empire){
 const s=g.species.find(s=>s.id===p.speciesId)||speciesFor(g,e);const gov=government(speciesFor(g,e),e);const st=stability(g,p,e,s);const shares=FOCUSES[p.focus];const working=p.population;
 const factor=(st>=75?1.1:st<10?.25:st<25?.5:st<50?.8:1)*(p.integration>0?.75:1)*(p.focus==='Growth'?.8:1);
 const linked=g.systems.find(x=>x.id===p.systemId)!.planets.filter(x=>x.owner===e.id&&x.id!==p.id);
 const link=Math.min(.25,linked.reduce((n,world)=>n+(.06*systemLink(p,world).share),0));const deposits=1+(bonuses(e).deposit||0);const localColonies=[p,...linked.filter(world=>!world.outpost)];const delivered={industry:0,research:0,credits:0};for(const outpost of linked.filter(world=>world.outpost&&world.deposit)){const best=[...localColonies].sort((a,b)=>systemLink(b,outpost).share-systemLink(a,outpost).share||(a.id<b.id?-1:1))[0];if(best.id!==p.id)continue;const share=systemLink(p,outpost).share;if(outpost.deposit==='metals')delivered.industry+=6*share;if(outpost.deposit==='rare')delivered.research+=4*share;if(outpost.deposit==='exotics')delivered.credits+=6*share;}
 const bi=(p.buildings.includes('fusion-plant')?1:0)+(p.buildings.includes('robotic-factory')?1:0)+(p.buildings.includes('nanoforge')?2:0);
 const br=(p.buildings.includes('research-institute')?1:0)+(p.buildings.includes('ai-lab')?1:0)+(p.buildings.includes('quantum-research-centre')?2:0);
 const bc=p.buildings.includes('commerce-exchange')?1:0;
 let industry=(working*shares[0]*(3+bi)+(p.buildings.includes('gardener-foundry')?10:0)+(p.buildings.includes('deep-mine')?p.deposit==='metals'?6:3:0)+delivered.industry+(p.buildings.includes('robotic-factory')?3:0)+(p.deposit==='metals'?6*deposits:0))*Math.max(.1,1+aptitude(s,'industry')*.2+gov.industry+link+(bonuses(e).industry||0)+(p.buildings.includes('antimatter-plant')?.2:0)+(p.buildings.includes('space-elevator')?.1:0)+(p.buildings.includes('dyson')?.5:0));
 let research=(working*shares[1]*(3+br)+(p.buildings.includes('gardener-archive')?5:0)+delivered.research+(p.buildings.includes('ai-lab')?3:0)+(p.deposit==='rare'?4*deposits:0))*Math.max(.1,1+aptitude(s,'research')*.2+gov.research+(bonuses(e).research||0));
 let commerce=(working*shares[2]*(3+bc)+delivered.credits+(p.deposit==='exotics'?6*deposits:0))*Math.max(.1,1+aptitude(s,'commerce')*.25+gov.commerce+link+(bonuses(e).commerce||0));
 const taxes=working*(e.tax==='Low'?.5:e.tax==='High'?1.5:1);
 const upkeep=(pick(s,'photosynthetic')&&(p.light?p.light!=='Dim':!g.systems.find(st=>st.id===p.systemId)!.spectral.startsWith('M'))?0:p.buildings.reduce((n,b)=>n+(BUILDINGS.find(x=>x.id===b)?.upkeep||0),0))*(pick(s,'cybernetic')?1.1:1)+(pick(s,'cybernetic')?p.population*.1:0);
 return {commerce:quant(commerce*factor),industry:quant(industry*factor),research:quant(research*factor),credits:quant(commerce*factor+taxes-upkeep),stability:st,cap:capacity(p,s,e),upkeep,workers:shares.map(x=>quant(x*working)),links:link};
}
export function designStats(d:ShipDesign,e?:Empire,s?:Species){
 const hull=HULLS.find(h=>h.id===d.hull)||HULLS[0];const weapon=WEAPONS.find(w=>w.id===d.weapon)||WEAPONS[0];const armourTier=e?has(e,'metamaterial-armour')?4:has(e,'diamondoid-armour')?3:has(e,'carbon-nanotube-armour')?2:has(e,'titanium-composite')?1:0:0;
 const mount=({Light:[1,1,1],Medium:[2.5,2.5,1.05],Heavy:[5,5.5,1.1],Spinal:[10,12,1.25]} as const)[d.mount||'Light'];const later=e?Math.max(0,...TECHS.filter(t=>t.field==='Energy & Weapons'&&has(e,t.id)).map(t=>t.tier))-weapon.tier:0;const mini=Math.max(.5,1-later*.1);const used=d.weapons*weapon.space*mount[0]*mini+d.armour+d.pd*2+(d.ecm?Math.max(1,hull.space*.05):0);const power=d.weapons*weapon.power*mount[0]+d.pd;const available=hull.space*(e&&has(e,'antimatter-reactor')?.85:e&&has(e,'high-output-reactor')?.65:.5);
 return {hull,weapon,used,power,available,valid:used<=hull.space&&power<=available&&d.weapons>=1&&d.armour>=0&&d.pd>=0&&(d.mount!=='Spinal'||hull.space>=35&&d.weapons===1),armour:d.armour*[4,6,9,13,17][armourTier]*(e?1+(bonuses(e).armour||0):1),hp:hull.hp*(e&&has(e,'monocrystal-hulls')?1.5:1),range:weapon.range*mount[2]*(e&&weapon.family==='laser'?1+(bonuses(e).laserRange||0):1),mountDamage:mount[1],acceleration:hull.acceleration*hull.space/(hull.space+d.armour)*(e?1+(bonuses(e).acceleration||0):1)*(s?1+(s.gravity>2.2?.4:s.gravity>1.3?.2:s.gravity<.6?-.2:0):1),cost:Math.ceil((hull.cost+d.weapons*weapon.space*mount[0]*3*(1+.1*weapon.tier)+d.armour*2+d.pd*6)*(s&&e?1+government(s,e).ships:1)),upkeep:hull.upkeep,damage:d.weapons*weapon.damage*mount[1]*weapon.rate*(e?1+(bonuses(e).weaponDamage||0):1)};
}
export function autoDesign(e:Empire,role='Line of battle',hullId='corvette'):ShipDesign{
 const hull=HULLS.find(h=>h.id===hullId)||HULLS[0];const family=role==='Missile boat'?'missile':role==='Brawler'?'particle':role==='Sniper'?'kinetic':'laser';
 const available=WEAPONS.filter(w=>w.family===family&&(w.tier===0||has(e,w.id))&&w.space<hull.space*.6);const w=available.at(-1)||WEAPONS[0];const maxPower=hull.space*(has(e,'antimatter-reactor')?.85:has(e,'high-output-reactor')?.65:.5);
 const count=Math.max(1,Math.min(Math.floor(hull.space*.55/w.space),w.power?Math.floor((maxPower-1)/w.power):99));const pd=has(e,'point-defence-laser')&&hull.space>=20?1:0;
 return {id:`${hullId}-${w.id}`,name:`${hull.name} ${role==='Line of battle'?'Line':role}`,hull:hullId,weapon:w.id,weapons:count,armour:Math.max(0,hull.space-count*w.space-pd*2),pd,ecm:false,strategy:role,rules:[]};
}
export function canBuild(b:typeof BUILDINGS[number],e:Empire,p:Planet){if(p.buildings.includes(b.id))return false;if(b.requires==='start')return true;return e.techs.some(id=>{const t=TECHS.find(t=>t.id===id);return !!t&&b.requires.toLowerCase().startsWith(t.name.toLowerCase().split(':')[0]);});}

export function systemLink(a:Planet,b:Planet){const separation=Math.abs(a.orbit-b.orbit);return separation<=.2?{name:'Strong',share:1,cost:50}:separation<=1?{name:'Good',share:.75,cost:75}:separation<=5?{name:'Weak',share:.4,cost:100}:{name:'Remote',share:.15,cost:130};}

export function fleetSpeed(g:GameState,f:Fleet){const e=g.empires[f.owner];if(f.ships.every(s=>s.kind==='impactor'))return 4.95;if(e.threat)return 3;let speed=drive(e);const from=g.systems.find(st=>st.id===(f.destination?f.origin:f.systemId));const civil=f.ships.every(ship=>ship.kind!=='warship');const boost=civil&&!!from?.planets.some(p=>p.owner===e.id&&p.buildings.includes('launch-laser'))||has(e,'beamed-power-network')&&!!from?.planets.some(p=>p.owner===e.id)||has(e,'strategic-redeployment')&&!!from?.planets.some(p=>p.owner===e.id)&&!!g.systems.find(st=>st.id===f.destination)?.planets.some(p=>p.owner===e.id);if(boost)speed=[1,1.5,2.25,3,3.75,4.5,5].find(n=>n>speed)||5;if(has(e,'field-theory')&&!e.artifacts.includes('Field Drive'))speed*=1.1;return Math.min(5,speed*(f.ships.every(ship=>ship.kind==='probe')?1.5:1));}
