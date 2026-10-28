import * as THREE from 'three';

export const TITLE_LETTER_DELAY=2;
export const TITLE_LETTER_ORBIT_DURATION=21;
export const TITLE_ORBIT_DURATION=TITLE_LETTER_ORBIT_DURATION+7*TITLE_LETTER_DELAY;
export const ORBIT_LETTER_HEIGHT=3.25; // Half the 6.5-unit planet diameter.
/** Each letter departs, circles the world and returns to its own place in sequence. */
export function titleOrbitPose(age:number,center:THREE.Vector3,home:THREE.Vector3,mobile=false,index=0){
 const localAge=age-index*TITLE_LETTER_DELAY,entrance=2.5,lap=16,exit=2.5;
 const progress=THREE.MathUtils.clamp((localAge-entrance)/lap,0,1),angle=progress*Math.PI*2;
 const amount=localAge<entrance?THREE.MathUtils.smoothstep(localAge,0,entrance):1-THREE.MathUtils.smoothstep(localAge,entrance+lap,entrance+lap+exit);
 const position=new THREE.Vector3(Math.sin(angle)*(mobile?2.4:5.7),.3+Math.sin(angle)*(mobile?4.9:1.25),Math.cos(angle)*5).add(center);
 position.lerp(home,1-amount);
 return {position,amount,angle,active:localAge>=0&&localAge<TITLE_LETTER_ORBIT_DURATION};
}
