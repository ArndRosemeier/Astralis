import * as THREE from 'three';
import type {GameState,Ship,ShipDesign} from '../../../packages/sim/src/types';
import {createTitleShip} from './title-ships';
import {batchModel} from './title-model';

export type ShipAppearance={kind:Ship['kind'];hull?:string;weapons?:number;color:string;frame?:string};
export function shipAppearance(game:GameState,owner:number,ship:Pick<Ship,'kind'|'designId'>):ShipAppearance{
 const empire=game.empires[owner],design=game.designs[owner]?.find(d=>d.id===ship.designId);
 return {kind:ship.kind,hull:design?.hull,weapons:design?.weapons,color:empire.color,frame:game.species.find(s=>s.id===empire.speciesId)?.frame};
}
export const designAppearance=(design:ShipDesign,color:string):ShipAppearance=>({kind:'warship',hull:design.hull,weapons:design.weapons,color});
export function shipName(game:GameState,owner:number,ship:Pick<Ship,'kind'|'designId'>){return game.designs[owner]?.find(d=>d.id===ship.designId)?.name||({colony:'Colony ship',probe:'Survey probe',transport:'Troop transport',outpost:'Outpost tender',depot:'Supply depot',impactor:'Impactor',habitat:'Habitat ship',warship:'Warship'}[ship.kind]);}

/** Shared geometry for the map, ship lists, designer and battle replay. Forward is +Z. */
export function createShipModel(appearance:ShipAppearance){
 const body=new THREE.Group(),alloy=new THREE.MeshStandardMaterial({color:'#bfccd5',metalness:.5,roughness:.35}),dark=new THREE.MeshStandardMaterial({color:'#23344d',metalness:.6,roughness:.4});
 const trim=new THREE.MeshStandardMaterial({color:appearance.color,emissive:appearance.color,emissiveIntensity:.22,metalness:.4,roughness:.35});
 const light=new THREE.MeshBasicMaterial({color:'#a5edff'}),gold=new THREE.MeshStandardMaterial({color:'#c7a36e',metalness:.7,roughness:.3});
 const add=(g:THREE.BufferGeometry,m:THREE.Material,x=0,y=0,z=0)=>{const mesh=new THREE.Mesh(g,m);mesh.position.set(x,y,z);body.add(mesh);return mesh;};
 const cylinder=(r:number,length:number,m:THREE.Material,x=0,y=0,z=0)=>{const mesh=add(new THREE.CylinderGeometry(r,r,length,16),m,x,y,z);mesh.rotation.x=Math.PI/2;return mesh;};
 if(appearance.kind==='warship'){
  const ship=createTitleShip();ship.plumes.forEach(p=>{ship.root.remove(p);disposeModel(p);});body.add(ship.root);
  const broad=['cruiser','battleship','dreadnought','titan','fortress'].includes(appearance.hull||'');
  ship.root.scale.set(broad?1.25:.85,appearance.frame==='Lithic'?1.15:1,broad?1:1.12);
  for(const side of [-1,1]){
   add(new THREE.BoxGeometry(.13,.04,1.5),trim,side*.52,.49,.35);
   for(let i=0;i<Math.min(4,Math.ceil((appearance.weapons||2)/2));i++)cylinder(.065,.58,dark,side*.74,.42,-.5+i*.5);
  }
  if(appearance.hull==='fortress')add(new THREE.TorusGeometry(2.4,.25,8,40),alloy).rotation.x=Math.PI/2;
 }else if(appearance.kind==='probe'){
  cylinder(.22,2.6,alloy);add(new THREE.SphereGeometry(.3,16,10),gold,0,0,1.35);
  for(const side of [-1,1]){add(new THREE.BoxGeometry(1.4,.04,1.1),dark,side*.95,0,-.1);for(let i=0;i<5;i++)add(new THREE.BoxGeometry(1.3,.02,.018),trim,side*.95,.03,-.5+i*.2);}
  cylinder(.07,.7,dark,0,0,1.9);add(new THREE.TorusGeometry(.42,.035,8,24),gold,0,0,-1.1);
 }else if(appearance.kind==='impactor'){
  cylinder(.24,3.5,dark);const nose=add(new THREE.ConeGeometry(.24,.9,12),alloy,0,0,2.2);nose.rotation.x=Math.PI/2;
  for(const side of [-1,1])add(new THREE.BoxGeometry(.8,.05,.7),trim,side*.4,0,-1.3);
 }else{
  cylinder(.42,4.3,alloy);add(new THREE.SphereGeometry(.44,16,10),alloy,0,0,2.1);
  const habitat=appearance.kind==='colony'||appearance.kind==='habitat';
  if(habitat){
   add(new THREE.TorusGeometry(1.35,.21,12,40),alloy,0,0,.15);add(new THREE.TorusGeometry(1.36,.025,6,40),light,0,0,.36);
   for(let i=0;i<4;i++){const spoke=add(new THREE.BoxGeometry(2.6,.07,.07),dark,0,0,.15);spoke.rotation.z=i*Math.PI/4;}
  }else for(const side of [-1,1])for(let i=0;i<3;i++){
   const pod=cylinder(.32,.85,appearance.kind==='transport'?dark:gold,side*.67,0,-.8+i*.95);pod.rotation.z=side*.06;
   add(new THREE.BoxGeometry(.55,.08,.12),trim,side*.67,.34,-.8+i*.95);
  }
  for(const side of [-1,1]){cylinder(.22,1.1,dark,side*.65,0,-1.8);add(new THREE.CircleGeometry(.18,16),light,side*.65,0,-2.36).rotation.y=Math.PI;}
  add(new THREE.BoxGeometry(.48,.12,.75),trim,0,.44,1.25);
 }
 batchModel(body);
 const bounds=new THREE.Box3().setFromObject(body),center=bounds.getCenter(new THREE.Vector3()),size=bounds.getSize(new THREE.Vector3());
 const model=new THREE.Group();body.position.sub(center);model.add(body);body.scale.setScalar(1/Math.max(size.x,size.y,size.z));body.position.multiplyScalar(body.scale.x);
 // Dispose materials unused by this particular class of ship.
 const used=new Set<THREE.Material>();body.traverse(o=>{if(o instanceof THREE.Mesh)(Array.isArray(o.material)?o.material:[o.material]).forEach(m=>used.add(m));});
 for(const material of [alloy,dark,trim,light,gold])if(!used.has(material))material.dispose();
 return model;
}

export function disposeModel(root:THREE.Object3D){
 const geometries=new Set<THREE.BufferGeometry>(),materials=new Set<THREE.Material>(),textures=new Set<THREE.Texture>();
 root.traverse(o=>{if(o instanceof THREE.Mesh||o instanceof THREE.Line||o instanceof THREE.Points)geometries.add(o.geometry);if('material'in o){const m=(o as THREE.Mesh).material;(Array.isArray(m)?m:[m]).forEach(m=>materials.add(m));}});
 materials.forEach(m=>{Object.values(m).forEach(v=>{if(v instanceof THREE.Texture)textures.add(v);});m.dispose();});geometries.forEach(g=>g.dispose());textures.forEach(t=>t.dispose());
}
