import type {Fleet,GameState} from './types';
import {distance} from './math';
/** The exact physical point, including travel along a previously redirected course. */
export function fleetPosition(game:GameState,fleet:Fleet){
 const start=fleet.travelFrom||game.systems.find(s=>s.id===fleet.systemId)!;
 const end=game.systems.find(s=>s.id===fleet.destination);
 if(!end)return {x:start.x,y:start.y,z:start.z};
 const length=distance(start,end),progress=length&&Math.abs(length-fleet.remaining)>.001?Math.max(0,Math.min(1,1-fleet.remaining/length)):0;
 return {x:start.x+(end.x-start.x)*progress,y:start.y+(end.y-start.y)*progress,z:start.z+(end.z-start.z)*progress};
}
export function fleetHasDeparted(game:GameState,fleet:Fleet){return distance(fleetPosition(game,fleet),game.systems.find(s=>s.id===fleet.systemId)!)>.002;}
