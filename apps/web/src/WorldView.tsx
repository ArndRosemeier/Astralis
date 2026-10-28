import {useEffect,useRef,useState} from 'react';
import * as THREE from 'three';
import type {Planet} from '../../../packages/sim/src/types';
import {createWorld,createFacility,worldPalette} from './world-model';
import {disposeModel} from './ship-model';
export function WorldView({planet,color='#8debcf',motion=true}:{planet:Planet;color?:string;motion?:boolean}){
 const host=useRef<HTMLDivElement>(null),latest=useRef(motion),[failed,setFailed]=useState(false);latest.current=motion;
 const signature=JSON.stringify([planet.id,planet.kind,planet.water,planet.temperature,planet.owner,Math.floor(planet.population),planet.buildings,planet.queue[0]?.id,color]);
 useEffect(()=>{const container=host.current!;let renderer:THREE.WebGLRenderer;try{renderer=new THREE.WebGLRenderer({alpha:true,antialias:true});}catch{setFailed(true);return;}
  setFailed(false);renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));renderer.setClearColor(0,0);renderer.outputColorSpace=THREE.SRGBColorSpace;container.prepend(renderer.domElement);
  const scene=new THREE.Scene(),camera=new THREE.PerspectiveCamera(39,1,.1,50);camera.position.set(0,.5,5.8);camera.lookAt(0,0,0);scene.add(new THREE.AmbientLight('#b4cfff',1.5));const light=new THREE.DirectionalLight('#ffe6c8',3);light.position.set(-3,3,4);scene.add(light);
  const world=createWorld(planet,color);world.root.rotation.z=-.12;scene.add(world.root);
  const work=planet.queue.length?createFacility(planet.queue[0].id,color):null;if(work){work.scale.setScalar(.23);work.position.set(1.6,-.85,1);scene.add(work);}
  let frame=0,last=0,time=0,painted=false,lastPaint=0;
  const resize=new ResizeObserver(()=>{const w=container.clientWidth,h=container.clientHeight;if(!w||!h)return;renderer.setSize(w,h);camera.aspect=w/h;camera.updateProjectionMatrix();painted=false;});resize.observe(container);
  const draw=(now:number)=>{frame=requestAnimationFrame(draw);const dt=Math.min(.1,(now-last)/1000||0);last=now;if(document.hidden)return;const animate=latest.current&&document.documentElement.dataset.motion!=='off';if((!animate&&painted)||(painted&&now-lastPaint<50))return;lastPaint=now;if(animate)time+=dt;world.update(time);if(work)work.rotation.y=time*.25;renderer.render(scene,camera);painted=true;container.dataset.rendered='true';};frame=requestAnimationFrame(draw);
  return()=>{cancelAnimationFrame(frame);resize.disconnect();disposeModel(scene);renderer.dispose();renderer.forceContextLoss();renderer.domElement.remove();};
 },[signature]);
 const [land,sea]=worldPalette(planet);
 return <div className={'living-world '+(failed?'world-fallback':'')} style={{'--world-land':land,'--world-sea':sea,'--world-color':color} as React.CSSProperties} aria-label={`${planet.name}: ${planet.owner===null?'unsettled world':`${planet.population.toFixed(1)} billion population, ${planet.buildings.length} completed facilities`}`} role="img" ref={host}>
  {failed&&<div className="world-fallback-orb"/>}<div className="world-starfield"/>{planet.owner!==null&&<div className="world-signature"><i/><i/><i/><span>{planet.outpost?'OUTPOST':planet.kind==='habitat'?'ORBITAL HABITAT':'INHABITED'}</span></div>}
  {planet.queue.length>0&&<div className="world-building-beacon"><span/><span/><span/>UNDER CONSTRUCTION</div>}
 </div>;
}
