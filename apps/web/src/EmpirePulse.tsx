import type {Empire,GameState} from '../../../packages/sim/src/types';
import {colonies,output} from '../../../packages/sim/src/rules';

export function EmpirePulse({game,empire}:{game:GameState;empire:Empire}){
 const worlds=colonies(game,empire.id);
 const yields=worlds.map(p=>({id:p.id,name:p.name,...output(game,p,empire)}));
 const max=Math.max(1,...yields.map(p=>Math.max(p.industry,p.research,Math.max(0,p.credits))));
 return <section className="empire-pulse" aria-label="Colony output comparison"><div className="pulse-heading"><div><div className="eyebrow">THE PULSE OF YOUR CIVILIZATION</div><h3>Worlds at work</h3></div><p><span className="industry-key">● Industry</span><span className="research-key">● Research</span><span className="credits-key">● Net credits</span></p></div><div className="yield-worlds">{yields.map(p=><article key={p.id}><strong>{p.name}</strong>{(['industry','research','credits'] as const).map(key=><div className={'yield-line '+key} key={key}><span>{key==='credits'?'Net credits':key}</span><div className="yield-track"><i style={{width:`${Math.max(0,p[key])/max*100}%`}}/></div><b>{p[key].toFixed(1)}</b></div>)}</article>)}</div><p className="hint">Output per turn · bars share one scale · negative credits indicate colony upkeep exceeds income.</p></section>;
}
