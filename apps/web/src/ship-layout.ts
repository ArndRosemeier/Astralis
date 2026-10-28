export type MapObstacle={x:number;y:number;r:number};
/** Stable slots around a physical location, with room for stars and other ships. */
export function placeShip(center:{x:number;y:number},index:number,count:number,occupied:MapObstacle[]){
 const preferred=index/Math.max(1,count)*Math.PI*2-Math.PI/2;
 for(let ring=0;ring<10;ring++)for(let step=0;step<32;step++){
  const offset=step===0?0:Math.ceil(step/2)*(step%2?1:-1)*Math.PI/16,angle=preferred+offset,radius=60+ring*48;
  const point={x:center.x+Math.cos(angle)*radius,y:center.y+Math.sin(angle)*radius};
  if(occupied.every(o=>Math.hypot(point.x-o.x,point.y-o.y)>=o.r+24))return point;
 }
 return {x:center.x+60+index*48,y:center.y-60};
}
