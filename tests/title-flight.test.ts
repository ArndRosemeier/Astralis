import {test} from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import {flybyFlight,outsidePlanet,shuttleFlight} from '../apps/web/src/title-flight';
import {createTitleShip} from '../apps/web/src/title-ships';
import {createStation} from '../apps/web/src/title-orbit';

test('shuttles dock without thrust, back away facing the port, and loop without teleporting',()=>{
 const parked=shuttleFlight(16);assert.equal(parked.phase,'docked');assert.equal(parked.thrust,0);assert.equal(parked.position.length(),0);
 assert.equal(shuttleFlight(21).reverse,1);assert.equal(shuttleFlight(27).reverse,0);
 for(const boundary of [12,21,34,48]){
  assert.ok(shuttleFlight(boundary-.0001).position.distanceTo(shuttleFlight(boundary+.0001).position)<.001,`discontinuous position at ${boundary}`);
 }
 for(const boundary of [34,48])assert.ok(shuttleFlight(boundary-.0001).tangent.dot(shuttleFlight(boundary+.0001).tangent)>.999,'cruise tangent must remain continuous');
 for(let time=0;time<48;time+=.1)for(let i=0;i<3;i++){
  const pose=shuttleFlight(time,i);assert.ok(Number.isFinite(pose.position.length()));assert.ok(Math.abs(pose.tangent.length()-1)<1e-6);
  assert.ok(pose.position.distanceTo(shuttleFlight(time+48,i).position)<1e-10);
 }
});

test('the cruiser travels from distant space past the lens before disappearing',()=>{
 assert.ok(flybyFlight(0).position.z<-30);assert.ok(flybyFlight(15).position.z>5);
 assert.equal(flybyFlight(-1).visible,false);assert.equal(flybyFlight(16).visible,false);
 let previous=flybyFlight(0).position;
 for(let time=.05;time<=15;time+=.05){const pose=flybyFlight(time);assert.ok(pose.position.distanceTo(previous)<1);assert.ok(pose.tangent.length()>.99);previous=pose.position;}
 assert.equal(flybyFlight(11).near,true);assert.ok(flybyFlight(11).position.length()<5);
});

test('orbit traffic stays outside the atmosphere even at the planet center',()=>{
 const center=new THREE.Vector3(3,-1,0);
 for(const offset of [new THREE.Vector3(),new THREE.Vector3(.1,1,.2),new THREE.Vector3(10,0,0)]){
  const point=center.clone().add(offset);outsidePlanet(point,center);assert.ok(point.distanceTo(center)>=3.9-1e-10);
 }
});

test('detailed models retain their hulls and independent exhaust after batching',()=>{
 const ship=createTitleShip(),station=createStation();
 const bounds=new THREE.Box3().setFromObject(ship.root);
 assert.ok(bounds.max.z>3&&bounds.min.z<-3,'bow and engines must remain on opposite ends');
 assert.ok(bounds.getSize(new THREE.Vector3()).x>3.7);
 assert.ok(ship.root.children.length<15,'static detail should be batched');
 assert.ok(station.children.length<10);
 for(const plume of ship.plumes){assert.equal(plume.parent,ship.root);plume.visible=false;}
});
