import type {Command,GameState} from './types';
import {applyCommand,canMove} from './engine';

export function selectedShipGroups(game:GameState,owner:number,ids:readonly string[]){
 const selected=new Set(ids);
 return game.fleets.filter(f=>f.owner===owner).map(fleet=>({fleet,ships:fleet.ships.filter(s=>selected.has(s.id))})).filter(g=>g.ships.length);
}

export function shipMoveError(game:GameState,owner:number,ids:readonly string[],target:string){
 const groups=selectedShipGroups(game,owner,ids);
 if(!groups.length)return 'Select a ship first.';
 if(groups.reduce((n,g)=>n+g.ships.length,0)!==new Set(ids).size)return 'Some selected ships are no longer available.';
 for(const {fleet,ships} of groups){const error=canMove(game,{...fleet,ships},target);if(error)return `${fleet.name}: ${error}`;}
 return null;
}

/** Build an atomic, replayable batch. Partial fleets split before moving. */
export function planShipMoves(game:GameState,owner:number,ids:readonly string[],target:string):{orders:Command[];error:string|null}{
 const error=shipMoveError(game,owner,ids,target);if(error)return {orders:[],error};
 const draft=structuredClone(game),orders:Command[]=[];
 for(const {fleet,ships} of selectedShipGroups(game,owner,ids)){
  let fleetId=fleet.id;
  if(ships.length<fleet.ships.length){
   fleetId=`f${draft.nextId}`;
   const split:Command={empire:owner,type:'split',fleet:fleet.id,shipIds:ships.map(s=>s.id)};
   const invalid=applyCommand(draft,split);if(invalid)return {orders:[],error:invalid};orders.push(split);
  }
  const move:Command={empire:owner,type:'move',fleet:fleetId,target};
  const invalid=applyCommand(draft,move);if(invalid)return {orders:[],error:invalid};orders.push(move);
 }
 return {orders,error:null};
}
