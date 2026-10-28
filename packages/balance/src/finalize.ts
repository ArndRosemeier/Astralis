/** Apply special prices from the last frozen-engine production experiment. */
import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { PICKS } from './picks.ts';

const root = fileURLToPath(new URL('../../../', import.meta.url));
const report = JSON.parse(readFileSync(root + 'docs/balance/production.json', 'utf8'));
if (report.seedCount < 24 || report.sourceFilesChangedDuringRun || report.measurements.length !== 9) throw new Error('Final pricing requires the complete, unchanged 24-seed production audit.');
for (const [key, digest] of Object.entries(report.sourceAtEnd) as [string, string][]) {
  const prefixed = key.includes('/');
  const relative = prefixed ? key.replace(/^(ai|catalog|balance|sim)\//, '$1/src/') : 'sim/src/' + key;
  const current = createHash('sha256').update(readFileSync(root + 'packages/' + relative)).digest('hex');
  if (current !== digest) throw new Error('Source changed after the production audit: ' + key);
}
const pointCost = (percent: number) => Math.max(0, Math.round(Math.log1p(Math.max(0, percent) / 100) / Math.log(1.05)));
const prior = Object.fromEntries(PICKS.map(pick => [pick.id, pick.cost]));
const costs = { ...prior };
const decisions = report.measurements.map((result: any) => {
  const mean = result.scorePercent.mean as number;
  const low = result.scorePercent.low as number;
  const high = result.scorePercent.high as number;
  let price = Math.max(1, pointCost(mean));
  let explanation = 'Mean-score price with a provisional one-point minimum; finite neutral-profile evidence is not universal balance.';
  if (result.id === 'hive-mind') { price = Math.max(4, price); explanation = 'Retain at least four points conservatively for immunity and Unified package; the documented incompatible Subterranean pair is excluded.'; }
  if (result.id === 'cybernetic' && high < 0) { price = 0; explanation = 'Zero-point sidegrade: extra upkeep outweighed repair/troop utility in these games. No refund is granted, since military/human exploitation remains uncertain.'; }
  costs[result.id] = price;
  return { id: result.id, oldCost: prior[result.id], cost: price, meanScorePercent: mean, confidence95Percent: [low, high], indicativePointInterval: [pointCost(low), pointCost(high)], actualWinFraction: result.actualWinFraction, explanation };
});
const evidence = { schemaVersion: 1, scope: 'Nine specials; other picks retain the pre-roster research calibration', games: report.games, checkedTurns: report.checkedTurns, observedBattles: report.observedBattles, seedCount: report.seedCount, sourceAtPricing: report.sourceAtEnd, decisions, costs, exclusions: [['subterranean', 'hive-mind']], limitations: ['The price convention is a game-design choice, not a statistically unique integer.', 'Confidence intervals cover sampled neutral Carbon/Autocracy/Oxygen profile games only; model error, frame/environment interactions and human exploits remain.', 'Special pairs with significant super-additive effects are handled by D49 availability constraints rather than pretending individual prices make them additive.', 'Frame, origin, government and aptitude prices still come from the explicitly labeled pre-roster research simulator; these are not falsely labeled as production-calibrated.', 'Editing predefined species after pricing changes the source fingerprint but does not change the neutral reference profile used in the experiment. New mechanical or AI changes require new validation.'] };
writeFileSync(root + 'packages/balance/src/costs.ts', '// Final special overrides from the frozen production audit; other prices retain research estimates.\n// See docs/balance/final-prices.json. Re-run production.ts and finalize.ts after mechanical changes.\nexport const CALIBRATED_COSTS: Record<string, number> = ' + JSON.stringify(costs, null, 2) + ';\n');
writeFileSync(root + 'docs/balance/final-prices.json', JSON.stringify(evidence, null, 2) + '\n');
const rows = decisions.map((decision: any) => `| ${decision.id} | ${decision.oldCost} | **${decision.cost}** | ${decision.meanScorePercent.toFixed(2)}% | ${decision.confidence95Percent.map((value: number) => value.toFixed(2) + '%').join(' … ')} | ${decision.explanation} |`).join('\n');
writeFileSync(root + 'docs/balance/final-prices.md', `# Applied special prices\n\nThese prices are active in the game, following the initial pre-roster research calibration and the final frozen-engine experiment: **${report.games} actual games, ${report.checkedTurns.toLocaleString('en-US')} invariant-checked turns, ${report.observedBattles} observed battles and ${report.seedCount} independent paired seeds**, both treatment seats. All simulation TS/JSON modules, the controller, catalog and pick data are fingerprinted in [the machine-readable decision](final-prices.json).\n\nThe convention is one point per roughly 5% multiplicative terminal-score increase, rounded, with conservative provisional floors. A zero-point sidegrade does not refund points. Hive mind and Subterranean remain mutually exclusive under [D49](decision-D49.md).\n\n| Special | Prior price | Applied price | Mean paired score | 95% seed interval | Decision |\n|---|---:|---:|---:|---|---|\n${rows}\n\n## Limits\n\n${evidence.limitations.map((line: string) => '- ' + line).join('\n')}\n\nThe research command preserves this final table rather than silently overwriting special prices with the older proxy model. A deliberate new production pricing pass must first complete the full frozen-source experiment.\n`);
console.log(JSON.stringify({ applied: decisions, games: report.games, checkedTurns: report.checkedTurns }, null, 2));
