import {useState,type CSSProperties} from 'react';
import {Factory,FlaskConical,Coins,Dna,Orbit,ArrowLeftRight} from 'lucide-react';
import type {Species} from '../../../packages/sim/src/types';
import {speciesEconomy,speciesTraits,traitDescription,percent} from './species-profile';
import {evaluatePicks} from '../../../packages/balance/src/picks';

const icons=[Factory,FlaskConical,Coins];
export function SpeciesProfile({species:s,roster=[]}:{species:Species;roster?:Species[]}){
  const [compareId,setCompareId]=useState('');
  const other=roster.find(r=>r.id===compareId&&r.id!==s.id);
  const traits=speciesTraits(s);
  const economy=speciesEconomy(s);
  const budget=evaluatePicks(s.picks);
  return <section className="species-profile" aria-label={`${s.name} abilities`} style={{'--species':s.color} as CSSProperties}>
    <div className="species-budget"><strong>{budget.spent-budget.refund} / 10 points</strong><span>{budget.spent} in abilities{budget.refund>0?` − ${budget.refund} from drawbacks`:''}{budget.remaining>0?` · ${budget.remaining} available`:budget.remaining<0?' · Needs revision':''}</span></div>
    <div className="profile-heading"><Dna size={18}/><h3>Civilization strengths</h3></div>
    <div className="species-economy">{economy.map((stat,i)=>{const Icon=icons[i];return <div key={stat.id} className={`species-stat ${stat.id}`}><Icon size={18}/><span>{stat.name}</span><strong>{percent(stat.value)}</strong><div className="species-meter" aria-hidden="true"><i style={{width:`${Math.min(100,Math.abs(stat.value)*100)}%`}}/></div></div>;})}</div>
    <p className="profile-note">Combined starting bonuses from biology, aptitudes and government. Colony conditions, technology and taxes change actual yields.</p>
    <div className="species-habitat"><Orbit size={18}/><div><strong>Home environment</strong><span>{s.temperature} K · {s.gravity} g · {s.chemistry} chemistry · {s.medium} · {s.light} light</span><small>Expansion depends on finding worlds suited to these conditions.</small></div></div>
    {roster.length>1&&<div className="species-compare"><label><ArrowLeftRight size={16}/> Compare civilizations<select aria-label="Compare civilization" value={other?.id||''} onChange={e=>setCompareId(e.target.value)}><option value="">Choose a civilization…</option>{roster.filter(r=>r.id!==s.id).map(r=><option key={r.id} value={r.id}>{r.name}</option>)}</select></label>{other&&<>
      <table><caption>Starting economy comparison</caption><thead><tr><th scope="col">Bonus</th><th scope="col">{s.name}</th><th scope="col">{other.name}</th></tr></thead><tbody>{economy.map((stat,i)=><tr key={stat.id}><th scope="row">{stat.name}</th><td>{percent(stat.value)}</td><td>{percent(speciesEconomy(other)[i].value)}</td></tr>)}</tbody></table>
      <div className="compare-traits">{[s,other].map((r,i)=><div key={r.id}><strong>Only {r.name}</strong><ul>{speciesTraits(r).filter(p=>![s,other][1-i].picks.includes(p.id)).map(p=><li key={p.id}><b>{p.name}</b><span>{traitDescription(p)}</span></li>)}</ul>{r.picks.every(id=>[s,other][1-i].picks.includes(id))&&<p>No exclusive traits.</p>}</div>)}</div>
      <p className="profile-note">{other.name}: {other.temperature} K · {other.gravity} g · {other.chemistry} · {other.medium} · {other.light} light. Shared traits are omitted from the differences above.</p>
    </>}</div>}
    <div className="profile-heading"><h3>Complete trait manifest</h3><span>{traits.length} traits</span></div>
    <div className="species-traits">{traits.map(p=><article key={p.id} data-trait={p.id} className={`species-trait trait-${p.category}`}><small>{p.category}</small><span className={`trait-price ${p.cost<0?'refund':''}`}>{p.cost<0?`${-p.cost} pt refund`:`${p.cost} pt`}</span><h4>{p.name}</h4><p>{traitDescription(p)}</p></article>)}</div>
  </section>;
}
