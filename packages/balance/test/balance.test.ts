import { test } from 'node:test';
import assert from 'node:assert/strict';
import { PICKS, SPECIALS, evaluatePicks, pickEffects } from '../src/picks.ts';
import { CONTROLLERS, random, simulate, summarize } from '../src/experiment.ts';

test('calibration replay is bit-identical for a seed and treatment', () => {
  const first = simulate(812421, 'balanced', ['subterranean', 'radiation-resistant']);
  const second = simulate(812421, 'balanced', ['subterranean', 'radiation-resistant']);
  assert.deepEqual(first, second);
  assert.notDeepEqual(first, simulate(812422, 'balanced', ['subterranean', 'radiation-resistant']));
});

test('random tape is reproducible and bounded', () => {
  const one = random(42), two = random(42);
  for (let index = 0; index < 1000; index++) {
    const value = one();
    assert.equal(value, two());
    assert.ok(value >= 0 && value < 1);
  }
});

test('all nine documented specials have an observable simulation hook', () => {
  assert.equal(SPECIALS.length, 9);
  for (const pick of SPECIALS) {
    const changes = [];
    for (const controller of CONTROLLERS) for (const seed of [812421, 820340, 828259, 836178]) {
      const baseline = simulate(seed, controller, pick.requires ?? []);
      const treatment = simulate(seed, controller, [pick.id, ...(pick.requires ?? [])]);
      changes.push(treatment.score - baseline.score);
      assert.ok(Number.isFinite(treatment.score));
      assert.ok(treatment.population >= 0);
    }
    assert.ok(changes.some(value => Math.abs(value) > 1e-8), `${pick.id} has no measurable hook`);
  }
});

test('Radiotrophic requires Resistant and exclusive options cannot be stacked', () => {
  assert.equal(evaluatePicks(['radiotrophic']).valid, false);
  const required = evaluatePicks(['radiotrophic', 'radiation-resistant'], 100);
  assert.equal(required.valid, true);
  assert.equal(evaluatePicks(['hive-mind', 'creative'], 100).valid, false);
  assert.equal(evaluatePicks(['hive-mind', 'technocracy'], 100).valid, false);
  assert.equal(evaluatePicks(['hive-mind', 'subterranean'], 100).valid, false);
  assert.equal(evaluatePicks(['synthetic', 'growth-fast'], 100).valid, false);
  assert.equal(evaluatePicks(['temperature-wide', 'temperature-narrow'], 100).valid, false);
});

test('duplicate picks cannot buy duplicate benefits', () => {
  assert.equal(evaluatePicks(['subterranean', 'subterranean'], 100).valid, false);
  assert.deepEqual(pickEffects(['industry-1', 'industry-1']), pickEffects(['industry-1']));
  assert.equal(evaluatePicks(['does-not-exist']).valid, false);
});

test('refunds never exceed six and cannot create a negative spent total', () => {
  const drawbacks = PICKS.filter(pick => pick.cost < 0).map(pick => pick.id);
  const budget = evaluatePicks(drawbacks, 10);
  assert.ok(budget.refund >= 0 && budget.refund <= 6);
  assert.equal(budget.refund, Math.min(6, budget.rawRefund));
  assert.ok(budget.spent >= 0);
});

test('aptitudes have convex costs and refunds are asymmetric after calibration', () => {
  for (const pick of PICKS.filter(pick => pick.category === 'aptitude' && pick.id.endsWith('-2'))) {
    const lower = PICKS.find(candidate => candidate.id === pick.id.replace(/-2$/, '-1'))!;
    const drawback = PICKS.find(candidate => candidate.id === pick.id.replace(/-2$/, '-minus'))!;
    assert.ok(pick.cost > lower.cost * 2);
    assert.ok(Math.abs(drawback.cost) < lower.cost || drawback.cost === 0);
  }
});

test('same-score reference picks have zero measured effect', () => {
  const baseline = simulate(42, 'balanced');
  for (const id of ['carbon', 'origin-standard', 'autocracy']) assert.deepEqual(simulate(42, 'balanced', [id]), baseline);
});

test('paired summary includes the observed mean and handles constant observations', () => {
  assert.deepEqual(summarize([3, 3, 3]), { n: 3, mean: 3, low: 3, high: 3 });
  const result = summarize([-1, 2, 4, 10]);
  assert.ok(result.low < result.mean && result.mean < result.high);
});
