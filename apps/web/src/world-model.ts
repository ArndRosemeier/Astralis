import * as THREE from 'three';
import type {Planet} from '../../../packages/sim/src/types';
import {seedHash} from '../../../packages/sim/src/math';
import {noiseGLSL,sphereVertex} from './title-shaders';
import {batchModel} from './title-model';
import {TIDAL_SUN,worldRotation} from './tidal-profile';
import {createWorldStructure} from './world-structures';
export function worldPalette(p:Planet){return p.kind==='gas'?['#d69d63','#6f4591']:p.kind==='ice'||p.temperature<200?['#9ac7e0','#36618b']:p.temperature>380?['#bc754a','#622d3f']:p.water>.35?['#478963','#0a5485']:['#c69c6c','#57425e'];}
const surfaceFragment=`uniform vec3 landColor,seaColor,sun;uniform float water,gas,ice,seed,settled,locked,frozen,wet,heatTransfer;varying vec3 vLocal,vWorld,vNormal;${noiseGLSL}
void main(){vec3 p=normalize(vLocal),n=normalize(vNormal),eye=normalize(cameraPosition-vWorld);float terrain=fbm(p*3.4+seed),fine=fbm(p*31.+seed);float ocean=1.-smoothstep(.36+water*.24,.375+water*.24,terrain);vec3 land=landColor*(.5+fine*.8);land=mix(land,vec3(.8,.9,.95),smoothstep(.79,.96,abs(p.y)+ice*.28));vec3 col=mix(land,seaColor*(.6+fine*.6),ocean);float band=sin(p.y*32.+fbm(p*7.+seed)*4.);col=mix(col,mix(landColor,seaColor,.45+band*.3),gas);
float light=mix(dot(n,sun),dot(p,sun),locked);float nightside=1.-smoothstep(-.23,.08,light+heatTransfer*.22);float twilight=1.-smoothstep(.03,.23,abs(light));float nightIce=max(frozen,nightside*wet*(1.-heatTransfer*.65));vec3 frost=vec3(.43,.66,.81)*(.7+fine*.55);vec3 dryRock=vec3(.48,.28,.19)*(.55+fine*.75);vec3 tidal=mix(dryRock,col,wet);tidal=mix(tidal,frost,nightIce);tidal+=vec3(.08,.13,.09)*twilight*wet*(1.-frozen);col=mix(col,tidal,locked*(1.-gas));col*=.16+max(0.,light)*.95;
float coast=1.-smoothstep(.0,.06,abs(terrain-(.375+water*.24)));float cityBelt=mix(coast,max(coast*.3,twilight*.85),locked);float cities=step(.76,noise3(p*130.+seed))*cityBelt*settled*(1.-gas);col+=vec3(1.,.64,.22)*cities*(.2+max(0.,-light)*2.);float rim=pow(1.-max(0.,dot(n,eye)),3.);col+=mix(vec3(.18,.5,.9),vec3(.6,.22,.7),gas)*rim*.22;gl_FragColor=vec4(col,1.);}`;
const cloudFragment=`uniform float seed,locked;uniform vec3 sun;varying vec3 vLocal,vWorld,vNormal;${noiseGLSL}void main(){float cloud=smoothstep(.53,.68,fbm(normalize(vLocal)*5.+seed));float light=.10+.90*max(0.,dot(normalize(mix(vNormal,vLocal,locked)),sun));gl_FragColor=vec4(vec3(.8,.9,1.)*light,cloud*.42);}`;
export function createWorld(p:Planet,color='#83f8d0'){
 if(p.kind==='habitat'||p.kind==='belt')return createWorldStructure(p,color);
 const root=new THREE.Group(),planet=new THREE.Group();root.add(planet);const [land,sea]=worldPalette(p),seed=seedHash(p.id)%97;
 const material=new THREE.ShaderMaterial({vertexShader:sphereVertex,fragmentShader:surfaceFragment,uniforms:{landColor:{value:new THREE.Color(land)},seaColor:{value:new THREE.Color(sea)},sun:{value:p.locked?new THREE.Vector3(...TIDAL_SUN).normalize():new THREE.Vector3(-.6,.5,1).normalize()},water:{value:p.water},gas:{value:p.kind==='gas'?1:0},ice:{value:p.kind==='ice'?1:0},seed:{value:seed},settled:{value:p.owner===null?0:1},locked:{value:p.locked?1:0},frozen:{value:p.kind==='ice'||p.temperature<220?1:0},wet:{value:p.water>.15&&p.temperature<=380&&p.pressure>.05?1:0},heatTransfer:{value:Math.min(1,Math.max(0,p.pressure)/3)}}});
 const surface=new THREE.Mesh(new THREE.SphereGeometry(1.55,64,48),material);planet.add(surface);
 const cloud=new THREE.Mesh(new THREE.SphereGeometry(1.565,48,32),new THREE.ShaderMaterial({vertexShader:sphereVertex,fragmentShader:cloudFragment,uniforms:{seed:{value:seed},sun:material.uniforms.sun,locked:material.uniforms.locked},transparent:true,depthWrite:false}));cloud.visible=p.kind!=='gas'&&p.pressure>.05;planet.add(cloud);
 const atmosphere=new THREE.Mesh(new THREE.SphereGeometry(1.60,48,32),new THREE.ShaderMaterial({vertexShader:sphereVertex,fragmentShader:'varying vec3 vWorld,vNormal;void main(){float rim=pow(1.-abs(dot(normalize(vNormal),normalize(cameraPosition-vWorld))),3.);gl_FragColor=vec4(.26,.65,1.,rim*.5);}',side:THREE.BackSide,transparent:true,depthWrite:false,blending:THREE.AdditiveBlending}));atmosphere.visible=p.kind==='gas'||p.pressure>.05;root.add(atmosphere);
 const city=new THREE.Group(),alloy=new THREE.MeshStandardMaterial({color:'#b9cedd',metalness:.6,roughness:.35}),glass=new THREE.MeshStandardMaterial({color,emissive:color,emissiveIntensity:.65,metalness:.3,roughness:.25});
 const districts=Math.min(24,Math.max(3,Math.round(p.population*1.4)+p.buildings.length));
 for(let i=0;i<districts;i++){
  const a=i*2.39996+seed*.1,latitude=.25+Math.sin(i*1.7)*.45,normal=new THREE.Vector3(Math.cos(a)*Math.cos(latitude),Math.sin(latitude),Math.sin(a)*Math.cos(latitude));
  const patch=new THREE.Group();patch.position.copy(normal.multiplyScalar(1.55));patch.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),normal.normalize());
  for(let j=0;j<5;j++){const h=.025+(i+j*7)%5*.014,tower=new THREE.Mesh(new THREE.BoxGeometry(.022,h,.025),j===0?glass:alloy);tower.position.set(Math.sin(j*2.4)*.055,h/2,Math.cos(j*2.4)*.055);patch.add(tower);}
  batchModel(patch);city.add(patch);
 }
 // Distinct facilities remain on the world after their construction scene.
 for(const [i,id] of p.buildings.slice(-5).entries()){const a=.65+i*.9,normal=new THREE.Vector3(Math.cos(a)*.88,.47,Math.sin(a)*.88).normalize(),facility=createFacility(id,color);facility.position.copy(normal.clone().multiplyScalar(1.55));facility.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),normal);facility.scale.setScalar(.075);city.add(facility);}
 city.visible=p.owner!==null;planet.add(city);
 const ring=new THREE.Mesh(new THREE.TorusGeometry(1.95,.012,6,96),new THREE.MeshBasicMaterial({color,transparent:true,opacity:.4}));ring.rotation.x=Math.PI/2+.23;ring.visible=p.buildings.includes('spaceport')||p.buildings.includes('space-elevator');root.add(ring);
 if(p.kind==='gas'){const belt=new THREE.Mesh(new THREE.RingGeometry(1.95,2.35,80),new THREE.MeshBasicMaterial({color:land,side:THREE.DoubleSide,transparent:true,opacity:.28}));belt.rotation.x=1.25;root.add(belt);}
 const update=(time:number,progress=1)=>{planet.rotation.y=worldRotation(p.locked,time);cloud.rotation.y=p.locked?0:time*.013;material.uniforms.settled.value=(p.owner===null?0:1)*progress;city.scale.setScalar(Math.max(.001,progress));ring.rotation.z=time*.025;};
 return {root,planet,city,update};
}
export function createFacility(id:string,color='#a8e9ff'){
 const root=new THREE.Group(),metal=new THREE.MeshStandardMaterial({color:'#819db5',metalness:.65,roughness:.35}),dark=new THREE.MeshStandardMaterial({color:'#152a49',metalness:.4,roughness:.4}),glow=new THREE.MeshStandardMaterial({color,emissive:color,emissiveIntensity:.7});
 const add=(geometry:THREE.BufferGeometry,material:THREE.Material,x:number,y:number,z:number)=>{const m=new THREE.Mesh(geometry,material);m.position.set(x,y,z);root.add(m);return m;};
 add(new THREE.CylinderGeometry(1.2,1.35,.15,8),metal,0,-.12,0);
 if(/spaceport|shipyard/.test(id)){for(const side of [-1,1]){add(new THREE.CylinderGeometry(.38,.42,.08,16),dark,side*.65,0,.1);add(new THREE.TorusGeometry(.33,.024,6,32),glow,side*.65,.06,.1).rotation.x=Math.PI/2;add(new THREE.BoxGeometry(.13,1.1,.13),metal,side*.9,.5,-.65);}add(new THREE.BoxGeometry(1.9,.15,.2),metal,0,1,-.65);for(let i=0;i<5;i++)add(new THREE.BoxGeometry(.15,.03,.22),glow,(i-2)*.3,1.08,-.65);}
 else if(/farm|hydro|bio|habitat|gaia/.test(id))for(const [x,z] of [[-.5,0],[.5,0],[0,.65]]){add(new THREE.SphereGeometry(.44,24,16,0,Math.PI*2,0,Math.PI/2),glow,x,0,z);add(new THREE.TorusGeometry(.44,.035,6,32),metal,x,.03,z).rotation.x=Math.PI/2;}
 else if(/lab|research|quantum|observ|intelligence/.test(id)){add(new THREE.CylinderGeometry(.4,.6,.8,8),metal,0,.35,0);const dish=add(new THREE.SphereGeometry(.8,24,12,0,Math.PI*2,0,.9),glow,0,.7,0);dish.rotation.z=.4;add(new THREE.CylinderGeometry(.035,.035,.9,8),metal,0,1.1,0);}
 else if(/solar|power|energy|dyson/.test(id)){add(new THREE.CylinderGeometry(.2,.3,.8,12),metal,0,.3,0);for(const side of [-1,1]){const panel=add(new THREE.BoxGeometry(.9,.04,1.2),dark,side*.75,.6,0);panel.rotation.z=side*.2;for(let j=0;j<5;j++)add(new THREE.BoxGeometry(.85,.012,.025),glow,side*.75,.73,-.45+j*.22);}}
 else{for(let i=0;i<4;i++){add(new THREE.BoxGeometry(.4,.45+i*.16,.65),metal,(i%2-.5)*.85,(.45+i*.16)/2,Math.floor(i/2)*.85-.4);for(let j=0;j<4;j++)add(new THREE.BoxGeometry(.31,.026,.018),glow,(i%2-.5)*.85,.15+j*.1,Math.floor(i/2)*.85-.06);}add(new THREE.CylinderGeometry(.12,.18,1.4,10),dark,.9,.6,-.4);}
 batchModel(root);const used=new Set<THREE.Material>();root.traverse(o=>{if(o instanceof THREE.Mesh)(Array.isArray(o.material)?o.material:[o.material]).forEach(m=>used.add(m));});for(const material of [metal,dark,glow])if(!used.has(material))material.dispose();return root;
}
