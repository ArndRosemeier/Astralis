import {test} from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import {createFlyby,createShuttleSchedule,shuttlePeriod,flybyFlight,outsidePlanet,shuttleFlight} from '../apps/web/src/title-flight';
import {titleOrbitPose,TITLE_ORBIT_DURATION,TITLE_LETTER_DELAY,TITLE_LETTER_ORBIT_DURATION,ORBIT_LETTER_HEIGHT} from '../apps/web/src/title-orbit-flight';
import {createTitleLettering} from '../apps/web/src/title-lettering';
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

test('varied flybys remain continuous and pass safely above or below the lens',()=>{
 let seed=19;const random=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;};
 const signatures=new Set<string>(),sides=new Set<number>();
 for(let trip=0;trip<50;trip++){
  const plan=createFlyby(random);signatures.add(JSON.stringify(plan.curve.points));sides.add(Math.sign(plan.curve.points[0].x));
  assert.ok(plan.duration>=14&&plan.duration<=22);assert.ok(plan.rest>=14&&plan.rest<=38);
  let last=flybyFlight(0,plan).position;
  for(let age=.05;age<=plan.duration;age+=.05){const pose=flybyFlight(age,plan);assert.ok(pose.position.distanceTo(last)<1);if(Math.abs(pose.position.z)<1)assert.ok(Math.abs(pose.position.y)>1);last=pose.position;}
 }
 assert.equal(signatures.size,50);assert.equal(sides.size,2);
});

test('fresh shuttle schedules preserve docking and circuit joins',()=>{
 for(const random of [()=>0,()=>.5,()=>.999]){
  const s=createShuttleSchedule(random),end=shuttlePeriod(s);
  assert.equal(shuttleFlight(s.arrival+s.dock*.5,0,s).phase,'docked');
  for(const boundary of [s.arrival,s.arrival+s.dock,s.arrival+s.dock+s.departure,end])assert.ok(shuttleFlight(boundary-.0001,0,s).position.distanceTo(shuttleFlight(boundary+.0001,0,s).position)<.001);
 }
});

test('letters depart in sequence, pass behind the world and return to their own places',()=>{
 const center=new THREE.Vector3(3.5,-1.15,0),home=new THREE.Vector3(0,4,11);
 for(const mobile of [true,false]){
  for(let i=0;i<8;i++){
   const start=i*TITLE_LETTER_DELAY;
   assert.equal(titleOrbitPose(start-.01,center,home,mobile,i).active,false);
   assert.ok(titleOrbitPose(start,center,home,mobile,i).position.distanceTo(home)<1e-9);
   assert.ok(titleOrbitPose(start+10.5,center,home,mobile,i).position.z<center.z-4.9);
   assert.ok(titleOrbitPose(start+TITLE_LETTER_ORBIT_DURATION,center,home,mobile,i).position.distanceTo(home)<1e-9);
   assert.equal(titleOrbitPose(TITLE_ORBIT_DURATION,center,home,mobile,i).active,false);
   for(let age=2.5;age<18.5;age+=.1)assert.ok(titleOrbitPose(start+age,center,home,mobile,i).position.distanceTo(center)>4.8);
  }
  const first=titleOrbitPose(12,center,home,mobile,0),second=titleOrbitPose(12,center,home,mobile,1);
  assert.ok(first.position.distanceTo(second.position)>2,'letters must be spaced along the orbit');
 }
});

test('the orbit scale gives every sculpted letter half the planet diameter in height',()=>{
 const model=createTitleLettering();
 for(const letter of model.letters){
  letter.scale.setScalar(ORBIT_LETTER_HEIGHT/model.letterHeight);
  const height=new THREE.Box3().setFromObject(letter).getSize(new THREE.Vector3()).y;
  assert.ok(Math.abs(height/6.5-.5)<.01);
 }
});
