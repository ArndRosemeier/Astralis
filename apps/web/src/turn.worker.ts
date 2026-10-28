import {turnSubmissionError} from '../../../packages/sim/src/turn-readiness';
import {processTurn,assertInvariants} from '../../../packages/sim/src/engine';
self.onmessage=({data})=>{try{const error=turnSubmissionError(data.state,data.empire,data.orders);if(error)throw Error(error);const state=processTurn(data.state,data.orders);assertInvariants(state);self.postMessage({id:data.id,state});}catch(error){self.postMessage({id:data.id,error:String(error)});}};
