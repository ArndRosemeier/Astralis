import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { PICKS } from './picks.ts';
import { CONTROLLERS, random, simulate, summarize, treatmentIds } from './experiment.ts';

const root = fileURLToPath(new URL('../../../', import.meta.url));
const option = process.argv.indexOf('--seeds');
const seedCount = option >= 0 ? Number(process.argv[option + 1]) : 128;
if (!Number.isInteger(seedCount) || seedCount < 16 || seedCount > 4096) throw new Error('--seeds must be an integer between 16 and 4096');
const baseSeed = 812421;
const seeds = Array.from({ length: seedCount }, (_, index) => baseSeed + index * 7919);
const started = performance.now();
const baseline = new Map<string, ReturnType<typeof simulate>>();
const sample = (seed: number, controller: typeof CONTROLLERS[number], ids: string[]) => {
  const key = `${seed}:${controller}:${[...ids].sort().join(',')}`;
  let value = baseline.get(key);
  if (!value) { value = simulate(seed, controller, ids); baseline.set(key, value); }
  return value;
};
const measurements = PICKS.map(pick => {
  const changes: number[] = [];
  const wins: number[] = [];
  const byController = CONTROLLERS.map(controller => {
    const deltas = seeds.map(seed => {
      const reference = sample(seed, controller, pick.requires ?? []);
      const treatment = sample(seed, controller, treatmentIds(pick.id));
      const delta = (treatment.score / reference.score - 1) * 100;
      changes.push(delta);
      wins.push(treatment.score > reference.score ? 1 : treatment.score < reference.score ? 0 : .5);
      return delta;
    });
    return { controller, ...summarize(deltas) };
  });
  // Controllers share a map seed: average them within seed before computing the interval.
  // This avoids pretending seven correlated controller outcomes are independent samples.
  const seedMeans = seeds.map((_, index) => CONTROLLERS.reduce((sum, __, controllerIndex) => sum + changes[controllerIndex * seedCount + index]!, 0) / CONTROLLERS.length);
  const seedWins = seeds.map((_, index) => CONTROLLERS.reduce((sum, __, controllerIndex) => sum + wins[controllerIndex * seedCount + index]!, 0) / CONTROLLERS.length);
  const stats = summarize(seedMeans);
  const drawback = pick.draftCost < 0;
  // One point buys ~5% score improvement. The diminishing scale prevents a map-specific outlier
  // from consuming the whole budget; it is a calibration convention, not a statistical discovery.
  const pointValue = Math.max(0, stats.mean);
  let cost = pointValue < .35 ? 0 : Math.max(1, Math.round(Math.log1p(pointValue / 100) / Math.log(1.05)));
  if (pick.draftCost > 0 || pick.category === 'special') cost = Math.max(1, cost);
  if (drawback) {
    const leastHarmful = Math.max(0, Math.min(...byController.map(result => -result.mean)));
    cost = -Math.min(4, Math.floor(Math.log1p(leastHarmful / 100) / Math.log(1.05) * .65));
  }
  if (['carbon', 'origin-standard', 'autocracy'].includes(pick.id)) cost = 0;
  return { id: pick.id, name: pick.name, category: pick.category, draftCost: pick.draftCost, cost,
    scorePercent: stats, pairedWinFraction: summarize(seedWins), byController,
    status: stats.low <= 0 && stats.high >= 0 && !['carbon', 'origin-standard', 'autocracy'].includes(pick.id) ? 'uncertain' : 'measured' };
});

// Convex +2 aptitude prices and asymmetric refunds are explicit design constraints.
for (const result of measurements.filter(result => result.id.endsWith('-2') && result.category === 'aptitude')) {
  const first = measurements.find(candidate => candidate.id === result.id.replace(/-2$/, '-1'))!;
  result.cost = Math.max(result.cost, first.cost * 2 + 1);
}
for (const result of measurements.filter(result => result.id.endsWith('-minus'))) {
  const first = measurements.find(candidate => candidate.id === result.id.replace(/-minus$/, '-1'))!;
  result.cost = -Math.min(Math.abs(result.cost), Math.max(0, first.cost - 1));
}
const specials = PICKS.filter(pick => pick.category === 'special');
const interactionSeeds = seeds.slice(0, Math.min(seedCount, 64));
const interactions = [];
for (let a = 0; a < specials.length; a++) {
  for (let b = a + 1; b < specials.length; b++) {
    const left = specials[a]!, right = specials[b]!;
    if (left.excludes?.includes(right.id) || right.excludes?.includes(left.id)) continue;
    const required = [...new Set([...(left.requires ?? []), ...(right.requires ?? [])])];
    const residuals: number[] = [];
    for (const controller of CONTROLLERS) for (const seed of interactionSeeds) {
      const reference = sample(seed, controller, required).score;
      const first = sample(seed, controller, [...required, left.id]).score;
      const second = sample(seed, controller, [...required, right.id]).score;
      const combined = sample(seed, controller, [...required, left.id, right.id]).score;
      residuals.push((combined - first - second + reference) / reference * 100);
    }
    const seedResiduals = interactionSeeds.map((_, index) => CONTROLLERS.reduce((sum, __, controllerIndex) => sum + residuals[controllerIndex * interactionSeeds.length + index]!, 0) / CONTROLLERS.length);
    const stats = summarize(seedResiduals);
    interactions.push({ picks: [left.id, right.id], scoreResidualPercent: stats,
      flagged: stats.low > 5 || stats.high < -5 });
  }
}

