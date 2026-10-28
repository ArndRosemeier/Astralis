/** Narrow light-profile revision audit. Keeps the complete 576-game report untouched. */
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { runProduction, sourceFingerprint, type ProductionOptions } from './production.ts';
import { summarize } from './experiment.ts';
import { PICK_COSTS } from './picks.ts';

const pointCost = (percent: number) => Math.max(1, Math.round(Math.log1p(Math.max(0, percent) / 100) / Math.log(1.05)));
export function photoMain() {
  const root = fileURLToPath(new URL('../../../', import.meta.url));
  const full = JSON.parse(readFileSync(root + 'docs/balance/production.json', 'utf8'));
  if (full.seedCount !== 24 || full.measurements.length !== 9) throw new Error('The preserved complete 24-seed production report is required.');
  const conditions: ProductionOptions[] = full.baselines.map((trial: any) => ({ seed: trial.seed, style: trial.style, region: trial.region, turns: full.turns }));
  const sourceAtStart = sourceFingerprint();
  const changedSinceFullAudit = [...new Set([...Object.keys(full.sourceAtEnd), ...Object.keys(sourceAtStart)])].filter(file => full.sourceAtEnd[file] !== sourceAtStart[file]);
  const started = performance.now();
  const comparisons = [];
  const trials = [];
  let checkedTurns = 0, battles = 0;
  for (let index = 0; index < conditions.length; index++) {
    const condition = conditions[index]!;
    const reference = runProduction(condition);
    checkedTurns += reference.turnsChecked; battles += reference.observedBattles;
    trials.push(reference);
    const seats = [];
    for (const seat of [0, 1]) {
      const result = runProduction({ ...condition, picks: ['photosynthetic'], seat });
      checkedTurns += result.turnsChecked; battles += result.observedBattles;
      trials.push(result);
      const own = result.outcomes[seat]!, base = reference.outcomes[seat]!;
      seats.push({ seat, scorePercent: (own.score / Math.max(1, base.score) - 1) * 100, populationPercent: (own.population / Math.max(.01, base.population) - 1) * 100, winChange: Number(result.winner === seat) - Number(reference.winner === seat), won: result.winner === seat });
    }
    comparisons.push({ seed: condition.seed, style: condition.style, region: condition.region, seats, scorePercent: seats.reduce((sum, value) => sum + value.scorePercent, 0) / 2, populationPercent: seats.reduce((sum, value) => sum + value.populationPercent, 0) / 2, winChange: seats.reduce((sum, value) => sum + value.winChange, 0) / 2 });
    if ((index + 1) % 6 === 0) console.log(`Light-profile validation: ${index + 1}/24 paired seeds complete.`);
  }
  const sourceAtEnd = sourceFingerprint();
  if (JSON.stringify(sourceAtStart) !== JSON.stringify(sourceAtEnd)) throw new Error('Simulation source changed during light-profile validation; prices were not touched.');
  const scorePercent = summarize(comparisons.map(comparison => comparison.scorePercent));
  const populationPercent = summarize(comparisons.map(comparison => comparison.populationPercent));
  const winChange = summarize(comparisons.map(comparison => comparison.winChange));
  const oldCost = PICK_COSTS.photosynthetic!;
  const intervalPrices = [pointCost(scorePercent.low), pointCost(scorePercent.high)];
  // Retain a supported integer instead of churn within the sampling uncertainty. Move the
  // price only if the earlier integer lies outside the entire mapped 95% interval.
  const cost = oldCost >= intervalPrices[0]! && oldCost <= intervalPrices[1]! ? oldCost : pointCost(scorePercent.mean);
  const report = { schemaVersion: 1, scope: 'Photosynthetic only after explicit planet.light revision', preservedFullAudit: 'production.json', fullAuditGames: full.games, seedCount: conditions.length, games: trials.length, checkedTurns, observedBattles: battles, elapsedSeconds: (performance.now() - started) / 1000, sourceAtStart, sourceAtEnd, sourceFilesChangedDuringRun: false, changedSinceFullAudit, oldCost, cost, intervalPrices, scorePercent, populationPercent, winChange, actualWinFraction: comparisons.flatMap(comparison => comparison.seats).filter(seat => seat.won).length / (conditions.length * 2), comparisons, trials,
    interpretation: 'The earlier full 576-game audit remains intact. These 72 games validate only the light-profile-dependent Photosynthetic revision; other special estimates are retained from that earlier source revision. An existing integer price is retained when inside the mapped 95% score interval; otherwise the rounded mean mapping is applied. This is finite neutral-profile evidence, not a universal balance proof.' };
  writeFileSync(root + 'docs/balance/photo-validation.json', JSON.stringify(report, null, 2) + '\n');
  const status = cost === oldCost ? 'retained' : 'changed';
  const text = `# Photosynthetic — explicit light-profile validation\n\nThe original complete 576-game experiment is preserved unchanged in [production.json](production.json). After the engine added explicit planetary light profiles, this **72-game** focused replication repeated the same 24 paired map seeds and both treatment seats. It completed **${checkedTurns.toLocaleString('en-US')} invariant-checked turns and ${battles} battles**, with unchanged source throughout the run.\n\n- Mean paired score change: **${scorePercent.mean.toFixed(2)}%**; 95% seed interval **${scorePercent.low.toFixed(2)}% … ${scorePercent.high.toFixed(2)}%**.\n- Actual treatment win fraction: ${(report.actualWinFraction * 100).toFixed(2)}%.\n- Photosynthetic price: **${cost} points**, ${status} from ${oldCost}. The existing integer is retained if it lies within the score interval mapped to whole point prices; otherwise the rounded-mean mapping applies.\n- Runtime: ${report.elapsedSeconds.toFixed(1)} seconds.\n\n## Source-revision boundary\n\nChanged files relative to the full experiment: ${changedSinceFullAudit.map(file => '`' + file + '`').join(', ')}. Full SHA-256 fingerprints are recorded in [photo-validation.json](photo-validation.json). Planet light now comes from actual stellar illumination, including individual hosts in multiple-star systems, while homeworld Gardener infrastructure matches its native profile. Habitability, growth and upkeep therefore consistently use explicit Dim/Normal/Bright lighting rather than tidal locking.\n\nThis narrowly updates the Photosynthetic evidence. It does not relabel the earlier eight-special measurements as having been rerun against the new source. Frame/profile interactions and human exploitation remain outside the finite sample.\n`;
  writeFileSync(root + 'docs/balance/photo-validation.md', text);
  if (cost !== oldCost) {
    const costs = { ...PICK_COSTS, photosynthetic: cost };
    writeFileSync(root + 'packages/balance/src/costs.ts', '// Final special prices; full audit plus targeted explicit-light revision.\n// See docs/balance/final-prices.json and photo-validation.json.\nexport const CALIBRATED_COSTS: Record<string, number> = ' + JSON.stringify(costs, null, 2) + ';\n');
  }
  const final = JSON.parse(readFileSync(root + 'docs/balance/final-prices.json', 'utf8'));
  const previous = final.decisions.find((decision: any) => decision.id === 'photosynthetic');
  final.targetedRevisions ??= [];
  final.targetedRevisions.push({ trait: 'photosynthetic', report: 'photo-validation.json', oldCost, cost, previousDecision: previous, sourceAtPricing: sourceAtEnd, games: report.games, checkedTurns, scorePercent });
  final.costs.photosynthetic = cost;
  final.decisions = final.decisions.map((decision: any) => decision.id === 'photosynthetic' ? { ...decision, cost, meanScorePercent: scorePercent.mean, confidence95Percent: [scorePercent.low, scorePercent.high], indicativePointInterval: intervalPrices, actualWinFraction: report.actualWinFraction, evidence: 'photo-validation.json', explanation: 'Explicit-light revision validated in a separate 72-game pass. Supported integer prices are retained within sampling uncertainty.' } : decision);
  writeFileSync(root + 'docs/balance/final-prices.json', JSON.stringify(final, null, 2) + '\n');
  const finalMarkdown = readFileSync(root + 'docs/balance/final-prices.md', 'utf8');
  const row = `| photosynthetic | ${oldCost} | **${cost}** | ${scorePercent.mean.toFixed(2)}% | ${scorePercent.low.toFixed(2)}% … ${scorePercent.high.toFixed(2)}% | Explicit-light revision; separate 72-game validation. |`;
  writeFileSync(root + 'docs/balance/final-prices.md', finalMarkdown.replace(/^\| photosynthetic \|.*$/m, row) + '\n## Targeted light-profile revision\n\nPhotosynthetic was subsequently validated in a separate 72-game pass after explicit planetary lighting was added. Its current row uses that later result; the other eight rows retain the earlier full 576-game source revision. See [the source boundary and measurements](photo-validation.md).\n');
  console.log(JSON.stringify({ games: report.games, checkedTurns, observedBattles: battles, elapsedSeconds: report.elapsedSeconds, oldCost, cost, scorePercent, changedSinceFullAudit }, null, 2));
  return report;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  try { photoMain(); } catch (error) { console.error(error); process.exitCode = 1; }
}
