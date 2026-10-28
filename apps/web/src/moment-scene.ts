import {createTitleSun} from './title-sun';
import * as THREE from 'three';
import type {GameState} from '../../../packages/sim/src/types';
import type {Moment} from './moments';
import {createWorld,createFacility} from './world-model';
import {createShipModel,shipAppearance} from './ship-model';
import {createStation} from './title-orbit';
const ease=(v:number)=>{const t=THREE.MathUtils.clamp(v,0,1);return t*t*(3-2*t);};
const line=(points:THREE.Vector3[],color:string,opacity=.5)=>new THREE.Line(new THREE.BufferGeometry().setFromPoints(points),new THREE.LineBasicMaterial({color,transparent:true,opacity}));
function orbit(radius:number,color:string){return line(Array.from({length:97},(_,i)=>new THREE.Vector3(Math.cos(i/96*Math.PI*2)*radius,0,Math.sin(i/96*Math.PI*2)*radius)),color,.3);}
/** Every vignette has a distinct physical action; its final pose is also the reduced-motion view. */
export function buildMomentScene(moment:Moment,game:GameState){
 const root=new THREE.Group(),color=moment.color,updates:((time:number,progress:number)=>void)[]=[];
 const metal=new THREE.MeshStandardMaterial({color:'#b6cadb',metalness:.7,roughness:.3}),dark=new THREE.MeshStandardMaterial({color:'#243653',metalness:.5,roughness:.35}),glow=new THREE.MeshStandardMaterial({color,emissive:color,emissiveIntensity:1,metalness:.25,roughness:.25});
 const add=(geometry:THREE.BufferGeometry,material:THREE.Material,x=0,y=0,z=0,parent:THREE.Object3D=root)=>{const m=new THREE.Mesh(geometry,material);m.position.set(x,y,z);parent.add(m);return m;};
 const halo=new THREE.Mesh(new THREE.TorusGeometry(2.25,.013,6,128),new THREE.MeshBasicMaterial({color,transparent:true,opacity:.4}));halo.rotation.x=.15;halo.position.z=-1.5;halo.visible=!['discovery','arrival'].includes(moment.kind);root.add(halo);updates.push((t,p)=>{halo.scale.setScalar(.8+ease(p)*.45);(halo.material as THREE.MeshBasicMaterial).opacity=.3*(1-ease((p-.75)*4))+.08;});
 if(moment.planet){
  const world=createWorld(moment.planet,color);world.root.position.set(.15,-.55,-.5);world.root.scale.setScalar(1.25);root.add(world.root);
  updates.push((t,p)=>world.update(t*.3,moment.kind==='colony'||moment.kind==='outpost'?ease((p-.2)/.65):1));
  if(moment.kind==='colony'||moment.kind==='outpost'){
   const ship=createShipModel({kind:moment.kind==='outpost'?'outpost':'colony',color});ship.scale.setScalar(.85);root.add(ship);const settlement=createFacility('habitat',color);settlement.scale.setScalar(.001);settlement.position.set(-.4,-.12,1.38);root.add(settlement);
   const descent=new THREE.CubicBezierCurve3(new THREE.Vector3(-3.8,2.5,3),new THREE.Vector3(-2,2,2.9),new THREE.Vector3(-.6,.8,2),new THREE.Vector3(-.4,.28,1.48));
   const beacon=new THREE.Mesh(new THREE.RingGeometry(.28,.3,48),new THREE.MeshBasicMaterial({color,transparent:true,opacity:.7,side:THREE.DoubleSide}));beacon.rotation.x=-Math.PI/2;beacon.position.copy(settlement.position).add(new THREE.Vector3(0,.03,0));root.add(beacon);
   updates.push((t,p)=>{const landing=ease(p/.58);ship.position.copy(descent.getPoint(landing));ship.rotation.set(.2,1.2-landing*.8,-.3+landing*.3);ship.scale.setScalar(.85*(1-ease((p-.55)*5)*.65));settlement.scale.setScalar(.001+.48*ease((p-.42)*2.5));beacon.scale.setScalar(.5+ease((p-.4)*2)*4);(beacon.material as THREE.MeshBasicMaterial).opacity=.7*(1-ease((p-.6)*2.5));});
  }else if(moment.kind==='construction'||moment.kind==='terraform'){
   const facility=createFacility(moment.buildingId||'hydroponic-farm',color);facility.position.set(-.8,-.4,1.6);root.add(facility);const scan=add(new THREE.TorusGeometry(1.05,.02,8,64),glow,-.8,0,1.6);scan.rotation.x=Math.PI/2;
   updates.push((t,p)=>{facility.scale.setScalar(.001+.8*ease(p*.95));facility.rotation.y=.4+t*.05;scan.position.y=-.4+ease(p)*1.5;scan.scale.setScalar(1-ease((p-.75)*4));});
  }else if(moment.kind==='growth'){
   const nodes=new THREE.Group();root.add(nodes);for(let i=0;i<18;i++){const a=i*2.4,n=add(new THREE.SphereGeometry(.025,8,6),glow,Math.cos(a)*(.4+i*.045),Math.sin(a)*.6-.3,1.25+Math.cos(a)*.2,nodes);updates.push((t,p)=>n.scale.setScalar(ease((p-i/30)*3)));}
  }else if(moment.kind==='setback'){updates.push((t,p)=>world.root.rotation.z=Math.sin(t*.4)*.02);}
 }else if(moment.kind==='discovery'||moment.kind==='arrival'){
  const system=moment.system,star=add(new THREE.SphereGeometry(.46,40,24),new THREE.MeshBasicMaterial({color:'#fff9e6',toneMapped:false}));
  const sun=createTitleSun({name:'Survey sun',core:'#fff2c5',corona:system?.spectral.startsWith('M')?'#ff865e':'#ffbd6f'});sun.mesh.scale.setScalar(3.6);sun.mesh.rotation.x=-.48;root.add(sun.mesh);updates.push((t,p)=>{sun.update(t);sun.mesh.scale.setScalar(3.6*(.2+.8*ease(p*3)));});
  const worlds=(system?.planets||[]).slice(0,8);worlds.forEach((planet,i)=>{const ring=orbit(1.15+i*.32,color);root.add(ring);const world=createWorld(planet,color);world.root.scale.setScalar(.10+Math.min(.13,planet.radius*.025));root.add(world.root);updates.push((t,p)=>{const a=i*2.4+t*.07/(1+i*.2);world.root.position.set(Math.cos(a)*(1.15+i*.32),Math.sin(a*.7)*.15,Math.sin(a)*(1.15+i*.32));world.root.visible=p>.12+i*.075;world.update(t);ring.scale.setScalar(ease((p-i*.07)*2));});});
  root.rotation.x=.35;const sweep=add(new THREE.TorusGeometry(.8,.003,6,96),new THREE.MeshBasicMaterial({color,transparent:true,opacity:.4,blending:THREE.AdditiveBlending,depthWrite:false}));sweep.rotation.x=Math.PI/2;updates.push((t,p)=>{sweep.scale.setScalar(.5+ease(p)*3.7);(sweep.material as THREE.MeshBasicMaterial).opacity=.45*(1-ease((p-.35)*1.8));sweep.visible=p<.9;star.scale.setScalar(.2+.8*ease(p*3));});
 }else if(moment.kind==='launch'||moment.kind==='repair'||moment.kind==='victory'&&moment.ship){
  const ship=createShipModel(moment.ship?shipAppearance(game,moment.owner,moment.ship):{kind:'warship',color});ship.scale.setScalar(3.8);root.add(ship);const station=createStation();station.scale.setScalar(.8);station.position.set(0,0,-2);root.add(station);
  const engines=new THREE.Group();root.add(engines);for(const side of [-1,1]){const plume=add(new THREE.ConeGeometry(.12,1.6,16,1,true),new THREE.MeshBasicMaterial({color:'#87ddff',transparent:true,opacity:.5,blending:THREE.AdditiveBlending,side:THREE.DoubleSide,depthWrite:false}),side*.5,0,0,engines);plume.rotation.x=-Math.PI/2;}
  if(moment.kind==='repair')for(const side of [-1,1]){const beam=add(new THREE.CylinderGeometry(.025,.025,2.8,8),new THREE.MeshBasicMaterial({color:'#9dfbd6',transparent:true,opacity:.4}),side*1.4,0,0);beam.rotation.z=side*.6;updates.push((t,p)=>{beam.position.z=-1+ease(p)*2;beam.visible=p<.9;});}
  updates.push((t,p)=>{ship.position.set(Math.sin(p*.9)*.45,Math.sin(t*.4)*.08,-1.4+ease(p)*2.7);ship.rotation.set(.18,.35+ease(p)*.35,-.1);station.rotation.z=t*.09;engines.position.copy(ship.position).add(new THREE.Vector3(-.9,0,-1.35));engines.visible=p>.25&&moment.kind!=='repair';engines.scale.setScalar(.4+ease(p)*.7);});
 }else if(moment.kind==='research'){
  const assembly=new THREE.Group();root.add(assembly);const field=moment.field||'Computing';
  if(field==='Propulsion'){
   const ship=createShipModel({kind:'warship',color});ship.scale.setScalar(2.7);assembly.add(ship);ship.rotation.y=Math.PI/2;
   for(let i=0;i<5;i++){const ring=add(new THREE.TorusGeometry(.5+i*.14,.035,10,64),i%2?metal:glow,-1.5+i*.36,0,0,assembly);ring.rotation.y=Math.PI/2;updates.push((t,p)=>{ring.position.x=-2.5+i*.36+ease(p)*.8;ring.scale.setScalar(.1+ease(p-i*.07));});}
   const thrust=add(new THREE.ConeGeometry(.5,3.3,32,1,true),new THREE.MeshBasicMaterial({color,transparent:true,opacity:.25,blending:THREE.AdditiveBlending,side:THREE.DoubleSide}),-2,0,0,assembly);thrust.rotation.z=Math.PI/2;updates.push((t,p)=>thrust.scale.setScalar(ease((p-.4)*2)));
  }else if(field==='Life Sciences'){
   for(let i=0;i<24;i++){const y=(i-12)*.14,a=i*.55;const left=new THREE.Vector3(Math.cos(a)*.7,y,Math.sin(a)*.7),right=left.clone().multiply(new THREE.Vector3(-1,1,-1));const node=add(new THREE.SphereGeometry(.105,12,8),i%2?glow:metal,left.x,left.y,left.z,assembly),other=add(new THREE.SphereGeometry(.105,12,8),metal,right.x,right.y,right.z,assembly);const rung=line([left,right],color);assembly.add(rung);updates.push((t,p)=>{node.visible=other.visible=rung.visible=p>i/32;});}
  }else if(field==='Materials'){
   for(let i=0;i<18;i++){const a=i*2.4,y=(i%6-2.5)*.42,plate=add(new THREE.BoxGeometry(.75,.33,.12),i%4===0?glow:metal,Math.cos(a),y,Math.sin(a),assembly);updates.push((t,p)=>{const k=1+(1-ease(p-i*.025))*2;plate.position.set(Math.cos(a)*k,y,Math.sin(a)*k);plate.rotation.y=-a;});}
  }else if(field==='Energy & Weapons'){
   const core=add(new THREE.IcosahedronGeometry(.55,1),glow,0,0,0,assembly);for(let i=0;i<3;i++){const ring=add(new THREE.TorusGeometry(1.1+i*.2,.055,10,80),metal,0,0,0,assembly);ring.rotation.set(i*.9,i*.8,.4);updates.push((t,p)=>{ring.rotation.z=t*(i%2?-.3:.3);ring.scale.setScalar(.4+ease(p)*.6);});}updates.push((t,p)=>{core.rotation.y=t*.4;core.scale.setScalar(.15+ease(p)*1.1);});
  }else{
   const nodes:THREE.Vector3[]=[];for(let i=0;i<24;i++){const a=i*2.4,r=.65+(i%3)*.45,pos=new THREE.Vector3(Math.cos(a)*r,(i%7-3)*.4,Math.sin(a)*r);nodes.push(pos);const node=add(field==='Society'?new THREE.SphereGeometry(.12,12,8):new THREE.BoxGeometry(.18,.18,.18),i%3?metal:glow,pos.x,pos.y,pos.z,assembly);updates.push((t,p)=>{node.scale.setScalar(ease((p-i*.025)*3));});if(i){const link=line([nodes[Math.floor((i-1)/2)],pos],color,.6);assembly.add(link);updates.push((t,p)=>link.visible=p>i*.025);}}
  }
  updates.push((t,p)=>{assembly.rotation.y=t*.14;assembly.rotation.z=.12;});
 }else if(moment.kind==='contact'||moment.kind==='treaty'){
  for(const side of [-1,1]){const globe=add(new THREE.IcosahedronGeometry(.8,2),side===-1?metal:glow,side*1.7,0,0);const ring=add(new THREE.TorusGeometry(1,.015,8,64),glow,side*1.7,0,0);updates.push((t,p)=>{globe.rotation.y=side*t*.2;ring.rotation.y=side*.4;globe.scale.setScalar(.5+ease(p)*.5);});}
  for(let i=0;i<20;i++){const packet=add(new THREE.SphereGeometry(.035,8,6),glow);updates.push((t,p)=>{const k=(t*.18+i/20)%1;packet.position.set(-1.5+k*3,Math.sin(k*Math.PI)*.45*(i%2?1:-1),0);packet.visible=p>.25;});}
 }else if(moment.kind==='leader'){
  const medal=new THREE.Group();root.add(medal);medal.rotation.x=Math.PI/2;
  add(new THREE.CylinderGeometry(.95,.95,.15,12),metal,0,0,0,medal);add(new THREE.CylinderGeometry(.79,.79,.18,12),dark,0,0,0,medal);
  for(let i=0;i<6;i++){const a=i*Math.PI/3,ray=add(new THREE.ConeGeometry(.15,.7,4),glow,Math.cos(a)*.25,.14,Math.sin(a)*.25,medal);ray.rotation.set(Math.PI/2,0,-a+Math.PI/2);}
  for(let i=0;i<Math.min(8,moment.value||1);i++)add(new THREE.OctahedronGeometry(.11),glow,(i-(Math.min(8,moment.value||1)-1)/2)*.3,-1.35,.2);
  updates.push((t,p)=>{medal.rotation.z=Math.sin(t*.2)*.16;medal.scale.setScalar(.3+ease(p)*.8);});
 }else if(moment.kind==='victory'){
  for(let i=0;i<5;i++){const ship=createShipModel({kind:'warship',color:game.empires[moment.owner].color});root.add(ship);ship.scale.setScalar(i===0?2.5:1.2);const side=i%2?1:-1;updates.push((t,p)=>{ship.position.set(i===0?0:side*(.9+Math.ceil(i/2)*.55),i===0?.25:-.3,-3+ease(p)*3-Math.ceil(i/2)*.7);ship.rotation.set(.2,.3,side*.07);});}
 }else if(moment.kind==='economy'){
  for(let i=0;i<24;i++){const bar=add(new THREE.BoxGeometry(.22,.15+(i%5)*.18,.22),i%3?metal:glow,(i%8-3.5)*.32,0,(Math.floor(i/8)-1)*.42);updates.push((t,p)=>{bar.scale.y=.01+ease((p-i*.02)*2);bar.position.y=bar.scale.y*(.15+(i%5)*.18)/2-.7;});}root.rotation.y=.45;
 }else{
  const relic=new THREE.Group();root.add(relic);const core=add(new THREE.OctahedronGeometry(.8,0),glow,0,0,0,relic);for(let i=0;i<3;i++){const ring=add(new THREE.TorusGeometry(1.4+i*.2,.035,8,80),metal,0,0,0,relic);ring.rotation.set(.8*i,.5*i,.2);updates.push((t,p)=>ring.rotation.z=t*.17*(i%2?1:-1));}updates.push((t,p)=>{core.rotation.y=t*.25;relic.position.y=Math.sin(t*.7)*.1;relic.scale.setScalar(.2+ease(p)*.8);});
 }
 // A quiet field of drifting motes gives every completed scene depth, without flashing.
 const points:number[]=[];for(let i=0;i<70;i++){const a=i*2.39996,r=1.5+(i%17)*.18;points.push(Math.cos(a)*r,Math.sin(a)*r,Math.sin(i*3.1)*2-2);}
 const particles=new THREE.Points(new THREE.BufferGeometry().setAttribute('position',new THREE.Float32BufferAttribute(points,3)),new THREE.PointsMaterial({color,size:.025,transparent:true,opacity:.55,depthWrite:false}));root.add(particles);updates.push((t,p)=>{particles.rotation.z=t*.025;particles.scale.setScalar(.65+ease(p)*.35);});
 // Materials unused by a particular vignette are not owned by the scene.
 const used=new Set<THREE.Material>();root.traverse(o=>{if(o instanceof THREE.Mesh)(Array.isArray(o.material)?o.material:[o.material]).forEach(m=>used.add(m));});for(const material of [metal,dark,glow])if(!used.has(material))material.dispose();
 return {root,update:(time:number,progress:number)=>updates.forEach(update=>update(time,progress))};
}
