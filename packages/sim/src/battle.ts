import {bonuses} from './effects';
import type {BattleRecord,BattleShip,Fleet,GameState,Vec3} from './types';
import {clamp,random,quant} from './math';
import {aptitude,designStats,has,pick,speciesFor,WEAPONS} from './rules';
const length=(v:Vec3)=>Math.sqrt(v[0]*v[0]+v[1]*v[1]+v[2]*v[2]);
const sub=(a:Vec3,b:Vec3):Vec3=>[a[0]-b[0],a[1]-b[1],a[2]-b[2]];

export function simulateBattle(g:GameState,systemId:string,attacker:Fleet[],defender:Fleet[],seed:number):{record:BattleRecord;survivors:Map<string,{hp:number;withdrawn:boolean}>}{
 const rng={rng:seed};const units:BattleShip[]=[];const a=attacker[0].owner,b=defender[0].owner;const team=(owner:number)=>attacker.some(f=>f.owner===owner)?0:1;
 for(const [side,fleets] of [attacker,defender].entries()){
  let index=0;
  for(const f of fleets)for(const ship of f.ships){
   const empire=g.empires[f.owner];const species=speciesFor(g,empire);const d=g.designs[f.owner]?.find(d=>d.id===ship.designId);const stat=d?designStats(d,empire,species):null;
   const angle=index%7;const pos:Vec3=[side===0?-105:105,(angle-3)*12,Math.floor(index/7)*12-12];index++;
   units.push({id:ship.id,owner:f.owner,pos,vel:[0,0,0],heading:[side===0?1:-1,0,0],shield:empire.artifacts.includes('Veil Shield')?(stat?.hp||15)*.3:0,hp:ship.hp,maxHp:Math.max(ship.hp,stat?.hp||15),armour:stat?.armour||0,maxArmour:stat?.armour||0,strategy:f.strategy||d?.strategy||'Line of battle',weapon:stat?.weapon.id||'none',weapons:d?.weapons||0,range:stat?.range||0,damage:stat?.damage||0,cooldown:Math.floor(random(rng)*10),acceleration:stat?.acceleration||7,pd:d?.pd||0,ammo:6,heat:0,withdrawn:false,kind:ship.kind,rule:'Default settings'});
  }
 }
 const record:BattleRecord={id:`battle-${g.turn}-${systemId}-${seed}`,turn:g.turn,systemId,name:`Battle of ${g.systems.find(s=>s.id===systemId)?.name}`,attacker:a,defender:b,winner:null,duration:0,frames:[],losses:{[a]:0,[b]:0},events:[],damage:{laser:0,kinetic:0,missile:0,particle:0},seed};
 type Projectile={target:string;from:Vec3;to:Vec3;damage:number;family:string;arrival:number;owner:number};
 const projectiles:Projectile[]=[];const overrides=new Map<string,string>();const latticeTicks=new Map<string,number>();
 let tick=0;
 for(;tick<1800;tick++){
  const alive=units.filter(u=>u.hp>0&&!u.withdrawn);const armedA=alive.some(u=>team(u.owner)===0&&u.weapons>0),armedB=alive.some(u=>team(u.owner)===1&&u.weapons>0);
  if(!alive.some(u=>team(u.owner)===0)||!alive.some(u=>team(u.owner)===1)||!armedA&&!armedB){record.winner=armedA?a:armedB?b:null;break;}
  const shots:{from:Vec3;to:Vec3;kind:string}[]=[];
  const hits:{unit:BattleShip;damage:number;family:string}[]=[];
  for(let i=projectiles.length-1;i>=0;i--){const p=projectiles[i];if(p.arrival>tick)continue;projectiles.splice(i,1);const t=units.find(u=>u.id===p.target);if(!t||t.hp<=0||t.withdrawn)continue;
   let hit=true;
   if(p.family==='kinetic')hit=length(sub(t.pos,p.to))<10+t.maxHp*.04;
   if(p.family==='missile'){const pd=alive.filter(u=>team(u.owner)===team(t.owner)&&length(sub(u.pos,t.pos))<25).reduce((v,u)=>v+u.pd,0);hit=random(rng)>Math.min(.9,pd*.13);}
   if(hit)hits.push({unit:t,damage:p.damage,family:p.family});
  }
  for(const u of alive){
   const enemies=alive.filter(t=>team(t.owner)!==team(u.owner));if(!enemies.length)continue;
   const fleet=[...attacker,...defender].find(f=>f.ships.some(s=>s.id===u.id));const e=g.empires[u.owner];const species=speciesFor(g,e);const d=g.designs[u.owner]?.find(d=>d.id===fleet?.ships.find(s=>s.id===u.id)?.designId);
   let mode=overrides.get(u.id)||u.strategy;let target=enemies[0];
   const priority=(t:BattleShip)=>mode==='Sniper'? -t.maxHp:mode==='Interceptor'||mode==='Raider'?(t.kind==='warship'?1000:0)+length(sub(t.pos,u.pos)):length(sub(t.pos,u.pos));
   target=enemies.reduce((best,t)=>priority(t)<priority(best)?t:best,target);
   if(tick%(has(e,'predictive-tactics')?5:10)===0){overrides.delete(u.id);mode=u.strategy;u.rule='Default settings';for(const rule of d?.rules||[]){const active=rule.condition==='hull'?u.hp/u.maxHp*100<rule.threshold:rule.condition==='time'?tick/10>rule.threshold:rule.condition==='ammo'?u.ammo<rule.threshold:enemies.length>alive.filter(t=>team(t.owner)===team(u.owner)).length*rule.threshold;if(active){u.rule=`${rule.condition} ${rule.threshold}: ${rule.action}`;mode=rule.action==='withdraw'?'Withdraw':rule.action==='close'?'Brawler':rule.action==='kite'?'Skirmisher':rule.action==='evade'?'Evasive':'Line of battle';overrides.set(u.id,mode);break;}}}
   if((mode==='Skirmisher'&&u.hp<u.maxHp*.5)||(mode==='Missile boat'&&u.ammo<=0)||u.weapons===0)mode='Withdraw';
   if(mode==='Withdraw'){u.pos[0]+=u.owner===a?-2:2;if(Math.abs(u.pos[0])>220){u.withdrawn=true;record.events.push(`${u.id} withdrew at ${(tick/10).toFixed(1)} s (${u.rule}).`);}continue;}
   const vector=sub(target.pos,u.pos);const dist=Math.max(.01,length(vector));const desired=mode==='Brawler'?u.range*.35:mode==='Sniper'||mode==='Missile boat'?u.range*.9:mode==='Skirmisher'?u.range*.8:mode==='Picket / defender'?u.range*.8:u.range*.6;
   const desiredHeading=vector.map(v=>v/dist) as Vec3;for(let c=0;c<3;c++)u.heading[c]+=(desiredHeading[c]-u.heading[c])*.07*(1+(bonuses(e).turnRate||0));const headingLength=Math.max(.00001,length(u.heading));u.heading=u.heading.map(v=>v/headingLength) as Vec3;const direction=dist>desired?1:dist<desired*.75?-1:0;
   for(let c=0;c<3;c++){u.vel[c]=clamp(u.vel[c]+vector[c]/dist*u.acceleration*.1*direction,-16,16)*.985;u.pos[c]=quant(u.pos[c]+u.vel[c]*.1);}
   const weapon=WEAPONS.find(w=>w.id===u.weapon);if(!weapon)continue;
   u.heat=Math.max(0,u.heat-(d?designStats(d,e,species).hull.space:10)*.04*(1+(bonuses(e).radiators||0)));
   if(e.artifacts.includes('Veil Shield'))u.shield=Math.min(u.maxHp*.3,u.shield+u.maxHp*.002);if(u.cooldown>0){u.cooldown--;continue;}if(dist>u.range||g.options.heat&&u.heat>80||d?.mount==='Spinal'&&u.heading.reduce((n,v,c)=>n+v*desiredHeading[c],0)<.984807753)continue;if(weapon.family==='missile'&&u.ammo<=0)continue;
   u.cooldown=Math.ceil(10/weapon.rate)*(u.reactorDamage?2:1);if(weapon.family==='missile')u.ammo--;u.heat+=weapon.power*u.weapons;
   const experience=fleet?.ships.find(ship=>ship.id===u.id)?.experience||0;const accuracy=clamp(.85-(u.sensorDamage?.3:0)+(experience>=6?.15:experience>=3?.1:experience>=1?.05:0)+aptitude(species,'piloting')*.1+(pick(species,'electrosense')?.05:0)-(pick(speciesFor(g,g.empires[target.owner]),'electrosense')?.05:0)+(has(e,'battle-computer-iv')?.3:has(e,'battle-computer-iii')?.2:has(e,'targeting-computers')?.1:0)-(mode==='Skirmisher'?.05:0)-(g.designs[target.owner]?.find(d=>d.id===[...attacker,...defender].flatMap(f=>f.ships).find(s=>s.id===target.id)?.designId)?.ecm?(has(g.empires[target.owner],'advanced-ecm')?.35:.2):0),.3,.99);
   let damage=weapon.damage*u.weapons*(d?designStats(d,e,species).mountDamage:1)*(1+(bonuses(e).weaponDamage||0))*(weapon.family==='laser'?clamp(1-(dist/u.range-.5)*1.2,.4,1):1);
   if(has(e,'droplet-radiators')&&weapon.family==='laser')damage*=1.1;
   if(random(rng)<accuracy){if(weapon.family==='laser'||weapon.family==='particle')hits.push({unit:target,damage,family:weapon.family});else projectiles.push({target:target.id,from:[...u.pos],to:[...target.pos],damage,family:weapon.family,arrival:tick+Math.max(1,Math.ceil(dist/(weapon.family==='missile'?25:10)*10)),owner:u.owner});}
   if(tick%20<5||weapon.family==='missile')shots.push({from:[...u.pos],to:[...target.pos],kind:weapon.family});
  }
  for(const hit of hits){let damage=hit.damage;const targetEmpire=g.empires[hit.unit.owner];if(targetEmpire.artifacts.includes('Lattice Armour')&&latticeTicks.get(hit.unit.id)!==Math.floor(tick/10)){latticeTicks.set(hit.unit.id,Math.floor(tick/10));continue;}const shieldAbsorb=Math.min(hit.unit.shield,damage);hit.unit.shield-=shieldAbsorb;damage-=shieldAbsorb;if(has(targetEmpire,'reflective-armour')&&hit.family==='laser')damage*=.7;if(has(targetEmpire,'whipple-shielding')&&['missile','kinetic'].includes(hit.family))damage*=.75;if(has(targetEmpire,'magnetic-deflectors')&&hit.family==='particle')damage*=.6;const bypass=hit.family==='particle'?.5:0;const absorbed=Math.min(hit.unit.armour,damage*(1-bypass));hit.unit.armour-=absorbed;hit.unit.hp=quant(Math.max(0,hit.unit.hp-(damage-absorbed)));if(hit.unit.armour<=0&&hit.unit.hp>0&&random(rng)<.06){const subsystem=Math.floor(random(rng)*4);if(subsystem===0)hit.unit.acceleration=0;else if(subsystem===1)hit.unit.weapons=Math.max(0,hit.unit.weapons-1);else if(subsystem===2)hit.unit.sensorDamage=true;else hit.unit.reactorDamage=true;record.events.push(hit.unit.id+' suffered '+['drive','weapon','sensor','reactor'][subsystem]+' damage at '+(tick/10).toFixed(1)+' s.');}record.damage[hit.family]=quant((record.damage[hit.family]||0)+damage);}
  if(tick%20===0||shots.length&&tick%10===0)record.frames.push({tick,ships:units.filter(u=>u.hp>0&&!u.withdrawn).map(u=>({id:u.id,owner:u.owner,pos:[...u.pos],heading:[...u.heading],hp:quant(u.hp/u.maxHp),heat:quant(u.heat),rule:u.rule})),shots});
 }
 record.duration=tick/10;
 for(const u of units)if(u.hp<=0)record.losses[u.owner]=(record.losses[u.owner]||0)+1;
 record.events.unshift(`${record.losses[a]||0} attacker and ${record.losses[b]||0} defender ships lost.`,`${Object.entries(record.damage).sort((a,b)=>b[1]-a[1])[0]?.[0]||'No'} weapons inflicted the most damage.`);
 record.frames.push({tick,ships:units.filter(u=>u.hp>0&&!u.withdrawn).map(u=>({id:u.id,owner:u.owner,pos:[...u.pos],heading:[...u.heading],hp:u.hp/u.maxHp,heat:u.heat,rule:u.rule})),shots:[]});
 return {record,survivors:new Map(units.map(u=>[u.id,{hp:u.hp,withdrawn:u.withdrawn}]))};
}
