import {test} from 'node:test';
import assert from 'node:assert/strict';
import {SPECIES} from '../packages/sim/src/species';
import {createGame,DEFAULT_OPTIONS} from '../packages/sim/src/generation';
import {habitability,capacity} from '../packages/sim/src/rules';
import {speciesEconomy,speciesTraits,traitDescription} from '../apps/web/src/species-profile';
import {readSpecies,readCustomSpecies} from '../apps/web/src/species-io';
import {evaluatePicks,PICKS} from '../packages/balance/src/picks';

test('every roster pick is represented, including level-one aptitudes and drawbacks',()=>{
  for(const s of SPECIES){
    assert.deepEqual(speciesTraits(s).map(p=>p.id),s.picks);
    for(const p of speciesTraits(s))assert.ok(traitDescription(p).length>10);
  }
  assert.match(traitDescription(speciesTraits(SPECIES.find(s=>s.id==='qelloth')!).find(p=>p.id==='growth-slow')!),/0.75/);
});
test('every predefined civilization spends the same full budget with a distinct legal kit',()=>{
  const kits=new Set<string>();
  for(const s of SPECIES){
    const budget=evaluatePicks(s.picks);
    assert.ok(budget.valid,`${s.name}: ${budget.errors.join(', ')}`);
    assert.equal(budget.remaining,0,s.name);
    const kit=[...s.picks].sort().join(',');assert.ok(!kits.has(kit),s.name);kits.add(kit);
  }
});
test('stronger tiers cost more and ignored drawbacks cannot buy extra abilities',()=>{
  const cost=(id:string)=>PICKS.find(p=>p.id===id)!.cost;
  for(const [weaker,stronger] of [['growth-fast','growth-very-fast'],['lifespan-long','lifespan-ancient']])assert.ok(cost(stronger)>cost(weaker));
  assert.ok(cost('growth-very-slow')<cost('growth-slow'));
  assert.ok(cost('lifespan-ephemeral')<cost('lifespan-short'));
  for(const picks of [['hive-mind','stability-minus'],['hive-mind','stability-2'],['synthetic','growth-very-slow'],['lithic','industry-2'],['lithic','radiation-resistant'],['synthetic','sealed-metabolism']])assert.equal(evaluatePicks(picks,100).valid,false,picks.join(','));
  for(const p of PICKS.filter(p=>p.draftCost>0||p.category==='special'))assert.ok(p.cost>0,p.id);
});
test('apparently identical Electrosense civilizations show distinct combined bonuses',()=>{
  const values=(id:string)=>speciesEconomy(SPECIES.find(s=>s.id===id)!).map(v=>Math.round(v.value*100));
  assert.deepEqual(values('vael'),[0,45,-10]);
  assert.deepEqual(values('corundi'),[40,25,15]);
  assert.deepEqual(values('skethi'),[0,65,-10]);
  assert.deepEqual(values('myriad'),[20,-10,0]);
});
test('amphibious aquatic civilizations receive their promised dry-land access without bypassing other hazards',()=>{
  for(const id of ['oolu','ulqua','seren']){
    const s=SPECIES.find(s=>s.id===id)!;
    const g=createGame({...DEFAULT_OPTIONS,speciesId:id,players:2},SPECIES);
    const e=g.empires[0];
    const p={...g.systems.flatMap(st=>st.planets).find(p=>p.id===e.capital)!,water:0,kind:'rocky' as const};
    assert.equal(habitability(p,s,e).rating,0,id);
    assert.equal(capacity(p,s,e),12.5,id);
    const unadapted={...s,picks:s.picks.filter(p=>p!=='amphibious')};
    assert.equal(habitability(p,unadapted,e).axes[4],3);
    assert.equal(capacity(p,unadapted,e),1.875);
    assert.equal(habitability({...p,pressure:0},s,e).rating,3);
    assert.equal(habitability({...p,chemistry:'Oxygen'},s.chemistry==='Oxygen'?{...s,chemistry:'Reducing'}:s,e).rating,3);
    assert.equal(habitability({...p,kind:'gas'},s,e).rating,5);
    assert.equal(habitability({...p,water:1}, {...s,medium:'Land'},e).axes[4],0);
  }
});

test('over-budget custom designs remain editable without hiding other valid designs',()=>{
  const valid={...SPECIES[0],id:'custom-valid',picks:['carbon','autocracy']};
  const expensive={...valid,id:'custom-expensive',picks:['carbon','autocracy','industry-2','research-2','commerce-2','subterranean']};
  const raw=JSON.stringify([expensive,{bad:'data'},valid]);
  assert.deepEqual(readCustomSpecies(raw).map(s=>s.id),['custom-valid']);
  assert.deepEqual(readCustomSpecies(raw,{allowOverBudget:true}).map(s=>s.id),['custom-expensive','custom-valid']);
  assert.throws(()=>readSpecies(expensive));
  assert.equal(readSpecies(expensive,{allowOverBudget:true}).id,'custom-expensive');
  assert.throws(()=>readSpecies({...expensive,picks:['carbon','hive-mind','subterranean']},{allowOverBudget:true}));
  assert.deepEqual(readSpecies({...expensive,picks:['synthetic','sealed-metabolism']},{forEditing:true}).picks,['synthetic','sealed-metabolism']);
  assert.throws(()=>readSpecies({...expensive,picks:['unknown-trait']},{forEditing:true}));
});
