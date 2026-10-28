import type {GameState} from './types';
import {aptitude,colonies,has,pick,speciesFor} from './rules';
import {distance} from './math';
import {bonuses} from './effects';
export function attitudeReasons(g:GameState,observer:number,target:number){const e=g.empires[observer],other=g.empires[target];const s=speciesFor(g,e),them=speciesFor(g,other);const r=g.relations.find(r=>r.a===Math.min(observer,target)&&r.b===Math.max(observer,target));if(!r)return [];
 const borders=colonies(g,observer).reduce((n,a)=>n+colonies(g,target).filter(b=>distance(g.systems.find(s=>s.id===a.systemId)!,g.systems.find(s=>s.id===b.systemId)!)<=5).length,0);
 const opposed=[['Autocracy','Republic'],['Communion','Technocracy']].some(pair=>pair.includes(s.government)&&pair.includes(them.government)&&s.government!==them.government);
 return [{reason:'History and diplomatic exchanges',value:r.attitude},{reason:'Diplomatic aptitude',value:aptitude(them,'diplomacy')*15-(pick(them,'hive-mind')||pick(them,'xenophobic')?15:0)},{reason:'Government compatibility',value:s.government===them.government?10:opposed?-10:s.government==='Unified'||them.government==='Unified'?-5:0},{reason:'Habitat competition',value:Math.abs(s.temperature-them.temperature)<60&&s.medium===them.medium?-15:0},{reason:'Border tension',value:-Math.min(25,borders*5)},{reason:'Trade treaty',value:r.trade?10:0},{reason:'Research treaty',value:r.research?10:0},{reason:'Alliance',value:r.state==='Alliance'?20:0},{reason:'Your diplomatic advances',value:bonuses(other).attitude||0}].filter(r=>r.value!==0);
}
export function attitude(g:GameState,observer:number,target:number){return Math.max(-100,Math.min(100,attitudeReasons(g,observer,target).reduce((n,r)=>n+r.value,0)));}
