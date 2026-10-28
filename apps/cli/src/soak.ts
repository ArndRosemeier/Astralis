import {writeFileSync,mkdirSync} from 'node:fs';
import {createGame,DEFAULT_OPTIONS} from '../../../packages/sim/src/generation';
import {SPECIES} from '../../../packages/sim/src/species';
import {assertInvariants,processTurn,score} from '../../../packages/sim/src/engine';
const count=Math.max(1,Number(process.argv.find(v=>v.startsWith('--games='))?.split('=')[1]||24));
const results=[];let checkedTurns=0,battles=0;const started=performance.now();
for(let i=0;i<count;i++){let g=createGame({...DEFAULT_OPTIONS,seed:'SOAK-'+i,size:i%4===0?'Large':'Small',players:i%3===0?4:2,speciesId:SPECIES[i%SPECIES.length].id,approach:i%2===0},SPECIES);g.empires.forEach(e=>{e.ai=true;e.defy=true;});while(g.winner===null&&g.turn<120){g=processTurn(g);assertInvariants(g);checkedTurns++;}battles+=g.battles.length;results.push({seed:g.options.seed,turn:g.turn,winner:g.winner,victory:g.victory,scores:g.empires.map(e=>({species:e.speciesId,score:score(g,e.id)})),hash:g.history.at(-1)?.hash});}
const report={games:count,checkedTurns,battlesRetained:battles,elapsedSeconds:(performance.now()-started)/1000,results};mkdirSync('docs/qa',{recursive:true});writeFileSync('docs/qa/soak.json',JSON.stringify(report,null,2));console.log(JSON.stringify({games:count,checkedTurns,elapsedSeconds:report.elapsedSeconds,endings:results.reduce((a,r)=>({...a,[r.victory!]:((a as Record<string,number>)[r.victory!]||0)+1}),{})},null,2));
