import {useEffect,useRef,useState} from 'react';
import * as THREE from 'three';
import {Focus,Pause,Play,Ship} from 'lucide-react';
import {asset,effect} from './lib';
import {sphereVertex,planetFragment,cloudsFragment,atmosphereFragment,moonFragment,starVertex,starFragment} from './title-shaders';
import type {TitleNebula} from './title-nebula';
import {createStation} from './title-orbit';
import {createTitleLettering} from './title-lettering';
import {createTitleShip} from './title-ships';
import {flybyFlight,outsidePlanet,shuttleFlight} from './title-flight';

const views=['Homeworld','Lunar approach','Orbital shipyard'];
export function TitleScene({motion,quality,nebula}:{motion:boolean;quality:string;nebula:TitleNebula}){
 const host=useRef<HTMLDivElement>(null),anchor=useRef<HTMLHeadingElement>(null);
 const cues=useRef({flyby:0,title:0,departure:0}),latest=useRef({motion,view:0,paused:false});
 const [view,setView]=useState(0),[paused,setPaused]=useState(false),[failed,setFailed]=useState(false),[ready,setReady]=useState(false);
 latest.current={motion,view,paused};
 useEffect(()=>{
  const container=host.current!;let renderer:THREE.WebGLRenderer;
  try{renderer=new THREE.WebGLRenderer({antialias:quality!=='Low',alpha:true,powerPreference:'high-performance'});}catch{setFailed(true);setReady(false);return;}
  setFailed(false);renderer.setPixelRatio(Math.min(devicePixelRatio,quality==='Low'?1:1.75));renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.15;renderer.setClearColor('#030714',0);container.append(renderer.domElement);
  const scene=new THREE.Scene(),camera=new THREE.PerspectiveCamera(42,1,.1,180),root=new THREE.Group();scene.add(root,camera);
  const sun=new THREE.Vector3(-.8,.35,.45).normalize(),light=new THREE.DirectionalLight('#fff0dc',3.4);light.position.copy(sun.clone().multiplyScalar(40));scene.add(light,new THREE.AmbientLight('#557ab0',.5));
  const key=new THREE.PointLight('#fff0d4',28,25,2);key.position.set(-3,3,-2);camera.add(key);
  const rim=new THREE.PointLight('#999bff',15,18,2);rim.position.set(4,-1,-3);camera.add(rim);
  const geometry=new THREE.SphereGeometry(3.25,quality==='Low'?64:128,quality==='Low'?48:96);
  const shader=(fragmentShader:string,extra:THREE.ShaderMaterialParameters={})=>new THREE.ShaderMaterial({vertexShader:sphereVertex,fragmentShader,uniforms:{sun:{value:sun}},...extra});
  const planet=new THREE.Mesh(geometry,shader(planetFragment));planet.rotation.set(.15,.8,-.18);root.add(planet);
  const clouds=new THREE.Mesh(geometry,shader(cloudsFragment,{transparent:true,depthWrite:false}));clouds.scale.setScalar(1.012);clouds.rotation.copy(planet.rotation);root.add(clouds);
  const air=new THREE.Mesh(geometry,shader(atmosphereFragment,{transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,side:THREE.BackSide}));air.scale.setScalar(1.035);root.add(air);
  const moon=new THREE.Mesh(new THREE.SphereGeometry(.73,48,40),shader(moonFragment));root.add(moon);
  const station=createStation(),relay=createStation();relay.scale.multiplyScalar(.6);root.add(station,relay);
  const moonPosition=(t:number)=>new THREE.Vector3(Math.cos(t)*6.5,Math.sin(t)*1.8,Math.sin(t)*5.2);
  const stationPosition=(t:number)=>new THREE.Vector3(Math.cos(t)*4.8,Math.sin(t)*2.5,Math.sin(t)*3.7);
  const starPositions:number[]=[],starColors:number[]=[],starSizes:number[]=[];let seed=937;const random=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;};
  for(let i=0;i<(quality==='Low'?900:2200);i++){const p=new THREE.Vector3(random()*2-1,random()*2-1,random()*2-1).normalize().multiplyScalar(65+random()*30);starPositions.push(p.x,p.y,p.z);const c=new THREE.Color().setHSL(random()<.25?.1:.58,.12+random()*.2,.72+random()*.26);starColors.push(c.r,c.g,c.b);starSizes.push(random()<.08?7+random()*4:2.5+random()*2.5);}
  const starGeometry=new THREE.BufferGeometry();starGeometry.setAttribute('position',new THREE.Float32BufferAttribute(starPositions,3));starGeometry.setAttribute('color',new THREE.Float32BufferAttribute(starColors,3));starGeometry.setAttribute('starSize',new THREE.Float32BufferAttribute(starSizes,1));scene.add(new THREE.Points(starGeometry,new THREE.ShaderMaterial({vertexShader:starVertex,fragmentShader:starFragment,uniforms:{pixelRatio:{value:renderer.getPixelRatio()}},vertexColors:true,transparent:true,depthWrite:false,blending:THREE.AdditiveBlending})));
  const lettering=createTitleLettering();camera.add(lettering.root);lettering.root.traverse(o=>o.layers.set(1));
  scene.traverse(o=>{if(o instanceof THREE.Light)o.layers.enable(1);});
  const shuttles=[0,1,2].map(()=>{const ship=createTitleShip('shuttle');ship.root.scale.setScalar(.12);scene.add(ship.root);return ship;});
  const cruiser=createTitleShip();cruiser.root.scale.setScalar(.68);scene.add(cruiser.root);
  const pointer=new THREE.Vector2(),raycaster=new THREE.Raycaster();
  const move=(event:PointerEvent)=>{const r=container.getBoundingClientRect();pointer.set((event.clientX-r.left)/r.width-.5,(event.clientY-r.top)/r.height-.5);};
  const resetPointer=()=>pointer.set(0,0);window.addEventListener('pointermove',move);window.addEventListener('blur',resetPointer);
  const interact=(event:PointerEvent)=>{
   const r=container.getBoundingClientRect();raycaster.setFromCamera(new THREE.Vector2((event.clientX-r.left)/r.width*2-1,1-(event.clientY-r.top)/r.height*2),camera);
   const hit=raycaster.intersectObjects([planet,moon,station,relay,...shuttles.map(s=>s.root),cruiser.root],true)[0];if(!hit)return;
   let object:THREE.Object3D|null=hit.object;while(object?.parent&&object.parent!==root&&object.parent!==scene)object=object.parent;
   if(object===planet)setView(v=>v===0?1:0);else if(object===moon)setView(1);else if(object===station||object===relay){if(latest.current.motion&&!latest.current.paused)cues.current.departure++;setView(2);}else if(latest.current.motion&&!latest.current.paused)cues.current.flyby++;
  };container.addEventListener('pointerup',interact);
  let width=1,height=1,frame=0,last=0,time=0,lastDraw=0,lastView=-1,seenFlyby=0,seenTitle=0,seenDeparture=0;
  let flybyStart=-2,flybySpeed=1,nextFlyby=34,surprise=-100,nextSurprise=24;
  const shuttleOffsets=[0,0,0],cameraTarget=new THREE.Vector3(),lookTarget=new THREE.Vector3(),currentLook=new THREE.Vector3();
  const dockRotation=new THREE.Quaternion(),dockFlip=new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0,1,0),Math.PI);
  const size=()=>{
   width=container.clientWidth;height=container.clientHeight;renderer.setSize(width,height);camera.aspect=width/Math.max(height,1);camera.updateProjectionMatrix();lastDraw=0;
   const r=anchor.current!.getBoundingClientRect(),c=container.getBoundingClientRect(),depth=7,worldHeight=2*Math.tan(THREE.MathUtils.degToRad(21))*depth,worldWidth=worldHeight*camera.aspect;
   lettering.root.position.set(((r.left-c.left+r.width/2)/width-.5)*worldWidth,(.5-(r.top-c.top+r.height/2)/height)*worldHeight,-depth);
   lettering.root.scale.setScalar(Math.min(r.width/width*worldWidth/lettering.width,r.height/height*worldHeight/lettering.height)*.92);lettering.root.rotation.set(-.08,.035,-.008);
  };
  const resize=new ResizeObserver(size);resize.observe(container);resize.observe(anchor.current!);
  const draw=(now:number)=>{
   frame=requestAnimationFrame(draw);const p=latest.current,animate=p.motion&&!p.paused&&!document.hidden,delta=Math.min((now-last)/1000||0,.1);last=now;if(document.hidden)return;if(animate)time+=delta;
   const viewChanged=lastView!==p.view;lastView=p.view;if(!animate&&!viewChanged&&now-lastDraw<250)return;lastDraw=now;
   planet.rotation.y=.8+time*.025;clouds.rotation.y=.8+time*.029;moon.position.copy(moonPosition(time*.022+1.9));moon.rotation.y=time*.035;station.position.copy(stationPosition(time*.025+.4));station.rotation.z=.3+time*.025;relay.position.copy(stationPosition(time*.02+3.4));relay.rotation.y=time*.04;
   const mobile=width<700;root.position.set(mobile?.6:3.5,mobile?0:-1.15,0);
   if(p.view===0){cameraTarget.set(0,.7,mobile?23:18.5);lookTarget.set(0,0,0);}else if(p.view===1){cameraTarget.copy(root.position).add(moon.position).add(new THREE.Vector3(-2.4,1.3,4.7));lookTarget.copy(root.position).add(moon.position.clone().multiplyScalar(.55));}else{cameraTarget.copy(root.position).add(station.position).add(new THREE.Vector3(-1.8,1.4,5.8));lookTarget.copy(root.position).add(station.position.clone().multiplyScalar(.8));}
   if(animate){cameraTarget.x+=pointer.x*.3;cameraTarget.y-=pointer.y*.15;const easing=1-Math.exp(-delta*2.4);camera.position.lerp(cameraTarget,easing);currentLook.lerp(lookTarget,easing);}else{camera.position.copy(cameraTarget);currentLook.copy(lookTarget);}camera.lookAt(currentLook);camera.updateMatrixWorld(true);root.updateMatrixWorld(true);
   if(animate&&(seenFlyby!==cues.current.flyby||time>nextFlyby)){
    const manual=seenFlyby!==cues.current.flyby,age=(time-flybyStart)*flybySpeed;seenFlyby=cues.current.flyby;flybySpeed=manual?2.4:1;flybyStart=time-(manual&&age<15?age/flybySpeed:0);nextFlyby=time+34;
   }
   if(animate&&(seenTitle!==cues.current.title||time>nextSurprise)){seenTitle=cues.current.title;surprise=time;nextSurprise=time+29;}
   if(animate&&seenDeparture!==cues.current.departure){seenDeparture=cues.current.departure;const index=shuttles.findIndex((_,i)=>shuttleFlight(time+shuttleOffsets[i],i).phase==='docked');if(index>=0)shuttleOffsets[index]+=21-((time+shuttleOffsets[index]+index*16)%48);}
   const phases:string[]=[];
   shuttles.forEach((ship,i)=>{
    const port=i===1?relay:station,pose=shuttleFlight(time+shuttleOffsets[i],i);phases.push(pose.phase);
    port.getWorldQuaternion(dockRotation);const center=port.localToWorld(new THREE.Vector3(0,i===2?.22:0,1.5));
    ship.root.position.copy(pose.position).applyQuaternion(dockRotation).add(center);outsidePlanet(ship.root.position,root.position);
    const target=ship.root.position.clone().add(pose.tangent.clone().applyQuaternion(dockRotation));ship.root.lookAt(target);
    if(pose.phase==='docked')ship.root.quaternion.copy(dockRotation).multiply(dockFlip);else if(pose.reverse)ship.root.quaternion.slerp(dockRotation.clone().multiply(dockFlip),pose.reverse);
    ship.plumes.forEach(plume=>{plume.visible=pose.thrust>0;plume.scale.y=.45+pose.thrust*.7;});
   });
   const flight=flybyFlight((time-flybyStart)*flybySpeed);cruiser.root.visible=flight.visible;
   if(flight.visible){cruiser.root.position.copy(camera.localToWorld(flight.position));cruiser.root.lookAt(cruiser.root.position.clone().add(flight.tangent.transformDirection(camera.matrixWorld)));cruiser.root.rotateZ(-.12);}
   lettering.update(time,surprise);
   container.dataset.traffic=phases.join(' ');container.dataset.flyby=flight.visible?flight.near?'close-pass':'approach':'waiting';container.dataset.sculpture=time-surprise<5?'reassembling':'idle';container.dataset.view=String(p.view);
   renderer.render(scene,camera);
   // Keep the title intact even when a close viewpoint puts the planet nearer than it.
   renderer.autoClear=false;renderer.clearDepth();camera.layers.set(1);renderer.render(scene,camera);camera.layers.set(0);renderer.autoClear=true;
  };camera.position.set(0,.7,18.5);size();draw(0);setReady(true);
  const lost=(event:Event)=>{event.preventDefault();setFailed(true);setReady(false);};renderer.domElement.addEventListener('webglcontextlost',lost);
  return()=>{cancelAnimationFrame(frame);resize.disconnect();window.removeEventListener('pointermove',move);window.removeEventListener('blur',resetPointer);container.removeEventListener('pointerup',interact);renderer.domElement.removeEventListener('webglcontextlost',lost);const geometries=new Set<THREE.BufferGeometry>(),materials=new Set<THREE.Material>();scene.traverse(o=>{if(o instanceof THREE.Mesh||o instanceof THREE.Points||o instanceof THREE.Line){geometries.add(o.geometry);(Array.isArray(o.material)?o.material:[o.material]).forEach(m=>materials.add(m));}});geometries.forEach(g=>g.dispose());const textures=new Set<THREE.Texture>();materials.forEach(m=>{Object.values(m).forEach(value=>{if(value instanceof THREE.Texture)textures.add(value);});m.dispose();});textures.forEach(t=>t.dispose());renderer.dispose();renderer.domElement.remove();};
 },[quality]);
 const active=motion&&!paused;
 return <>
  <div className={'title-observatory cinematic-scene'+(failed?' scene-unavailable':'')} style={{backgroundImage:`url(${asset(nebula.path)})`}} data-nebula={nebula.id} ref={host} role="img" aria-label={`A sculptural ASTRALIS title above a living ocean world, docking shuttles and close-passing starships against a ${nebula.name.toLowerCase()} nebula`}/>
  <div className={'title-sculpture'+(ready&&!failed?' title-sculpture--rendered':'')}>
   <h1 ref={anchor} aria-label="ASTRALIS"><button aria-label="Animate ASTRALIS title" aria-describedby="title-scene-tooltip" onClick={()=>{if(active){cues.current.title++;effect('discovery');}}}>ASTRALIS</button></h1>
   <div className="title-lore" id="title-scene-tooltip" role="tooltip">Beyond the Veil. Build a civilization among real stars.<br/>An Arnd Rosemeier universe. Touch the letters, moon, or orbital station.</div>
  </div>
  <div className="scene-tools" aria-label="Title scene controls">
   <button className="icon-button" title="Send a close flyby" aria-label="Send a close flyby" disabled={!active} onClick={()=>{cues.current.flyby++;}}><Ship size={19}/></button>
   <button className="icon-button" title={`Change viewpoint · ${views[view]}`} aria-label="Change viewpoint" onClick={()=>setView(v=>(v+1)%3)}><Focus size={19}/></button>
   <button className="icon-button" disabled={!motion} title={paused?'Resume scene':'Pause scene'} aria-label={paused?'Resume scene':'Pause scene'} onClick={()=>setPaused(v=>!v)}>{active?<Pause size={18}/>:<Play size={18}/>}</button>
  </div>
 </>;
}