// Randomized budgets exercise exclusivity/refund behavior, not species identities.
const rng = random(0xbad571);
let finiteChecks = 0;
for (let index = 0; index < 100; index++) {
  const ids = specials.filter(() => rng() < .22).flatMap(pick => treatmentIds(pick.id));
  const result = simulate(baseSeed + index, CONTROLLERS[index % CONTROLLERS.length]!, [...new Set(ids)]);
  if (!Number.isFinite(result.score) || result.population < 0 || result.colonies < 1) throw new Error('Combination invariant failed');
  finiteChecks++;
}
const costs = Object.fromEntries(measurements.map(result => [result.id, result.cost]));
const report = {
  schemaVersion: 1, method: 'paired-seed reduced 4X economy/expansion/conflict simulation',
  disclaimer: 'Research calibration only. Production-engine validation is required before declaring release balance.',
  baseSeed, seedCount, turnsPerRun: 120, controllers: CONTROLLERS, ecologicalRegimes: 5,
  uniqueSimulationRuns: baseline.size, pairedComparisons: measurements.length * seedCount * CONTROLLERS.length,
  specialInteractionPairs: interactions.length, interactionSeeds: interactionSeeds.length,
  invariantChecks: finiteChecks, elapsedSeconds: Number(((performance.now() - started) / 1000).toFixed(3)),
  measurements, interactions, costs,
};
mkdirSync(root + 'docs/balance', { recursive: true });
writeFileSync(root + 'docs/balance/calibration.json', JSON.stringify(report, null, 2) + '\n');
const protectedFinalPrices = existsSync(root + 'docs/balance/final-prices.json');
const costOutput = protectedFinalPrices ? 'research-costs.ts' : 'costs.ts';
writeFileSync(root + 'packages/balance/src/' + costOutput, '// Generated by calibrate.ts. Paired-seed research estimates; see docs/balance/calibration.json.\nexport const CALIBRATED_COSTS: Record<string, number> = ' + JSON.stringify(costs, null, 2) + ';\n');
if (protectedFinalPrices) console.log('Final production prices preserved; proxy estimates written separately to research-costs.ts.');
const percentage = (number: number) => `${number >= 0 ? '+' : ''}${number.toFixed(2)}%`;
const table = measurements.map(result => `| ${result.name} | ${result.draftCost} | ${result.cost} | ${percentage(result.scorePercent.mean)} | ${percentage(result.scorePercent.low)} … ${percentage(result.scorePercent.high)} | ${result.status} |`).join('\n');
const flagged = interactions.filter(result => result.flagged).map(result => `- **${result.picks.join(' + ')}**: residual ${percentage(result.scoreResidualPercent.mean)} (95% interval ${percentage(result.scoreResidualPercent.low)} … ${percentage(result.scoreResidualPercent.high)}).`).join('\n') || 'No special pair crossed the predeclared ±5 percentage-point interaction threshold.';
writeFileSync(root + 'docs/balance/results.md', `# Species pick calibration — before the roster\n\nThis experiment was completed before predefined species were constructed. It is a reduced research simulation, **not proof that the complete game is balanced**.\n\n- Seed: ${baseSeed}; ${seedCount} paired seeds per controller; ${CONTROLLERS.length} controllers; 120 turns per run.\n- ${baseline.size.toLocaleString('en-US')} distinct runs, ${report.pairedComparisons.toLocaleString('en-US')} individual-pick comparisons.\n- All ${interactions.length} valid pairs among the nine specials sampled on ${interactionSeeds.length} seeds × ${CONTROLLERS.length} controllers.\n- ${finiteChecks} random-combination finite-state checks passed.\n- Run time: ${report.elapsedSeconds} seconds.\n\n## Point convention\n\nPositive numbers spend points; negative numbers refund. One point corresponds to roughly a 5% multiplicative increase in terminal score, rounded to an integer. Refunds are 65% of the least-harmed controller's loss, rounded down, at most four per drawback and six in total. A +2 aptitude costs at least twice +1 plus one. Autocracy, Carbon and Standard origin define the zero-cost reference. Uncertain picks retain a minimum provisional special cost of one. These are design constraints, explicitly distinguished from measurements.\n\n| Pick | Draft cost | Measured cost | Mean score change | 95% paired interval | Status |\n|---|---:|---:|---:|---|---|\n${table}\n\n## Pair interactions\n\n${flagged}\n\n## Interpretation\n\nAn interval entirely above zero means the pick improved this simulator's score under these scenarios. Paired win fraction means a higher terminal score than the seed-matched reference; it is not the competitive win rate of the production game. Ecology, controller mix, score weights and simplified opponents can all bias the estimates. Inspect the machine-readable per-controller results before changing a refund.\n\nSee [methodology](methodology.md) and [complete measurements](calibration.json). Re-run against the completed production engine before a release claim.\n`);
console.log(JSON.stringify({ uniqueRuns: baseline.size, comparisons: report.pairedComparisons, interactionPairs: interactions.length, elapsedSeconds: report.elapsedSeconds, uncertain: measurements.filter(result => result.status === 'uncertain').map(result => result.id), flaggedPairs: interactions.filter(result => result.flagged), costs }, null, 2));
