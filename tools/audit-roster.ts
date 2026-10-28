/** Screening, not a competitive balance certification. Run with pnpm exec tsx tools/audit-roster.ts. */
import {writeFileSync} from 'node:fs';
import {SPECIES} from '../packages/sim/src/species';
import {createGame,DEFAULT_OPTIONS} from '../packages/sim/src/generation';
import {processTurn,assertInvariants,score} from '../packages/sim/src/engine';
import {evaluatePicks} from '../packages/balance/src/picks';

const trials=[];
for(const subject of SPECIES) {
  const samples=[];
  for(let seed=0;seed<2;seed++) for(const seat of [0,1]) {
    // Neutral IDs remove the special Humans/Sol placement. Swap seats on each map.
    const roster=[{...SPECIES[0],id:'audit-reference'},{...subject,id:'audit-subject'}];
    if(seat===0) roster.reverse();
    let g=createGame({...DEFAULT_OPTIONS,seed:`roster-screen-${seed}`,region:'Random',size:'Small',players:2,speciesId:roster[0].id,turnLimit:90,approach:false,tutorial:false},roster);
    for(const e of g.empires){e.ai=true;e.defy=true;e.personality='Balanced';}
    while(g.winner===null&&g.turn<90){g=processTurn(g,[]);assertInvariants(g);}
    const own=score(g,seat),other=score(g,1-seat);
    samples.push({seed,seat,turn:g.turn,score:own,referenceScore:other,share:own/(own+other)});
  }
  const row={id:subject.id,name:subject.name,remaining:evaluatePicks(subject.picks).remaining,meanShare:samples.reduce((n,s)=>n+s.share,0)/samples.length,samples};
  trials.push(row);console.log(`${row.name}: ${(row.meanShare*100).toFixed(1)}% score share, ${row.remaining} points unspent`);
}
writeFileSync('docs/balance/roster-screen.json',JSON.stringify({method:'Two random maps, both seats, 90-turn limit, production Balanced AI against Humans with neutral IDs; four observations per species. Scores are screening signals, not win rates or proof of balance.',trials},null,2)+'\n');
