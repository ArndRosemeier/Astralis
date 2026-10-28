import {processTurn,assertInvariants} from '../../../packages/sim/src/engine';
self.onmessage=({data})=>{try{const state=processTurn(data.state,data.orders);assertInvariants(state);self.postMessage({id:data.id,state});}catch(error){self.postMessage({id:data.id,error:String(error)});}};
