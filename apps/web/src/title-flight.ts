import * as THREE from 'three';

const vec=(x:number,y:number,z:number)=>new THREE.Vector3(x,y,z);
const arrival=new THREE.CubicBezierCurve3(vec(-10,4,8),vec(-6,3,7),vec(0,0,4),vec(0,0,0));
const departure=new THREE.CubicBezierCurve3(vec(0,0,0),vec(0,0,4),vec(9,3,9),vec(13,6,5));
const cruise=new THREE.CubicBezierCurve3(vec(13,6,5),vec(17,9,1),vec(-14,5,9),vec(-10,4,8));
const flyby=new THREE.CatmullRomCurve3([vec(-12,5,-45),vec(-7,3,-28),vec(-3,1,-14),vec(-.45,-.65,-4),vec(.5,-.95,-.5),vec(2,-2,9)],false,'centripetal');

export function shuttleFlight(time:number,index=0){
 const phase=((time+index*16)%48+48)%48;
 if(phase<12){const u=phase/12;return {phase:'arriving',position:arrival.getPoint(u),tangent:arrival.getTangent(u),reverse:0,thrust:.25};}
 if(phase<21)return {phase:'docked',position:vec(0,0,0),tangent:vec(0,0,-1),reverse:0,thrust:0};
 if(phase<34){const u=(phase-21)/13;return {phase:'departing',position:departure.getPoint(u),tangent:departure.getTangent(u),reverse:1-THREE.MathUtils.smoothstep(u,0,.35),thrust:.3+u*.7};}
 const u=(phase-34)/14;return {phase:'cruising',position:cruise.getPoint(u),tangent:cruise.getTangent(u),reverse:0,thrust:.7};
}

/** A real camera-space approach, passing below the lens and continuing behind it. */
export function flybyFlight(age:number){
 const u=THREE.MathUtils.clamp(age/15,0,1);
 return {position:flyby.getPoint(u),tangent:flyby.getTangent(u),visible:age>=0&&age<=15,near:u>.65&&u<.94};
}

export function outsidePlanet(position:THREE.Vector3,planetCenter:THREE.Vector3){
 const offset=position.clone().sub(planetCenter);if(offset.lengthSq()===0)offset.set(0,0,1);if(offset.length()<3.9)position.copy(planetCenter).add(offset.setLength(3.9));return position;
}
