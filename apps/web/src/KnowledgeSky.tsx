import {FIELDS,TECHS} from '../../../packages/sim/src/rules';
import type {Empire} from '../../../packages/sim/src/types';
const colors=['#7ddcff','#ffc982','#a9baff','#9df5b6','#d4a0ff','#ffb4d8'];
/** A lasting picture of acquired knowledge, with every star linked to an actual technology. */
export function KnowledgeSky({empire}:{empire:Empire}){
 return <div className="knowledge-sky"><div className="knowledge-caption"><span>YOUR UNIVERSE OF KNOWLEDGE</span><strong>{empire.techs.length} {empire.techs.length===1?'discovery':'discoveries'}</strong></div><svg viewBox="0 0 960 220" role="img" aria-label={`${empire.techs.length} technologies discovered across six research fields`}>
 <defs><filter id="knowledge-glow"><feGaussianBlur stdDeviation="3"/></filter></defs>
 {FIELDS.map((field,index)=>{const list=TECHS.filter(t=>t.field===field);return <g key={field} style={{'--field-color':colors[index]} as React.CSSProperties}>
 <path d={`M ${80+index*160} 181 L ${80+index*160} 25`} stroke={colors[index]} opacity=".2"/>
 {list.map((tech,i)=>{const y=172-(tech.tier-1)*17,x=80+index*160+Math.sin(i*2.4)*((i%3)*13+13),done=empire.techs.includes(tech.id),queued=empire.research.includes(tech.id);return <g key={tech.id} className={done?'knowledge-star known':queued?'knowledge-star seeking':'knowledge-star'}><title>{tech.name} — {done?'Discovered':queued?'Research queued':'Undiscovered'}</title><path d={`M ${80+index*160} ${y+17} L ${x} ${y} L ${80+index*160} ${y-17}`} fill="none" stroke={colors[index]} opacity={done?.7:.08}/>{done&&<circle cx={x} cy={y} r="6" fill={colors[index]} opacity=".7" filter="url(#knowledge-glow)"/>}<circle cx={x} cy={y} r={done?3.5:queued?3:1.8} fill={done?'#f0f6ff':colors[index]} opacity={done||queued?1:.25}/>{queued&&<circle className="research-orbit" cx={x} cy={y} r="7" fill="none" stroke={colors[index]} strokeDasharray="6 5"/>}</g>;})}<text x={80+index*160} y="209" textAnchor="middle" fill={colors[index]} fontSize="11">{field}</text></g>;})}
 </svg></div>;
}
