import {useEffect,useRef,useState} from 'react';
import * as THREE from 'three';
import {Focus,Pause,Play,Radar,Rocket} from 'lucide-react';
import {asset,effect} from './lib';
import {sphereVertex,planetFragment,cloudsFragment,atmosphereFragment,moonFragment,starVertex,starFragment} from './title-shaders';
import type {TitleNebula} from './title-nebula';
import {createStation} from './title-orbit';

const transmissions=['Probe reports: space is enormous. Requesting a longer lunch break.','Tranquility relay acquired. The night shift sends its regards.','Ocean survey complete. More blue than the committee anticipated.','Orbital traffic control requests that we stop waving at the satellites.','Gardener signal detected beneath the northern ice. Expedition recommended.'];
const views=['Homeworld','Lunar approach','Orbital shipyard'];

export function TitleScene({motion,quality,nebula}:{motion:boolean;quality:string;nebula:TitleNebula}){
 const host=useRef<HTMLDivElement>(null),launch=useRef(0),latest=useRef({motion,view:0,paused:false});
 const [view,setView]=useState(0),[paused,setPaused]=useState(false),[probes,setProbes]=useState(0),[failed,setFailed]=useState(false);
 latest.current={motion,view,paused};
 useEffect(()=>{
  const container=host.current!;let renderer:THREE.WebGLRenderer;
  try{renderer=new THREE.WebGLRenderer({antialias:quality!=='Low',alpha:true,powerPreference:'high-performance'});}catch{setFailed(true);return;}
  setFailed(false);renderer.setPixelRatio(Math.min(devicePixelRatio,quality==='Low'?1:1.75));renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.15;renderer.setClearColor('#030714',0);container.append(renderer.domElement);
  const scene=new THREE.Scene(),camera=new THREE.PerspectiveCamera(42,1,.1,180),root=new THREE.Group();root.position.set(3.5,.1,0);scene.add(root);
  const sun=new THREE.Vector3(-.8,.35,.45).normalize();const light=new THREE.DirectionalLight('#fff0dc',3.4);light.position.copy(sun.clone().multiplyScalar(40));scene.add(light,new THREE.AmbientLight('#557ab0',.3));
  const geometry=new THREE.SphereGeometry(3.25,quality==='Low'?64:128,quality==='Low'?48:96);
  const shader=(fragmentShader:string,extra:THREE.ShaderMaterialParameters={})=>new THREE.ShaderMaterial({vertexShader:sphereVertex,fragmentShader,uniforms:{sun:{value:sun}},...extra});
  const planet=new THREE.Mesh(geometry,shader(planetFragment));planet.rotation.set(.15,.8,-.18);root.add(planet);
  const clouds=new THREE.Mesh(geometry,shader(cloudsFragment,{transparent:true,depthWrite:false}));clouds.scale.setScalar(1.012);clouds.rotation.copy(planet.rotation);root.add(clouds);
  const air=new THREE.Mesh(geometry,shader(atmosphereFragment,{transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,side:THREE.BackSide}));air.scale.setScalar(1.035);root.add(air);
  const moon=new THREE.Mesh(new THREE.SphereGeometry(.73,48,40),shader(moonFragment));root.add(moon);
  const station=createStation(),relay=createStation();relay.scale.multiplyScalar(.43);root.add(station,relay);
  const moonPosition=(t:number)=>new THREE.Vector3(Math.cos(t)*6.5,Math.sin(t)*1.8,Math.sin(t)*5.2);
  const stationPosition=(t:number)=>new THREE.Vector3(Math.cos(t)*4.8,Math.sin(t)*2.5,Math.sin(t)*3.7);
  const starPositions:number[]=[],starColors:number[]=[],starSizes:number[]=[];let seed=937;const random=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;};
  for(let i=0;i<(quality==='Low'?900:2200);i++){const p=new THREE.Vector3(random()*2-1,random()*2-1,random()*2-1).normalize().multiplyScalar(65+random()*30);starPositions.push(p.x,p.y,p.z);const c=new THREE.Color().setHSL(random()<.25?.1:.58,.12+random()*.2,.72+random()*.26);starColors.push(c.r,c.g,c.b);starSizes.push(random()<.08?7+random()*4:2.5+random()*2.5);}
  const starGeometry=new THREE.BufferGeometry();starGeometry.setAttribute('position',new THREE.Float32BufferAttribute(starPositions,3));starGeometry.setAttribute('color',new THREE.Float32BufferAttribute(starColors,3));starGeometry.setAttribute('starSize',new THREE.Float32BufferAttribute(starSizes,1));scene.add(new THREE.Points(starGeometry,new THREE.ShaderMaterial({vertexShader:starVertex,fragmentShader:starFragment,uniforms:{pixelRatio:{value:renderer.getPixelRatio()}},vertexColors:true,transparent:true,depthWrite:false,blending:THREE.AdditiveBlending})));
  const probe=new THREE.Group();probe.add(new THREE.Mesh(new THREE.OctahedronGeometry(.065),new THREE.MeshStandardMaterial({color:'#e0c791',metalness:.6,roughness:.4})));probe.add(new THREE.Mesh(new THREE.BoxGeometry(.38,.1,.012),new THREE.MeshStandardMaterial({color:'#2875c2',metalness:.55,roughness:.35})));root.add(probe);probe.visible=false;
  const trailGeometry=new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(),new THREE.Vector3()]);const trail=new THREE.Line(trailGeometry,new THREE.LineBasicMaterial({color:'#8ef4ff',transparent:true,opacity:.65}));root.add(trail);trail.visible=false;
  const pointer=new THREE.Vector2();const move=(event:PointerEvent)=>{const r=container.getBoundingClientRect();pointer.set((event.clientX-r.left)/r.width-.5,(event.clientY-r.top)/r.height-.5);};window.addEventListener('pointermove',move);const resetPointer=()=>pointer.set(0,0);window.addEventListener('blur',resetPointer);
  let width=1,height=1,frame=0,last=0,time=0,lastDraw=0,probeStart=-100,seenLaunch=0,lastView=-1;
  const cameraTarget=new THREE.Vector3(),lookTarget=new THREE.Vector3(),currentLook=new THREE.Vector3();
  const resize=new ResizeObserver(()=>{width=container.clientWidth;height=container.clientHeight;renderer.setSize(width,height);camera.aspect=width/Math.max(height,1);camera.updateProjectionMatrix();lastDraw=0;});resize.observe(container);
  const draw=(now:number)=>{
   frame=requestAnimationFrame(draw);const p=latest.current,animate=p.motion&&!p.paused&&!document.hidden,delta=Math.min((now-last)/1000||0,.05);last=now;if(document.hidden)return;if(animate)time+=delta;
   const viewChanged=lastView!==p.view;lastView=p.view;if(!animate&&!viewChanged&&seenLaunch===launch.current&&now-lastDraw<250)return;lastDraw=now;
   planet.rotation.y=.8+time*.025;clouds.rotation.y=.8+time*.029;moon.position.copy(moonPosition(time*.022+1.9));moon.rotation.y=time*.035;station.position.copy(stationPosition(time*.055+.4));station.rotation.z=.3+time*.06;relay.position.copy(stationPosition(time*.04+3.4));relay.rotation.y=time*.07;
   const mobile=width<700;root.position.set(mobile?1.4:3.5,mobile?2.5:.1,0);
   if(p.view===0){cameraTarget.set(0,.7,mobile?23:18.5);lookTarget.set(0,0,0);}else if(p.view===1){cameraTarget.copy(root.position).add(moon.position).add(new THREE.Vector3(-2.4,1.3,4.7));lookTarget.copy(root.position).add(moon.position.clone().multiplyScalar(.55));}else{cameraTarget.copy(root.position).add(station.position).add(new THREE.Vector3(-1.4,.9,4));lookTarget.copy(root.position).add(station.position.clone().multiplyScalar(.8));}
   if(animate){cameraTarget.x+=pointer.x*.35;cameraTarget.y-=pointer.y*.2;camera.position.lerp(cameraTarget,.025);currentLook.lerp(lookTarget,.025);}else{camera.position.copy(cameraTarget);currentLook.copy(lookTarget);}camera.lookAt(currentLook);
   if(seenLaunch!==launch.current){seenLaunch=launch.current;probeStart=time;}const age=time-probeStart;probe.visible=trail.visible=age<9&&age>=0;
   if(probe.visible){const start=stationPosition(.4+time*.055),destination=new THREE.Vector3(-4,5,6),t=Math.min(1,(p.motion?age:4)/9);probe.position.copy(start).lerp(destination,t);probe.rotation.y=time;const positions=trailGeometry.attributes.position,tail=probe.position.clone().lerp(start,.12);positions.setXYZ(0,tail.x,tail.y,tail.z);positions.setXYZ(1,probe.position.x,probe.position.y,probe.position.z);positions.needsUpdate=true;trailGeometry.computeBoundingSphere();}
   renderer.render(scene,camera);
  };camera.position.set(0,.7,18.5);draw(0);
  const lost=(event:Event)=>{event.preventDefault();setFailed(true);};renderer.domElement.addEventListener('webglcontextlost',lost);
  return()=>{cancelAnimationFrame(frame);resize.disconnect();window.removeEventListener('pointermove',move);window.removeEventListener('blur',resetPointer);renderer.domElement.removeEventListener('webglcontextlost',lost);const geometries=new Set<THREE.BufferGeometry>(),materials=new Set<THREE.Material>();scene.traverse(o=>{if(o instanceof THREE.Mesh||o instanceof THREE.Points||o instanceof THREE.Line){geometries.add(o.geometry);(Array.isArray(o.material)?o.material:[o.material]).forEach(m=>materials.add(m));}});geometries.forEach(g=>g.dispose());materials.forEach(m=>m.dispose());renderer.dispose();renderer.domElement.remove();};
 },[quality]);
 return <><div className={'title-observatory'+(failed?' scene-unavailable':'')} style={{backgroundImage:`url(${asset(nebula.path)})`}} data-nebula={nebula.id} ref={host} role="img" aria-label={`A rotating ocean world, orbiting moon and orbital habitats against a ${nebula.name.toLowerCase()} nebula`}/>
 <div className="observatory-controls"><div className="eyebrow">THE CRADLE / HIGH ORBIT</div><div className="orbital-views" aria-label="Observatory camera">{views.map((name,i)=><button key={name} aria-pressed={view===i} onClick={()=>setView(i)}><Focus size={13}/>{name}</button>)}<button className="orbit-pause" disabled={!motion} aria-label={paused?'Resume orbital motion':'Pause orbital motion'} onClick={()=>setPaused(p=>!p)}>{paused||!motion?<Play size={14}/>:<Pause size={14}/>}</button></div><p>{failed?'3D view unavailable on this device. Expedition controls remain available.':'A living world. A thousand possible futures.'}</p></div>
 <aside className="probe-console"><div className="eyebrow"><Radar size={14}/> DEEP SPACE LISTENING POST</div><p aria-live="polite">{probes?transmissions[(probes-1)%transmissions.length]:'Tranquility station is listening. Send a little hello.'}</p><button className="probe-launch" onClick={()=>{launch.current++;setProbes(p=>p+1);effect('discovery');}}><Rocket size={16}/> Launch a probe <span>{String(probes).padStart(2,'0')} ↗</span></button></aside></>;
}
