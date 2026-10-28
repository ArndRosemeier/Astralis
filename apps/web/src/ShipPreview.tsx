import {useEffect,useRef,useState} from 'react';
import * as THREE from 'three';
import {Rocket} from 'lucide-react';
import {createShipModel,disposeModel,type ShipAppearance} from './ship-model';

type Preview={canvas:HTMLCanvasElement;context:CanvasRenderingContext2D;scene:THREE.Scene;model:THREE.Group;visible:boolean;dirty:boolean;angle:number};
const previews=new Set<Preview>();let renderer:THREE.WebGLRenderer|null=null,frame=0,last=0;
const camera=new THREE.PerspectiveCamera(35,4/3,.1,20);camera.position.set(1.15,.8,1.5);camera.lookAt(0,0,0);
function paint(now:number){
 frame=requestAnimationFrame(paint);if(now-last<60||document.hidden)return;const delta=Math.min(.1,(now-last)/1000);last=now;
 const motion=document.documentElement.dataset.motion!=='off';
 for(const p of previews){if(!p.visible||!motion&&!p.dirty)continue;if(motion)p.angle+=delta*.32;
  p.model.rotation.y=p.angle;renderer!.render(p.scene,camera);p.context.clearRect(0,0,256,192);p.context.drawImage(renderer!.domElement,0,0);p.canvas.dataset.rendered='true';p.dirty=false;
 }
}
/** All thumbnails share one WebGL context, including long, scrolling ship lists. */
export function ShipPreview({appearance,label,className=''}:{appearance:ShipAppearance;label:string;className?:string}){
 const canvas=useRef<HTMLCanvasElement>(null),[failed,setFailed]=useState(false),key=JSON.stringify(appearance);
 useEffect(()=>{
  let model:THREE.Group;try{
   if(!renderer){renderer=new THREE.WebGLRenderer({alpha:true,antialias:true});renderer.setSize(256,192,false);renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.setClearColor(0,0);}
   model=createShipModel(JSON.parse(key));
  }catch{setFailed(true);return;}
  const scene=new THREE.Scene();scene.add(model,new THREE.AmbientLight('#bbd5ff',1.8));
  const keyLight=new THREE.DirectionalLight('#fff0d8',4);keyLight.position.set(2,3,4);scene.add(keyLight);const rim=new THREE.DirectionalLight('#82baff',3);rim.position.set(-3,1,-2);scene.add(rim);
  const p:Preview={canvas:canvas.current!,context:canvas.current!.getContext('2d')!,scene,model,visible:true,dirty:true,angle:-.4};previews.add(p);
  const observer=new IntersectionObserver(([entry])=>{p.visible=entry.isIntersecting;p.dirty=true;});observer.observe(p.canvas);
  if(!frame){last=performance.now()-100;frame=requestAnimationFrame(paint);}
  return()=>{observer.disconnect();previews.delete(p);disposeModel(scene);if(!previews.size){cancelAnimationFrame(frame);frame=0;renderer?.dispose();renderer?.forceContextLoss();renderer=null;}};
 },[key]);
 return <span className={'ship-preview '+className} role="img" aria-label={label}>{failed?<Rocket aria-hidden="true"/>:<canvas ref={canvas} width={256} height={192} aria-hidden="true"/>}</span>;
}
