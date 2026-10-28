import type {Species} from '../../../packages/sim/src/types';
import {SPECIES} from '../../../packages/sim/src/species';
import {evaluatePicks} from '../../../packages/balance/src/picks';
export function readSpecies(input:unknown):Species{
 if(!input||typeof input!=='object')throw Error('Choose a valid exported species configuration.');const value=input as Record<string,unknown>;const base=SPECIES[0];
 if(typeof value.name!=='string'||!value.name.trim()||value.name.length>36)throw Error('A species name must contain 1–36 characters.');
 if(!Array.isArray(value.picks)||value.picks.some(p=>typeof p!=='string')||value.picks.length>40||!evaluatePicks(value.picks).valid)throw Error('The species has invalid or over-budget picks.');
 const picks=value.picks as string[];const frame=picks.includes('lithic')?'Lithic':picks.includes('synthetic')?'Synthetic':'Carbon';
 const governments=['Autocracy','Republic','Communion','Federation','Technocracy','Directorate'];const government=picks.includes('hive-mind')?'Unified':governments.find(g=>picks.includes(g.toLowerCase()))||'Autocracy';
 const number=(key:string,min:number,max:number,fallback:number)=>{const n=value[key]??fallback;if(typeof n!=='number'||!Number.isFinite(n)||n<min||n>max)throw Error(`Invalid ${key}: choose a value from ${min} to ${max}.`);return n;};
 const choice=(key:string,allowed:string[],fallback:string)=>{const text=value[key]??fallback;if(typeof text!=='string'||!allowed.includes(text))throw Error('Invalid species '+key+'.');return text;};
 const preset=SPECIES.find(s=>s.id===value.id);return {...base,id:typeof value.id==='string'&&/^[a-z0-9-]{1,70}$/.test(value.id)?value.id:'custom-import',name:value.name.trim(),epithet:typeof value.epithet==='string'?value.epithet.slice(0,80):'A new civilization',lore:typeof value.lore==='string'?value.lore.slice(0,1000):'A new civilization has emerged beyond the Veil.',color:typeof value.color==='string'&&/^#[0-9a-f]{6}$/i.test(value.color)?value.color:base.color,frame,government:government as Species['government'],picks:[...picks],temperature:number('temperature',60,750,290),gravity:number('gravity',.2,3.5,1),chemistry:choice('chemistry',['Oxygen','Carbonic','Reducing'],'Oxygen') as Species['chemistry'],medium:choice('medium',['Land','Aquatic','Aerial'],'Land') as Species['medium'],light:choice('light',['Dim','Normal','Bright'],'Normal') as Species['light'],portrait:SPECIES.find(s=>s.portrait===value.portrait)?.portrait||preset?.portrait||base.portrait};
}
