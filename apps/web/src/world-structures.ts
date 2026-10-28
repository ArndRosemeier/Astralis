import * as THREE from 'three';
import type {Planet} from '../../../packages/sim/src/types';
import {seedHash} from '../../../packages/sim/src/math';
import {batchModel} from './title-model';

/** Belts and habitats have their own silhouettes, rather than a terrestrial globe. */
export function createWorldStructure(p:Planet,color:string){
 const root=new THREE.Group(),planet=new THREE.Group(),city=new THREE.Group();root.add(planet);planet.add(city);root.userData.worldKind=p.kind;
 const metal=new THREE.MeshStandardMaterial({color:'#bdcfdb',metalness:.65,roughness:.4});
 const dark=new THREE.MeshStandardMaterial({color:'#213644',metalness:.5,roughness:.6});
 const light=new THREE.MeshStandardMaterial({color,emissive:color,emissiveIntensity:.6,roughness:.35});
 const mesh=(geometry:THREE.BufferGeometry,material:THREE.Material,x=0,y=0,z=0)=>{const m=new THREE.Mesh(geometry,material);m.position.set(x,y,z);planet.add(m);return m;};
 if(p.kind==='habitat'){
  mesh(new THREE.TorusGeometry(1.35,.18,12,80),metal);
  mesh(new THREE.TorusGeometry(1.35,.09,8,80),light,0,0,.16);
  mesh(new THREE.TorusGeometry(1.35,.2,8,80),dark,0,0,-.06);
  const hub=mesh(new THREE.CylinderGeometry(.3,.35,.55,12),metal);hub.rotation.x=Math.PI/2;
  for(let i=0;i<8;i++){const a=i*Math.PI/4,strut=mesh(new THREE.BoxGeometry(1.12,.055,.075),metal,Math.cos(a)*.75,Math.sin(a)*.75,-.04);strut.rotation.z=a;const bay=mesh(new THREE.BoxGeometry(.18,.22,.26),dark,Math.cos(a)*1.35,Math.sin(a)*1.35,.12);bay.rotation.z=a;}
  planet.rotation.x=.55;planet.rotation.y=-.25;
 }else{
  // Deterministic scattered rocks. No sphere, cloud shell or artificial ring.
  const seed=seedHash(p.id)%101;
  for(let i=0;i<18;i++){
   const a=i*2.39996+seed*.07,r=.35+((i*7+seed)%13)/10;
   const rock=mesh(new THREE.IcosahedronGeometry(i===0?.58:.09+(i%5)*.055,1),i%4===0?metal:dark,Math.cos(a)*r,Math.sin(a)*r*.65,Math.sin(i*1.7+seed)*.6);
   rock.scale.set(1.1+(i%3)*.2,.7+(i%4)*.1,1);rock.rotation.set(i*.7,i*.4,i*.2);
  }
 }
 batchModel(planet);
 const used=new Set<THREE.Material>();planet.traverse(o=>{if(o instanceof THREE.Mesh)(Array.isArray(o.material)?o.material:[o.material]).forEach(m=>used.add(m));});for(const m of [metal,dark,light])if(!used.has(m))m.dispose();
 const update=(time:number,progress=1)=>{if(p.kind==='habitat')planet.rotation.z=time*.025;else planet.rotation.y=time*.035;city.visible=p.owner!==null;city.scale.setScalar(Math.max(.001,progress));};
 return {root,planet,city,update};
}
