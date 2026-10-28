/** Production evidence for design prices. Does not write or fit prices automatically. */
import {readFileSync,readdirSync,writeFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {PICKS} from '../packages/balance/src/picks';
import {createGame,DEFAULT_OPTIONS} from '../packages/sim/src/generation';
import {processTurn,assertInvariants,score} from '../packages/sim/src/engine';
import type {Species} from '../packages/sim/src/types';
const shard=Number(process.argv[2]??0),shards=Number(process.argv[3]??1);
if(!Number.isInteger(shard)||!Number.isInteger(shards)||shards<1||shard<0||shard>=shards)throw Error('Usage: audit-trait-prices.ts [shard] [shards]');
const fingerprint=()=>Object.fromEntries(['sim','ai','balance'].flatMap(dir=>readdirSync(`packages/${dir}/src`).filter(f=>/\.(ts|json)$/.test(f)).map(f=>{const path=`packages/${dir}/src/${f}`;return [path,createHash('sha256').update(readFileSync(path)).digest('hex')];})));
const source=fingerprint();
const profiles=[
  {temperature:290,gravity:1,chemistry:'Oxygen',medium:'Land',light:'Normal'},
  {temperature:220,gravity:.4,chemistry:'Reducing',medium:'Aquatic',light:'Dim'},
  {temperature:340,gravity:1.4,chemistry:'Carbonic',medium:'Land',light:'Dim'},
] as const;
const styles=['Balanced','Expansionist','Scholar','Militarist'] as const;
const baseline=new Map<string,number>();let games=0,turns=0;
function run(scenario:number,seat:number,ids:string[]){
  const roster:Species[]=[0,1].map(i=>({id:`price-${i}`,name:`Reference ${i}`,epithet:'',lore:'',color:'#abcdef',frame:'Carbon',government:'Autocracy',...profiles[Math.floor(scenario/4)],picks:['carbon','autocracy']}));
  const s=roster[seat];
  for(const id of ids){const p=PICKS.find(p=>p.id===id)!;if(p.group)s.picks=s.picks.filter(id=>PICKS.find(p=>p.id===id)?.group!==p.group);s.picks.push(id);}
  s.frame=s.picks.includes('lithic')?'Lithic':s.picks.includes('synthetic')?'Synthetic':'Carbon';
  const gov=s.picks.find(id=>PICKS.find(p=>p.id===id)?.category==='government')!;
  if(s.picks.includes('hive-mind')){s.picks=s.picks.filter(id=>id!==gov);s.government='Unified';}
  else s.government=(gov[0].toUpperCase()+gov.slice(1)) as Species['government'];
  let g=createGame({...DEFAULT_OPTIONS,seed:`trait-price-${scenario}`,region:'Random',size:'Small',players:2,speciesId:roster[0].id,turnLimit:90,approach:false,tutorial:false},roster);
  for(const e of g.empires){e.ai=true;e.defy=true;e.personality=styles[scenario%4];}
  assertInvariants(g);
  while(g.winner===null&&g.turn<90){g=processTurn(g,[]);assertInvariants(g);turns++;}
  games++;return score(g,seat);
}
const measurements=[];
for(const [index,pick] of PICKS.entries()){
  if(index%shards!==shard)continue;
  const samples=[];
  for(let scenario=0;scenario<12;scenario++)for(const seat of [0,1]){
    const prerequisites=pick.requires??[];
    const key=`${scenario}:${seat}:${prerequisites.join(',')}`;
    if(!baseline.has(key))baseline.set(key,run(scenario,seat,prerequisites));
    const control=baseline.get(key)!;
    const treated=['carbon','autocracy','origin-standard'].includes(pick.id)?control:run(scenario,seat,[...prerequisites,pick.id]);
    samples.push({scenario,seat,control,treated,delta:100*(treated/control-1)});
  }
  const mean=samples.reduce((n,s)=>n+s.delta,0)/samples.length;
  measurements.push({id:pick.id,mean,samples});
  console.log(`[${shard+1}/${shards}] ${pick.id}: ${mean.toFixed(2)}%`);
}
if(JSON.stringify(source)!==JSON.stringify(fingerprint()))throw Error('Simulation source changed during price audit. Discard this run.');
writeFileSync(`docs/balance/trait-audit-${shard}.json`,JSON.stringify({method:'12 matched scenarios (3 biological profiles × 4 AI policies), unique Random-region seed per scenario, both seats, 90-turn horizon. Marginal own-score change against a matched control; prerequisites included in both arms. Screening evidence, not universal prices.',profiles,styles,source,games,turns,measurements},null,2)+'\n');
