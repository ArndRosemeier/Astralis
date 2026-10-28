import * as THREE from 'three';
import {batchModel} from './title-model';

// Ceramic plating, recessed seams and maintenance marks, without external assets.
function hullPlating(){
 const size=256,data=new Uint8Array(size*size*4);
 for(let y=0;y<size;y++)for(let x=0;x<size;x++){
  const row=Math.floor(y/64),column=Math.floor((x+row%2*32)/64),px=(x+row%2*32)%64,py=y%64;
  const seam=px<2||py<2,lip=px===2||py===2,grain=((x*13+y*73)%17)-8;
  let value=seam?84:lip?236:192+(row*11+column*7)%29+grain*.4;
  const mark=px>47&&px<56&&py>47&&py<51;if(mark)value=130;
  const i=(y*size+x)*4;data[i]=value;data[i+1]=mark?155:value;data[i+2]=mark?170:value;data[i+3]=255;
 }
 const map=new THREE.DataTexture(data,size,size);map.colorSpace=THREE.SRGBColorSpace;map.wrapS=map.wrapT=THREE.RepeatWrapping;map.repeat.set(.5,.5);map.magFilter=THREE.LinearFilter;map.minFilter=THREE.LinearMipmapLinearFilter;map.generateMipmaps=true;map.needsUpdate=true;return map;
}

/** Ships point along +Z. Broad armored hulls stay legible even at flyby distances. */
export function createTitleShip(kind:'cruiser'|'shuttle'='cruiser'){
 const root=new THREE.Group();root.name=kind;
 const hull=new THREE.MeshStandardMaterial({color:kind==='cruiser'?'#d4dfe6':'#dfccaa',metalness:.45,roughness:.4,map:hullPlating()});
 const armor=new THREE.MeshStandardMaterial({color:'#263c54',metalness:.75,roughness:.4});
 const brass=new THREE.MeshStandardMaterial({color:'#ae895a',metalness:.7,roughness:.3});
 const glass=new THREE.MeshStandardMaterial({color:'#112c44',emissive:'#3faddb',emissiveIntensity:.6,metalness:.5,roughness:.2});
 const glow=new THREE.MeshBasicMaterial({color:'#9bebff'});
 const add=(geometry:THREE.BufferGeometry,material:THREE.Material,x=0,y=0,z=0)=>{const mesh=new THREE.Mesh(geometry,material);mesh.position.set(x,y,z);root.add(mesh);return mesh;};
 const slab=(points:number[][],depth:number,material:THREE.Material,y:number)=>{
  const shape=new THREE.Shape(points.map(([x,z])=>new THREE.Vector2(x,z)));
  const geo=new THREE.ExtrudeGeometry(shape,{depth,bevelEnabled:true,bevelSize:.055,bevelThickness:.05,bevelSegments:1,steps:1});geo.rotateX(Math.PI/2);return add(geo,material,0,y,0);
 };
 slab([[-1.1,-2.5],[1.1,-2.5],[1.4,-.9],[.68,1.75],[.18,3.1],[-.18,3.1],[-.68,1.75],[-1.4,-.9]],.42,hull,.17);
 slab([[-.5,-1.95],[.5,-1.95],[.6,-.7],[.28,1.9],[-.28,1.9],[-.6,-.7]],.32,armor,.43);
 slab([[-.32,-1.7],[.32,-1.7],[.43,-.7],[.27,-.12],[-.27,-.12],[-.43,-.7]],.2,hull,.62);
 add(new THREE.BoxGeometry(.59,.13,.34),glass,0,.66,-.25);
 add(new THREE.CylinderGeometry(.012,.022,.38,8),brass,0,.83,-1.4);
 add(new THREE.SphereGeometry(.085,16,10),hull,0,1.02,-1.4);
 const array=add(new THREE.TorusGeometry(.16,.012,6,24),brass,0,.85,-1.35);array.rotation.x=-.4;
 // Flush deck panels, bridge mullions, recessed radiators and navigation lights.
 for(const side of [-1,1]){
  add(new THREE.BoxGeometry(.016,.145,.35),armor,side*.12,.665,-.25);
  for(let i=0;i<5;i++){
   const panel=add(new THREE.BoxGeometry(.28,.025,.29),hull,side*(.46-i*.034),.445,-.1+i*.33);panel.rotation.y=side*-.07;
  }
  add(new THREE.BoxGeometry(.28,.025,.9),armor,side*1.36,.18,-1.65);
  for(let i=0;i<12;i++)add(new THREE.BoxGeometry(.27,.035,.025),brass,side*1.36,.2,-2.05+i*.073);
  add(new THREE.SphereGeometry(.035,8,6),new THREE.MeshBasicMaterial({color:side<0?'#ff735c':'#8dffe4'}),side*1.86,.03,-.95);
 }
 const plumes:THREE.Mesh[]=[];
 for(const side of [-1,1]){
  slab([[side*.65,-1.9],[side*1.8,-2.3],[side*1.9,-.9],[side*.95,.8]],.19,armor,-.05);
  add(new THREE.BoxGeometry(.48,.48,1.65),hull,side*1.36,-.08,-1.65);
  for(let i=0;i<6;i++)add(new THREE.BoxGeometry(.29,.055,.085),brass,side*.88,.23,-1.6+i*.47);
  for(let i=0;i<9;i++)add(new THREE.BoxGeometry(.05,.035,.07),glow,side*.49,.46,-1.35+i*.25);
  const nozzle=add(new THREE.CylinderGeometry(.23,.28,.32,12),armor,side*1.36,-.08,-2.56);nozzle.rotation.x=Math.PI/2;
  add(new THREE.CircleGeometry(.195,20),glow,side*1.36,-.08,-2.735).rotation.y=Math.PI;
  const plume=add(new THREE.ConeGeometry(.2,1.45,16,1,true),new THREE.MeshBasicMaterial({color:'#4c9fff',transparent:true,opacity:.48,blending:THREE.AdditiveBlending,depthWrite:false,side:THREE.DoubleSide}),side*1.36,-.08,-3.4);plume.rotation.x=-Math.PI/2;plumes.push(plume);
 }
 if(kind==='cruiser'){
  for(const side of [-1,1])for(let i=0;i<3;i++)add(new THREE.BoxGeometry(.35,.22,.46),armor,side*.66,.3,-1.5+i*.65);
  add(new THREE.BoxGeometry(.22,.2,1.8),brass,0,-.35,.2);
 }
 batchModel(root,plumes);return {root,plumes};
}
