import {BUILDINGS,CIVIL,PROJECTS,TECHS} from '../../../packages/sim/src/rules';
import type {Command,GameState} from '../../../packages/sim/src/types';
import {applyCommand} from '../../../packages/sim/src/engine';
import {planShipMoves} from '../../../packages/sim/src/fleet-orders';
export type PlannedOrder={id:string;label:string}&({kind:'command';command:Command;guard?:{fleetShips?:string[];queue?:string}}|{kind:'course';empire:number;shipIds:string[];target:string});
export type OrderHistory={orders:PlannedOrder[];past:PlannedOrder[][];future:PlannedOrder[][]};
export const emptyOrders=():OrderHistory=>({orders:[],past:[],future:[]});
export type OrderAction={type:'replace';orders:PlannedOrder[]}|{type:'append';order:PlannedOrder}|{type:'remove';id:string}|{type:'undo'}|{type:'redo'}|{type:'reset';orders?:PlannedOrder[]};
export function orderReducer(state:OrderHistory,action:OrderAction):OrderHistory{
 if(action.type==='reset')return {...emptyOrders(),orders:action.orders||[]};
 if(action.type==='undo')return state.past.length?{orders:state.past.at(-1)!,past:state.past.slice(0,-1),future:[state.orders,...state.future]}:state;
 if(action.type==='redo')return state.future.length?{orders:state.future[0],past:[...state.past,state.orders],future:state.future.slice(1)}:state;
 const orders=action.type==='replace'?action.orders:action.type==='append'?[...state.orders,action.order]:state.orders.filter(o=>o.id!==action.id);
 return {orders,past:[...state.past,state.orders],future:[]};
}
/** Rebuild from the start of the turn; invalid dependent actions never partially apply. */
export function previewOrders(base:GameState,orders:PlannedOrder[]){
 let state=base;const commands:Command[]=[],errors:Record<string,string>={};
 for(const order of orders){const draft=structuredClone(state);let batch:Command[];
  if(order.kind==='course'){const result=planShipMoves(draft,order.empire,order.shipIds,order.target);if(result.error){errors[order.id]=result.error;continue;}batch=result.orders;}else{
   let command=order.command;
   if(order.guard?.fleetShips&&'fleet'in command){const ids=new Set(order.guard.fleetShips),fleet=draft.fleets.find(f=>f.owner===command.empire&&f.ships.length===ids.size&&f.ships.every(s=>ids.has(s.id)));if(!fleet){errors[order.id]='The selected fleet changed after an earlier order was cancelled. Reissue this order for the ships you want.';continue;}command={...command,fleet:fleet.id};}
   if(order.guard?.queue!==undefined&&guardForCommand(draft,command).queue!==order.guard.queue){errors[order.id]='The queue changed after an earlier order was cancelled. Reissue this order for the intended item.';continue;}
   batch=[command];
  }
  let error:string|null=null;try{for(const command of batch){error=applyCommand(draft,command);if(error)break;}}catch{error='This order depends on something that is no longer available.';}
  if(error)errors[order.id]=error;else{state=draft;commands.push(...batch);}
 }
 return {state,commands,errors};
}
export function withoutShipCourses(orders:PlannedOrder[],ids:string[]){const selected=new Set(ids);return orders.flatMap<PlannedOrder>(order=>{if(order.kind!=='course')return [order];const shipIds=order.shipIds.filter(id=>!selected.has(id));return shipIds.length?[{...order,shipIds,label:order.label.replace(/^\d+ ships?/,`${shipIds.length} ship${shipIds.length===1?'':'s'}`)}]:[];});}
export function describeCommand(game:GameState,c:Command){
 const planet='planet'in c?game.systems.flatMap(s=>s.planets).find(p=>p.id===c.planet)?.name:undefined;
 const fleet='fleet'in c?game.fleets.find(f=>f.id===c.fleet)?.name:undefined;
 const what='focus'in c?c.focus:'tech'in c?(TECHS.find(t=>t.id===c.tech)?.name||c.tech):'item'in c?([...BUILDINGS,...CIVIL,...PROJECTS,...(game.designs[c.empire]||[])].find(item=>item.id===c.item.id)?.name||c.item.id):'design'in c?c.design.name:'strategy'in c?c.strategy:'action'in c?c.action:'tax'in c?c.tax:'area'in c?c.area:'order'in c?c.order:'';
 return [c.type.replaceAll('-',' '),planet||fleet,what].filter(Boolean).join(' · ');
}

/** Stable targets prevent cancellation from redirecting later actions to reused IDs or shifted queue rows. */
export function guardForCommand(game:GameState,c:Command){
 const fleetShips='fleet'in c?game.fleets.find(f=>f.id===c.fleet)?.ships.map(s=>s.id):undefined;
 const queue=c.type==='cancel-research'?JSON.stringify(game.empires[c.empire].research):c.type==='cancel'?JSON.stringify(game.systems.flatMap(s=>s.planets).find(p=>p.id===c.planet)?.queue):c.type==='buy'?JSON.stringify(game.systems.flatMap(s=>s.planets).find(p=>p.id===c.planet)?.queue[0]):undefined;
 return {fleetShips,queue};
}
