/** Paired-seed validation against the actual game engine, after the pre-roster experiment. */
import { mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { createGame, DEFAULT_OPTIONS } from '../../sim/src/generation.ts';
import { assertInvariants, processTurn, score } from '../../sim/src/engine.ts';
import { colonies, VERSION } from '../../sim/src/rules.ts';
import type { Command, Focus, GameState, Species } from '../../sim/src/types.ts';
import { SPECIALS } from './picks.ts';
import { summarize } from './experiment.ts';

export const PRODUCTION_STYLES = ['Balanced', 'Expansionist', 'Scholar', 'Militarist', 'Trader', 'Diplomat'] as const;
export type ProductionStyle = typeof PRODUCTION_STYLES[number];
export type ProductionOptions = { seed: string; style: ProductionStyle; picks?: string[]; seat?: number; turns?: number; region?: 'Sol' | 'Random' };
const neutral = (index: number): Species => ({ id: `reference-${index}`, name: `Reference ${index}`, epithet: 'Calibration reference', lore: '', color: index ? '#dca66c' : '#6ee7d0', frame: 'Carbon', temperature: 290, gravity: 1, chemistry: 'Oxygen', medium: 'Land', light: 'Normal', government: 'Autocracy', picks: ['carbon', 'autocracy'] });

export function productionFixture(options: ProductionOptions): GameState {
  const roster = [neutral(0), neutral(1)];
  const treated = roster[options.seat ?? 0]!;
  treated.picks.push(...(options.picks ?? []));
  if (treated.picks.includes('hive-mind')) {
    treated.government = 'Unified';
    treated.picks = treated.picks.filter(id => id !== 'autocracy');
  }
  const state = createGame({ ...DEFAULT_OPTIONS, seed: options.seed, size: 'Small', players: 2, speciesId: roster[0]!.id, turnLimit: options.turns ?? 120, approach: false, tutorial: false, region: options.region ?? 'Sol' }, roster);
  for (const empire of state.empires) {
    empire.ai = true;
    empire.personality = options.style;
    // A two-player Concord can end an ecological comparison long before 120 turns.
    // Use the actual documented Defy order rather than suppressing victory logic.
    empire.defy = true;
  }
  return state;
}

export function controllerOrders(state: GameState, style: ProductionStyle): Command[] {
  // The production controller now implements the personality policies itself. Supplemental
  // orders would override its low-population growth and treasury safeguards in some turns.
  // Keep this adapter API for reproducible old callers while running the real in-game AI only.
  return [];
}

export function runProduction(options: ProductionOptions) {
  let state = productionFixture(options);
  const limit = options.turns ?? 120;
  let turnsChecked = 0;
  let observedBattles = 0;
  let totalTechs = 0;
  const battleIds = new Set<string>();
  assertInvariants(state);
  while (state.winner === null && state.turn < limit) {
    state = processTurn(state, controllerOrders(state, options.style));
    assertInvariants(state);
    turnsChecked++;
    for (const battle of state.battles) if (!battleIds.has(battle.id)) { battleIds.add(battle.id); observedBattles++; }
  }
  const outcomes = state.empires.map(empire => {
    const worlds = colonies(state, empire.id);
    totalTechs += empire.techs.length;
    return { seat: empire.id, score: score(state, empire.id), population: worlds.reduce((sum, planet) => sum + planet.population, 0), colonies: worlds.length, techs: empire.techs.length, credits: empire.credits, ships: state.fleets.filter(fleet => fleet.owner === empire.id).reduce((sum, fleet) => sum + fleet.ships.length, 0), known: empire.known.length, eliminated: empire.eliminated };
  });
  return { seed: options.seed, style: options.style, picks: options.picks ?? [], treatmentSeat: options.seat ?? 0, region: options.region ?? 'Sol', turnsChecked, winner: state.winner, victory: state.victory, observedBattles, totalTechs, outcomes, finalHash: state.history.at(-1)?.hash };
}

type Trial = ReturnType<typeof runProduction>;
export function sourceFingerprint() {
  const files = readdirSync(new URL('../../sim/src/', import.meta.url), { recursive: true }).map(String).filter(file => /\.(?:ts|json)$/.test(file)).sort();
  return Object.fromEntries([
    ...files.map(file => [file, createHash('sha256').update(readFileSync(new URL(`../../sim/src/${file}`, import.meta.url))).digest('hex')]),
    ['ai/controller.ts', createHash('sha256').update(readFileSync(new URL('../../ai/src/controller.ts', import.meta.url))).digest('hex')],
    ['sim/rules-data.json', createHash('sha256').update(readFileSync(new URL('../../sim/src/rules-data.json', import.meta.url))).digest('hex')],
    ['catalog/systems.json', createHash('sha256').update(readFileSync(new URL('../../catalog/src/systems.json', import.meta.url))).digest('hex')],
    ['catalog/planets.json', createHash('sha256').update(readFileSync(new URL('../../catalog/src/planets.json', import.meta.url))).digest('hex')],
    ['balance/costs.ts', createHash('sha256').update(readFileSync(new URL('./costs.ts', import.meta.url))).digest('hex')],
    ['balance/picks.ts', createHash('sha256').update(readFileSync(new URL('./picks.ts', import.meta.url))).digest('hex')],
  ]);
}

export async function productionMain(args = process.argv.slice(2)) {
  const option = (name: string, fallback: string) => { const index = args.indexOf(name); return index >= 0 ? args[index + 1]! : fallback; };
  const seedCount = Number(option('--seeds', '24'));
  const turns = Number(option('--turns', '120'));
  const reportPrefix = option('--report-prefix', 'production');
  if (!/^[a-z0-9][a-z0-9.-]*$/.test(reportPrefix)) throw new Error('Invalid report prefix');
  if (!Number.isInteger(seedCount) || seedCount < 2 || seedCount > 256) throw new Error('--seeds must be between 2 and 256');
  const only = option('--pick', 'all');
  const picks = only === 'all' ? SPECIALS : SPECIALS.filter(pick => pick.id === only);
  if (!picks.length) throw new Error('Unknown special');
  const root = fileURLToPath(new URL('../../../', import.meta.url));
  mkdirSync(root + 'docs/balance', { recursive: true });
  const started = performance.now();
  const sourceAtStart = sourceFingerprint();
  const baselines: Trial[] = [];
  const trials: Trial[] = [];
  const comparisons: { pick: string; seed: string; style: ProductionStyle; scorePercent: number; populationPercent: number; winChange: number; outcomes: { seat: number; scorePercent: number; populationPercent: number; winChange: number }[] }[] = [];
  let checkedTurns = 0;
  let observedBattles = 0;
  let games = 0;
  const conditions = Array.from({ length: seedCount }, (_, index) => ({ seed: `PRODUCTION-PAIR-${104729 + index * 7919}`, style: PRODUCTION_STYLES[index % PRODUCTION_STYLES.length]!, region: Math.floor(index / PRODUCTION_STYLES.length) % 2 ? 'Random' as const : 'Sol' as const, turns }));
  const checkedRun = (options: ProductionOptions) => {
    try {
      const result = runProduction(options);
      games++;
      checkedTurns += result.turnsChecked;
      observedBattles += result.observedBattles;
      return result;
    } catch (error) {
      writeFileSync(root + 'docs/balance/' + reportPrefix + '-failure.json', JSON.stringify({ options, error: String(error), sourceAtStart }, null, 2));
      throw error;
    }
  };
  for (const condition of conditions) baselines.push(checkedRun(condition));
  console.log(`Production baselines complete: ${baselines.length} games.`);
  for (const pick of picks) {
    for (let index = 0; index < conditions.length; index++) {
      const condition = conditions[index]!;
      const reference = pick.requires?.length ? checkedRun({ ...condition, picks: pick.requires, seat: 0 }) : baselines[index]!;
      const swaps = [];
      for (const seat of [0, 1]) {
        const baseline = pick.requires?.length && seat === 1 ? checkedRun({ ...condition, picks: pick.requires, seat }) : reference;
        const result = checkedRun({ ...condition, picks: [pick.id, ...(pick.requires ?? [])], seat });
        trials.push(result);
        const own = result.outcomes[seat]!, control = baseline.outcomes[seat]!;
        swaps.push({ seat, scorePercent: (own.score / Math.max(1, control.score) - 1) * 100, populationPercent: (own.population / Math.max(.01, control.population) - 1) * 100, winChange: Number(result.winner === seat) - Number(baseline.winner === seat) });
      }
      comparisons.push({ pick: pick.id, seed: condition.seed, style: condition.style, scorePercent: swaps.reduce((sum, value) => sum + value.scorePercent, 0) / 2, populationPercent: swaps.reduce((sum, value) => sum + value.populationPercent, 0) / 2, winChange: swaps.reduce((sum, value) => sum + value.winChange, 0) / 2, outcomes: swaps });
    }
    console.log(`Production special complete: ${pick.id}. ${trials.length} treated games.`);
    writeFileSync(root + 'docs/balance/' + reportPrefix + '-checkpoint.json', JSON.stringify({ sourceAtStart, completed: [...new Set(comparisons.map(comparison => comparison.pick))], checkedTurns, comparisons }, null, 2));
  }
  const measurements = picks.map(pick => {
    const samples = comparisons.filter(comparison => comparison.pick === pick.id);
    const ownTrials = trials.filter(trial => trial.picks.includes(pick.id));
    return { id: pick.id, cost: pick.cost, pairedSeeds: samples.length,
      scorePercent: summarize(samples.map(sample => sample.scorePercent)),
      populationPercent: summarize(samples.map(sample => sample.populationPercent)),
      winChange: summarize(samples.map(sample => sample.winChange)),
      actualWinFraction: ownTrials.filter(trial => trial.winner === trial.treatmentSeat).length / ownTrials.length,
      zeroObservedEffect: samples.every(sample => Math.abs(sample.scorePercent) < 1e-10),
      byStyle: PRODUCTION_STYLES.map(style => { const entries = samples.filter(sample => sample.style === style); return { style, n: entries.length, scorePercent: summarize(entries.map(sample => sample.scorePercent)), winChange: summarize(entries.map(sample => sample.winChange)) }; }),
    };
  });
  const interactions: { picks: string[]; seeds: number; residualPercent: ReturnType<typeof summarize>; flagged: boolean }[] = [];
  if (only === 'all') for (const pair of [['subterranean', 'hive-mind'], ['spore-borne', 'hive-mind'], ['terraformers', 'hive-mind']]) {
    const residuals = [];
    for (let index = 0; index < Math.min(12, conditions.length); index++) {
      const condition = conditions[index]!;
      const swapped = [];
      for (const seat of [0, 1]) {
        const combined = checkedRun({ ...condition, picks: pair, seat });
        const first = trials.find(trial => trial.seed === condition.seed && trial.treatmentSeat === seat && trial.picks.includes(pair[0]!))!;
        const second = trials.find(trial => trial.seed === condition.seed && trial.treatmentSeat === seat && trial.picks.includes(pair[1]!))!;
        const baseline = baselines[index]!.outcomes[seat]!.score;
        swapped.push((combined.outcomes[seat]!.score - first.outcomes[seat]!.score - second.outcomes[seat]!.score + baseline) / Math.max(1, baseline) * 100);
      }
      residuals.push((swapped[0]! + swapped[1]!) / 2);
    }
    const stats = summarize(residuals);
    interactions.push({ picks: pair, seeds: residuals.length, residualPercent: stats, flagged: stats.low > 5 || stats.high < -5 });
    console.log(`Production interaction complete: ${pair.join(' + ')}.`);
  }
  const sourceAtEnd = sourceFingerprint();
  const report = { schemaVersion: 2, engineVersion: VERSION, method: 'actual productionOrders and processTurn; paired map seeds; both treatment seats; no supplemental policy orders', seedCount, turns, styles: PRODUCTION_STYLES, checkedTurns, observedBattles, games, treatedGames: trials.length, elapsedSeconds: (performance.now() - started) / 1000, sourceAtStart, sourceAtEnd, sourceFilesChangedDuringRun: JSON.stringify(sourceAtStart) !== JSON.stringify(sourceAtEnd), measurements, interactions, comparisons, baselines, trials,
    limitations: ['The style schedule assigns each independent map to one policy; per-style samples are smaller than the pooled sample.', 'All environments use a neutral Carbon/Autocracy/Oxygen reference; ecology families and frame interactions require expanded tournaments.', 'The Approach is disabled and both empires use the legal Defy order, avoiding early two-player Concord victory.', 'Score is measured at the actual end of the game, which may occur before the configured turn limit.', 'Prices are not automatically changed by this validation; disagreement with research estimates must be reviewed.', 'Game-theoretic balance, human exploits and every victory configuration are not established by this finite sample.'] };
  writeFileSync(root + 'docs/balance/' + reportPrefix + '.json', JSON.stringify(report, null, 2) + '\n');
  // Preserve each engine revision's evidence when a later balance pass replaces production.json.
  writeFileSync(root + `docs/balance/${reportPrefix}-${sourceAtStart['engine.ts']!.slice(0, 12)}-${sourceAtStart['ai/controller.ts']!.slice(0, 12)}-seeds${seedCount}.json`, JSON.stringify(report, null, 2) + '\n');
  const pct = (value: number) => `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`;
  const rows = measurements.map(result => `| ${result.id} | ${result.cost} | ${pct(result.scorePercent.mean)} | ${pct(result.scorePercent.low)} … ${pct(result.scorePercent.high)} | ${(result.actualWinFraction * 100).toFixed(1)}% | ${pct(result.populationPercent.mean)} |`).join('\n');
  writeFileSync(root + 'docs/balance/' + reportPrefix + '.md', `# Production-engine special validation\n\nThis follows the pre-roster research calibration and uses the actual game engine, not the research proxy.\n\n- ${report.games} games; ${seedCount} independent paired seeds; both treatment seats.\n- ${checkedTurns.toLocaleString('en-US')} invariant-checked turns; ${observedBattles} observed battles.\n- ${PRODUCTION_STYLES.length} policy styles, scheduled evenly across seeds. Each paired seed averages both seats before the confidence interval.\n- Runtime: ${report.elapsedSeconds.toFixed(1)} seconds.\n- Engine source changed on disk during run: **${report.sourceFilesChangedDuringRun}**. Imports are loaded once; SHA-256 source fingerprints are stored with the evidence. Re-run if the source changes affect mechanics.\n\n| Special | Current cost | Paired score change | 95% seed interval | Treated actual win fraction | Paired population change |\n|---|---:|---:|---|---:|---:|\n${rows}\n\n## Interpretation and limitations\n\n${report.limitations.map(line => '- ' + line).join('\n')}\n\nDo not describe these measurements as comprehensive release balance. Mechanic hook tests complement the tournaments because an AI may fail to exploit a working special. Full results, per-style data, raw paired comparisons and actual outcomes are in [${reportPrefix}.json](${reportPrefix}.json).\n`);
  const interactionText = interactions.map(result => `- ${result.picks.join(' + ')}: ${pct(result.residualPercent.mean)} residual (${pct(result.residualPercent.low)} … ${pct(result.residualPercent.high)}), ${result.seeds} paired seeds; flagged: ${result.flagged}.`).join('\n');
  writeFileSync(root + 'docs/balance/' + reportPrefix + '-interactions.md', '# Production special interactions\n\nThese three combinations were selected from the largest interactions of the first diagnostic research run. They are measured with the actual engine, both seats and up to twelve independent seeds. Positive residual means the pair adds more terminal score than the sum of its isolated effects. An interval wholly above +5 or below −5 percentage points is flagged.\n\n' + interactionText + '\n');
  console.log(JSON.stringify({ games: report.games, checkedTurns, observedBattles, elapsedSeconds: report.elapsedSeconds, sourceFilesChangedDuringRun: report.sourceFilesChangedDuringRun, measurements: measurements.map(result => ({ id: result.id, cost: result.cost, scorePercent: result.scorePercent, winChange: result.winChange, actualWinFraction: result.actualWinFraction, zeroObservedEffect: result.zeroObservedEffect })), interactions }, null, 2));
  return report;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) productionMain().catch(error => { console.error(error); process.exitCode = 1; });
