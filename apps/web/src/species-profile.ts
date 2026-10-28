import type {Species} from '../../../packages/sim/src/types';
import {aptitude,GOVERNMENTS} from '../../../packages/sim/src/rules';
import {PICKS,type PickDefinition} from '../../../packages/balance/src/picks';

export const percent=(value:number)=>`${value>0?'+':''}${Math.round(value*100)}%`;
export function speciesEconomy(s:Species){
  const gov=GOVERNMENTS[s.government];
  return [
    {id:'industry',name:'Industry',value:aptitude(s,'industry')*.2+gov.industry},
    {id:'research',name:'Research',value:aptitude(s,'research')*.2+gov.research},
    {id:'commerce',name:'Commerce',value:aptitude(s,'commerce')*.25+gov.commerce},
  ];
}
export function speciesTraits(s:Species){return s.picks.map(id=>PICKS.find(p=>p.id===id)).filter((p):p is PickDefinition=>!!p);}
export function traitDescription(p:PickDefinition){
  if(p.category!=='aptitude')return p.description.replace(/ Incompatible with .*\(D49\)\./,'');
  const [key,value]=Object.entries(p.effects)[0];
  const names:Record<string,string>={industry:'Industry output',research:'Research output',commerce:'Commerce output',pilot:'Battle accuracy',troops:'Invasion strength',espionage:'Espionage aptitude',diplomacy:'Diplomatic relations',stability:'Colony stability'};
  const numeric=['espionage','diplomacy','stability'].includes(key);
  return `${names[key]} ${numeric?`${value>0?'+':''}${value}`:key==='pilot'?percent(value).replace('%',' percentage points'):percent(value)}${key==='pilot'?' (accuracy caps at 99%)':''}.`;
}
