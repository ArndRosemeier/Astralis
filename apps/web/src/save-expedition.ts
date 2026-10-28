import {serialize,deserialize} from '../../../packages/sim/src/engine';
import {hash} from '../../../packages/sim/src/math';
import type {GameState} from '../../../packages/sim/src/types';
import type {PlannedOrder} from './turn-orders';
export function encodeExpedition(state:GameState,commander:number,orders:PlannedOrder[]=[]){return JSON.stringify({...JSON.parse(serialize(state)),commander,orders,ordersChecksum:hash(orders)});}
export function decodeExpedition(text:string){
 const state=deserialize(text),saved=JSON.parse(text),orders:PlannedOrder[]=saved.orders??[];
 if(!Array.isArray(orders)||saved.orders!==undefined&&saved.ordersChecksum!==hash(orders)||orders.some(o=>!o||typeof o.id!=='string'||typeof o.label!=='string'||(o.kind==='course'?(!Array.isArray(o.shipIds)||o.shipIds.some(id=>typeof id!=='string')||typeof o.target!=='string'||!Number.isInteger(o.empire)):o.kind!=='command'||!o.command||typeof o.command.type!=='string')))throw Error('Invalid or damaged turn orders.');
 return {state,orders,commander:typeof saved.commander==='number'?saved.commander:0};
}
