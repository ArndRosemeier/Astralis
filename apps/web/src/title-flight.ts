import * as THREE from 'three';

const vec=(x:number,y:number,z:number)=>new THREE.Vector3(x,y,z);
const arrival=new THREE.CubicBezierCurve3(vec(-10,4,8),vec(-6,3,7),vec(0,0,4),vec(0,0,0));
const departure=new THREE.CubicBezierCurve3(vec(0,0,0),vec(0,0,4),vec(9,3,9),vec(13,6,5));
const cruise=new THREE.CubicBezierCurve3(vec(13,6,5),vec(17,9,1),vec(-14,5,9),vec(-10,4,8));
const flyby=new THREE.CatmullRomCurve3([vec(-12,5,-45),vec(-7,3,-28),vec(-3,1,-14),vec(-.45,-.65,-4),vec(.5,-.95,-.5),vec(2,-2,9)],false,'centripetal');

const defaultSchedule={arrival:12,dock:9,departure:13,cruise:14};
export const createShuttleSchedule=(random=Math.random)=>({arrival:10+random()*6,dock:6+random()*13,departure:10+random()*7,cruise:13+random()*11});
export const shuttlePeriod=(s=defaultSchedule)=>s.arrival+s.dock+s.departure+s.cruise;
export function shuttleFlight(time:number,index=0,s=defaultSchedule){
 const period=shuttlePeriod(s),phase=((time+index*16)%period+period)%period;
 if(phase<s.arrival){const u=phase/s.arrival;return {phase:'arriving',position:arrival.getPoint(u),tangent:arrival.getTangent(u),reverse:0,thrust:.25};}
 if(phase<s.arrival+s.dock)return {phase:'docked',position:vec(0,0,0),tangent:vec(0,0,-1),reverse:0,thrust:0};
 if(phase<s.arrival+s.dock+s.departure){const u=(phase-s.arrival-s.dock)/s.departure;return {phase:'departing',position:departure.getPoint(u),tangent:departure.getTangent(u),reverse:1-THREE.MathUtils.smoothstep(u,0,.35),thrust:.3+u*.7};}
 const u=(phase-s.arrival-s.dock-s.departure)/s.cruise;return {phase:'cruising',position:cruise.getPoint(u),tangent:cruise.getTangent(u),reverse:0,thrust:.7};
}

/** Pick a new continuous route and cadence for each visit, not per frame. */
export function createFlyby(random=Math.random){
 const side=random()<.5?-1:1,above=random()<.25,passY=(above?1:-1)*(1.1+random()*.5),range=(a:number,b:number)=>a+random()*(b-a);
 return {curve:new THREE.CatmullRomCurve3([
  vec(side*range(12,19),range(3,7),-range(42,60)),vec(side*range(7,11),range(2,5),-range(25,33)),
  vec(side*range(3,5),passY*1.3,-range(12,16)),vec(side*range(.45,.9),passY,-range(4,5)),
  vec(-side*range(.3,.65),passY*1.1,-.5),vec(-side*range(2,5),passY*2,range(9,13)),
 ],false,'centripetal'),duration:range(14,22),scale:range(.55,.85),bank:side*range(.12,.35),rest:range(14,38)};
}
const defaultFlyby={curve:flyby,duration:15};
export function flybyFlight(age:number,plan=defaultFlyby){
 const u=THREE.MathUtils.clamp(age/plan.duration,0,1);
 return {position:plan.curve.getPoint(u),tangent:plan.curve.getTangent(u),visible:age>=0&&age<=plan.duration,near:u>.65&&u<.94,progress:u};
}

export function outsidePlanet(position:THREE.Vector3,planetCenter:THREE.Vector3,radius=3.9){
 const offset=position.clone().sub(planetCenter);if(offset.lengthSq()===0)offset.set(0,0,1);if(offset.length()<radius)position.copy(planetCenter).add(offset.setLength(radius));return position;
}
