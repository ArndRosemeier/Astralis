import {useEffect,useRef,useState} from 'react';
import * as THREE from 'three';
import type {Planet} from '../../../packages/sim/src/types';
import {createWorld,createFacility,worldPalette} from './world-model';
import {disposeModel} from './ship-model';
import {tidalProfile} from './tidal-profile';
import {worldProfile} from './world-profile';
import {asset} from './lib';
import {Expand,Orbit,SunMoon,X} from 'lucide-react';
export function WorldView({planet,color='#8debcf',motion=true}:{planet:Planet;color?:string;motion?:boolean}){
 const host=useRef<HTMLDivElement>(null),latest=useRef(motion),[failed,setFailed]=useState(false),[view,setView]=useState<'surface'|'orbit'>('surface'),dialog=useRef<HTMLDialogElement>(null);latest.current=motion;
 const tidal=tidalProfile(planet),profile=worldProfile(planet);
 const signature=JSON.stringify([planet.id,planet.kind,planet.water,planet.temperature,planet.pressure,planet.locked,planet.owner,Math.floor(planet.population),planet.buildings,planet.queue[0]?.id,color]);
 useEffect(()=>{const container=host.current!;delete container.dataset.rendered;if(container.parentElement)delete container.parentElement.dataset.rendered;let renderer:THREE.WebGLRenderer;try{renderer=new THREE.WebGLRenderer({alpha:true,antialias:true});}catch{setFailed(true);return;}
  setFailed(false);renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));renderer.setClearColor(0,0);renderer.outputColorSpace=THREE.SRGBColorSpace;container.prepend(renderer.domElement);
  const scene=new THREE.Scene(),camera=new THREE.PerspectiveCamera(39,1,.1,50);camera.position.set(0,.5,5.8);camera.lookAt(0,0,0);scene.add(new THREE.AmbientLight('#b4cfff',1.5));const light=new THREE.DirectionalLight('#ffe6c8',3);light.position.set(-3,3,4);scene.add(light);
  const world=createWorld(planet,color);world.root.rotation.z=-.12;scene.add(world.root);
  const work=planet.queue.length?createFacility(planet.queue[0].id,color):null;if(work){work.scale.setScalar(.23);work.position.set(1.6,-.85,1);scene.add(work);}
  let frame=0,last=0,time=0,painted=false,lastPaint=0;
  const resize=new ResizeObserver(()=>{const w=container.clientWidth,h=container.clientHeight;if(!w||!h)return;renderer.setSize(w,h);camera.aspect=w/h;camera.updateProjectionMatrix();painted=false;});resize.observe(container);
  const draw=(now:number)=>{frame=requestAnimationFrame(draw);const dt=Math.min(.1,(now-last)/1000||0);last=now;if(document.hidden)return;const animate=latest.current&&document.documentElement.dataset.motion!=='off';if((!animate&&painted)||(painted&&now-lastPaint<50))return;lastPaint=now;if(animate)time+=dt;world.update(time);if(work)work.rotation.y=time*.25;renderer.render(scene,camera);painted=true;container.dataset.rendered='true';if(container.parentElement)container.parentElement.dataset.rendered='true';};frame=requestAnimationFrame(draw);
  return()=>{cancelAnimationFrame(frame);resize.disconnect();disposeModel(scene);renderer.dispose();renderer.forceContextLoss();renderer.domElement.remove();};
 },[signature]);
 const [land,sea]=worldPalette(planet);
 return <><div className={`living-world world-portrait view-${view} ${tidal?'tidal-world ':''}${failed?'world-fallback':''}`} data-world-kind={planet.kind} data-world-art={profile.category} data-tidal-climate={tidal?.climate} style={{'--world-land':land,'--world-sea':sea,'--world-color':color} as React.CSSProperties}>
  <img key={profile.art} className="world-landscape" src={asset(profile.art)} alt={profile.alt}/>
  <div className="world-view-switch" role="group" aria-label="World portrait view">
   <button aria-pressed={view==='surface'} onClick={()=>setView('surface')}><SunMoon size={13}/>{profile.scene}</button>
   <button aria-pressed={view==='orbit'} onClick={()=>setView('orbit')}><Orbit size={13}/>Orbit</button>
  </div>
  <button className="world-expand" aria-label={`Expand ${planet.name} ${profile.study}`} onClick={()=>dialog.current?.showModal()}><Expand size={15}/></button>
  <div className="world-orbit" ref={host} role="img" aria-label={`${planet.name}: ${profile.locked?'tidally locked, fixed day and night sides; ':''}${planet.owner===null?'unsettled world':`${planet.population.toFixed(1)} billion population, ${planet.buildings.length} completed facilities`}`}>
  {failed&&(planet.kind==='habitat'?<div className="world-fallback-habitat"><i/></div>:planet.kind==='belt'?<div className="world-fallback-belt">{Array.from({length:9},(_,i)=><i key={i} style={{left:`${12+(i*29)%73}%`,top:`${15+(i*19)%65}%`,transform:`rotate(${i*37}deg) scale(${.5+(i%3)*.45})`}}/>)}</div>:<div className="world-fallback-orb"/>)}<div className="world-starfield"/>{planet.owner!==null&&<div className="world-signature"><i/><i/><i/><span>{planet.outpost?'OUTPOST':planet.kind==='habitat'?'ORBITAL HABITAT':'INHABITED'}</span></div>}
  {planet.queue.length>0&&<div className="world-building-beacon"><span/><span/><span/>UNDER CONSTRUCTION</div>}
  </div>
  <div className="world-portrait-caption"><span>{profile.kicker} · {view==='surface'?profile.study.toUpperCase():'ORBITAL VIEW'}</span><strong>{view==='surface'?profile.title:profile.orbitCaption}</strong></div>
 </div>
 {profile.locked&&<><div className="tidal-hemispheres" aria-label="Permanent lighting zones"><span>Day side</span><span>Twilight</span><span>Night side</span></div><p className="tidal-explanation">The same hemisphere always faces the star. <span>{tidal?.transport||'Atmospheric circulation can move heat between hemispheres.'}</span></p></>}
 <dialog ref={dialog} className="world-gallery" onKeyDown={e=>{e.stopPropagation();if(e.key==='Escape'){e.preventDefault();dialog.current?.close();}}} aria-label={`${planet.name} ${profile.study}`} onClick={e=>{if(e.target===e.currentTarget)dialog.current?.close();}}>
  <header><div><span className="eyebrow">{profile.kicker}</span><h2>{planet.name}</h2></div><button autoFocus aria-label="Close world study" onClick={()=>dialog.current?.close()}><X size={21}/></button></header>
  <img src={asset(profile.art)} alt={profile.alt}/>
  <footer><h3>{profile.title}</h3><p>{profile.description} {profile.locked&&tidal?.transport}</p><small>Artist’s impression · illustrative scenery. Refer to world data for conditions and habitability.</small></footer>
 </dialog><p className="world-art-note">{profile.scene} study · artist’s impression</p></>;
}
