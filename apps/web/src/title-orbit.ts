import * as THREE from 'three';

/** Built as actual lit geometry: pressure ring, truss spokes, hub, docks and solar wings. */
export function createStation(){
 const station=new THREE.Group();
 const alloy=new THREE.MeshStandardMaterial({color:'#becbd9',metalness:.75,roughness:.35});
 const dark=new THREE.MeshStandardMaterial({color:'#293b50',metalness:.65,roughness:.5});
 const gold=new THREE.MeshStandardMaterial({color:'#c99e54',metalness:.65,roughness:.4});
 const solar=new THREE.MeshStandardMaterial({color:'#153a80',metalness:.65,roughness:.3,side:THREE.DoubleSide});
 const windows=new THREE.MeshBasicMaterial({color:'#9deaff'});
 const mesh=(g:THREE.BufferGeometry,m:THREE.Material,x=0,y=0,z=0)=>{const o=new THREE.Mesh(g,m);o.position.set(x,y,z);station.add(o);return o;};
 mesh(new THREE.CylinderGeometry(.13,.18,1.15,16),alloy).rotation.x=Math.PI/2;
 mesh(new THREE.TorusGeometry(.68,.075,12,96),alloy);
 mesh(new THREE.TorusGeometry(.68,.012,6,96),windows,0,0,.068);
 mesh(new THREE.TorusGeometry(.83,.018,6,96),dark);
 for(let i=0;i<48;i++){const a=i*Math.PI/24;const window=mesh(new THREE.BoxGeometry(.022,.045,.012),windows,Math.cos(a)*.68,Math.sin(a)*.68,.078);window.rotation.z=a;}
 for(let i=0;i<8;i++){const a=i*Math.PI/4;const spoke=mesh(new THREE.CylinderGeometry(.018,.018,1.34,6),dark);spoke.rotation.z=a;const pod=mesh(new THREE.BoxGeometry(.12,.23,.16),i%2?alloy:gold,Math.cos(a)*.7,Math.sin(a)*.7);pod.rotation.z=a;}
 for(const side of [-1,1]){
  mesh(new THREE.BoxGeometry(2.3,.045,.045),alloy,side*1.1,0,-.2);
  for(let j=0;j<3;j++){mesh(new THREE.BoxGeometry(.51,.95,.025),solar,side*(1.05+j*.56),0,-.2);for(let k=0;k<7;k++)mesh(new THREE.BoxGeometry(.5,.007,.028),gold,side*(1.05+j*.56),-.42+k*.14,-.2);}
  mesh(new THREE.CylinderGeometry(.055,.055,.7,8),alloy,0,side*.35,.5);
 }
 mesh(new THREE.SphereGeometry(.055,8,8),new THREE.MeshBasicMaterial({color:'#ff785b'}),0,.87,0);
 const dish=mesh(new THREE.SphereGeometry(.22,16,12,0,Math.PI*2,0,.9),alloy,0,0,.75);dish.rotation.x=Math.PI/2;
 station.rotation.set(.45,-.5,.3);station.scale.setScalar(.44);
 return station;
}
