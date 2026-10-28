import * as THREE from 'three';
import {mergeGeometries} from 'three/addons/utils/BufferGeometryUtils.js';

/** Bake static detail by material so close-up models don't require hundreds of draw calls. */
export function batchModel(root:THREE.Group,animated:THREE.Object3D[]=[]){
 const batches=new Map<THREE.Material,THREE.Mesh[]>();
 for(const object of root.children){
  if(!(object instanceof THREE.Mesh)||Array.isArray(object.material)||animated.includes(object))continue;
  const meshes=batches.get(object.material)||[];meshes.push(object);batches.set(object.material,meshes);
 }
 for(const [material,meshes] of batches){
  const geometries=meshes.map(mesh=>{mesh.updateMatrix();const geometry=mesh.geometry.index?mesh.geometry.toNonIndexed():mesh.geometry.clone();return geometry.applyMatrix4(mesh.matrix);});
  const geometry=mergeGeometries(geometries,false);geometries.forEach(g=>g.dispose());if(!geometry)continue;
  for(const mesh of meshes){root.remove(mesh);mesh.geometry.dispose();}
  root.add(new THREE.Mesh(geometry,material));
 }
}
