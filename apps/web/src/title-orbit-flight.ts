import * as THREE from 'three';

export const TITLE_ORBIT_DURATION=17;
/** A true world-space ellipse: the far half passes behind the planet's depth. */
export function titleOrbitPose(age:number,center:THREE.Vector3,home:THREE.Vector3,mobile=false){
 const entrance=2.5,lap=12,exit=2.5;
 const progress=THREE.MathUtils.clamp((age-entrance)/lap,0,1),angle=progress*Math.PI*2;
 const amount=age<entrance?THREE.MathUtils.smoothstep(age,0,entrance):1-THREE.MathUtils.smoothstep(age,entrance+lap,entrance+lap+exit);
 const position=new THREE.Vector3(Math.sin(angle)*(mobile?2.65:5.7),.6+Math.sin(angle)*(mobile?2.8:1.4),Math.cos(angle)*7.2).add(center);
 position.lerp(home,1-amount);
 return {position,amount,angle,active:age>=0&&age<TITLE_ORBIT_DURATION};
}
