import { PICKS, pickEffects, type Effects } from './picks.ts';

/** Reduced 4X research model, not the production rules engine. See docs/balance/methodology.md. */
export const CONTROLLERS = ['balanced', 'expansionist', 'builder', 'scholar', 'militarist', 'trader', 'diplomat'] as const;
export type Controller = typeof CONTROLLERS[number];
type World = { temp: number; gravity: number; chemistry: number; medium: number; radiation: number; light: number; size: number; distance: number; metals: number };
type Colony = { world: World; pop: number; home: boolean; built: number; improvement: number; mixed: boolean };
export type ExperimentResult = { score: number; colonies: number; population: number; research: number; fleet: number; credits: number; inhabited: number; relics: number };
export function random(seed: number) {
  let value = seed >>> 0;
  return () => { value += 0x6d2b79f5; let t = value; t = Math.imul(t ^ t >>> 15, t | 1); t ^= t + Math.imul(t ^ t >>> 7, t | 61); return ((t ^ t >>> 14) >>> 0) / 4294967296; };
}
const clamp = (value: number, low: number, high: number) => Math.min(high, Math.max(low, value));

function worldRating(world: World, effects: Effects, adaptation: number) {
  const underground = effects.subterranean ?? 0;
  const temp = Math.max(0, Math.abs(world.temp - 2) - (effects.temperatureTolerance ?? 0) - underground - adaptation);
  const gravity = Math.max(0, Math.max(1 - world.gravity, (world.gravity - 1) * 2) - (effects.gravityTolerance ?? 0) - adaptation);
  const chemistry = effects.chemistryIndependent ? 0 : world.chemistry === 0 ? 0 : Math.max(0, 2 - adaptation);
  const medium = effects.amphibious ? 0 : world.medium === 0 ? 0 : 2;
  const radiation = effects.radiotrophic ? 0 : Math.max(0, world.radiation - (effects.radiationTolerance ?? 0) - underground);
  const light = Math.max(0, (effects.photosynthetic && world.light === 0 ? 2 : world.light === 1 ? 0 : 1) - underground);
  return Math.min(4, Math.ceil(Math.max(temp, gravity, chemistry, medium, radiation, light)));
}

function capacity(world: World, effects: Effects, adaptation: number, improvement = 0) {
  const rating = Math.max(0, worldRating(world, effects, adaptation) - improvement);
  const cap = [1, .7, .4, .15 + (effects.hostileCap ?? 0), .05][rating]!;
  return world.size * cap;
}

function makeWorlds(seed: number): World[] {
  const rng = random(seed);
  const ecologicalRegime = seed % 5;
  return Array.from({ length: 40 }, (_, index) => ({
    temp: Math.floor(rng() * 5), gravity: Math.floor(rng() * 4),
    chemistry: rng() < (ecologicalRegime === 0 ? .65 : .3) ? 0 : 1 + Math.floor(rng() * 2),
    medium: rng() < (ecologicalRegime === 1 ? .7 : .25) ? 1 : 0,
    radiation: rng() < (ecologicalRegime === 2 ? .7 : .3) ? 1 + Math.floor(rng() * 3) : 0,
    light: rng() < (ecologicalRegime === 3 ? .8 : .5) ? 0 : 1 + Math.floor(rng() * 2),
    size: [3, 6, 10, 14, 18][Math.floor(rng() * 5)]!, distance: 1 + index * .45 + rng() * 2,
    metals: rng() < .3 ? 3 : 0,
  }));
}

/** Same seed produces the same exogenous hazards, markets and neighbours for every treatment. */
export function simulate(seed: number, controller: Controller, ids: readonly string[] = [], turns = 120): ExperimentResult {
  const hasGovernment = ids.some(id => PICKS.find(pick => pick.id === id)?.category === 'government' || id === 'hive-mind');
  const effects = pickEffects(hasGovernment ? ids : ['autocracy', ...ids]);
  const worlds = makeWorlds(seed);
  const rng = random(seed ^ 0x2eb8a94d);
  const home: World = { temp: 2, gravity: 1, chemistry: 0, medium: 0, radiation: 0, light: 1, size: 10 + (effects.homeSize ?? 0), distance: 0, metals: 0 };
  const colonies: Colony[] = [{ world: home, home: true, pop: effects.nomad ? 4 : 8, built: 1, improvement: 0, mixed: false }];
  if (effects.twin) colonies.push({ world: { ...home, size: 6, distance: 1 }, pop: 1, home: false, built: 0, improvement: 0, mixed: false });
  let credits = 50, research = 0, tier = 0, industryStock = 0, fleet = 40, relics = effects.artifact ? 1 : 0;
  let lost = 0, adaptation = 0, queue = 0, buildingStock = 0, totalResearch = 0, ships = 0, warWeariness = 0;
  const charter = { balanced: [.4, .3, .3], expansionist: [.6, .25, .15], builder: [.65, .2, .15], scholar: [.2, .65, .15], militarist: [.65, .2, .15], trader: [.25, .2, .55], diplomat: [.3, .25, .45] }[controller]!;
  const aggression = controller === 'militarist' ? 1.45 : controller === 'diplomat' ? .65 : 1;
  const upkeepScale = effects.photosynthetic ? 0 : 1;
  const tenure = Math.max(3, 18 + (effects.longevity ?? 0));
  for (let turn = 0; turn < turns; turn++) {
    const stage = Math.min(8, Math.floor(tier / 6));
    const hazard = rng(), hostile = rng(), neighbours = rng(), ambient = rng();
    let industry = 0, science = 0, commerce = 0, maintenance = 0;
    const currentAdaptation = Math.min(2 + (effects.adaptationDiscount ? 1 : 0), adaptation);
    for (const colony of colonies) {
      const rating = colony.home ? 0 : Math.max(0, worldRating(colony.world, effects, currentAdaptation) - colony.improvement);
      const cap = colony.home ? (effects.nomad ? 8 : colony.world.size * 1.25) : capacity(colony.world, effects, currentAdaptation, colony.improvement);
      const adminPenalty = Math.max(0, colonies.length - (8 + stage * 2 + (effects.admin ?? 0))) * 2;
      const domeStress = effects.hardy ? 0 : rating >= 3 ? 10 : 0;
      const mixing = colony.mixed ? effects.cosmopolitan ? 0 : 5 + (effects.mixedPenalty ?? 0) : 0;
      const stabilityTech = stage * 4 + (stage >= 3 ? 10 : 0);
      const stability = effects.hive ? 75 : clamp(55 + (effects.stability ?? 0) + colony.built * 2 + stabilityTech - adminPenalty - domeStress - mixing - warWeariness, 0, 100);
      const factor = stability >= 75 ? 1.1 : stability >= 50 ? 1 : stability >= 25 ? .8 : stability >= 10 ? .5 : .2;
      const workers = colony.pop;
      industry += workers * charter[0]! * (3 + colony.built * .6) * (1 + (effects.industry ?? 0)) * factor + colony.world.metals + (colony.home ? 10 + (effects.homeIndustry ?? 0) : 0);
      science += workers * charter[1]! * (3 + colony.built * .5) * (1 + (effects.research ?? 0)) * factor + (colony.home ? 5 : 0);
      commerce += workers * (1 + charter[2]! * (3 + colony.built * .3)) * (1 + (effects.commerce ?? 0)) * factor;
      maintenance += (1 + colony.built + workers * .08 * (1 + (effects.upkeep ?? 0))) * upkeepScale;
      if (colony.pop < cap) {
        const photosynthesis = effects.photosynthetic && colony.world.light > 0 ? .25 : 0;
        const growth = .4 * (1 + (effects.growth ?? 0)) * (rating >= 3 ? .5 : rating === 2 ? .8 : 1) * (1 + photosynthesis);
        if (effects.synthetic) colony.pop = Math.min(cap, colony.pop + colony.pop * charter[0]! * .045 * (1 + (effects.industry ?? 0)));
        else colony.pop = Math.min(cap, colony.pop + growth * colony.pop * (1 - colony.pop / cap) + .1);
      } else colony.pop -= Math.max(0, colony.pop - cap) * .1;
      if (hazard < .045 && colony.world.radiation > 0) colony.pop *= effects.radiationTolerance || effects.radiotrophic || effects.subterranean ? .99 : .94;
      if (stability < 10 && !effects.hive && hostile < .08) { colony.pop *= .8; lost += 1; }
    }
    if (effects.synthetic) industry *= .9; // Assembly spends industry rather than being free growth.
    credits += commerce - maintenance - fleet * .015;
    // Contact: high diplomacy buys trade and reduces war exposure. Intelligence defends every style.
    const diplomacy = .5 + (effects.diplomacy ?? 0) / 100;
    const trade = Math.max(0, diplomacy) * (controller === 'trader' || controller === 'diplomat' ? .22 : .08) * (1 + (effects.trade ?? 0));
    credits += commerce * trade;
    science *= 1 + trade * .35;
    const sabotage = Math.max(0, .02 - (effects.espionage ?? 0) * .004);
    if (neighbours < sabotage) industry *= .8;
    // Spend an intelligence aptitude offensively after contact as well as defensively.
    if (turn > 12) science += Math.max(0, effects.espionage ?? 0) * (controller === 'militarist' ? .8 : .35);
    totalResearch += science;
    research += science;
    const researchCost = [40, 80, 150, 260, 420, 650, 1000, 1500][Math.min(7, stage)]! * (tier >= 48 ? 1 + (tier - 47) * .05 : 1);
    if (research >= researchCost) { research -= researchCost; tier++; }
    // All controllers buy useful adaptation/terraforming when the frontier needs them.
    const frontier = worlds[queue];
    if (frontier && stage >= 2 && adaptation < Math.min(3, stage - 1 + (effects.adaptationDiscount ? 1 : 0)) && turn % 8 === 0 && research > 80 * (1 - (effects.adaptationDiscount ?? 0))) {
      research -= 80 * (1 - (effects.adaptationDiscount ?? 0)); adaptation = Math.min(3, adaptation + .5);
    }
    const variety = effects.creative ? .10 : effects.rigid ? -.06 : 0;
    industry *= 1 + stage * (.025 + variety * .12);
    // Portfolio access changes component effectiveness, not flat score.
    const techFleet = 1 + stage * .045 * (1 + variety * 2);
    let expansionShare = controller === 'expansionist' ? .55 : controller === 'builder' ? .25 : .35;
    if (colonies.length > 15) expansionShare *= .4;
    industryStock += industry * expansionShare;
    buildingStock += industry * (controller === 'builder' ? .45 : .25);
    const colonyCost = 100 * (1 - (effects.colonyDiscount ?? 0)) * (effects.nomad ? .65 : 1);
    const range = 6 + stage * 1.5 + (effects.sensors ?? 0) * 4;
    if (industryStock >= colonyCost && frontier && frontier.distance <= range && turn > frontier.distance / (1 + stage * .2)) {
      industryStock -= colonyCost;
      const candidateWorlds = worlds.slice(queue, Math.min(worlds.length, queue + 4));
      const selected = candidateWorlds.reduce((best, world) => capacity(world, effects, currentAdaptation) / (1 + world.distance * .04) > capacity(best, effects, currentAdaptation) / (1 + best.distance * .04) ? world : best, frontier);
      const index = worlds.indexOf(selected);
      [worlds[queue], worlds[index]] = [worlds[index]!, worlds[queue]!];
      const cap = capacity(selected, effects, currentAdaptation);
      // A hostile frontier can only be settled after enough life-science research.
      if (cap > .2 && (worldRating(selected, effects, currentAdaptation) < 4 || stage >= 3)) {
        colonies.push({ world: selected, pop: .9 * (1 + (effects.colonyPopFactor ?? 0)), home: false, built: 0, improvement: 0, mixed: false });
        ships++; queue++;
      }
    }
    const cheapest = colonies.reduce((best, colony) => colony.built < best.built ? colony : best, colonies[0]!);
    if (buildingStock >= 60 + cheapest.built * 35) { buildingStock -= 60 + cheapest.built * 35; cheapest.built++; }
    const difficult = colonies.find(colony => !colony.home && colony.improvement < 2 && worldRating(colony.world, effects, currentAdaptation) - colony.improvement > 1);
    if (difficult && stage >= 2 && turn % Math.max(2, Math.round(5 * (1 - (effects.terraDiscount ?? 0)))) === 0 && credits > 100 * (1 - (effects.terraDiscount ?? 0))) {
      credits -= 100 * (1 - (effects.terraDiscount ?? 0)); difficult.improvement++;
    }
    const militaryShare = controller === 'militarist' ? .4 : .25;
    const newFleet = industry * militaryShare / (1 - (effects.shipDiscount ?? 0));
    const buy = credits > 150 ? Math.min(credits - 100, 35) : 0;
    credits -= buy;
    fleet += (newFleet + buy / (2 * (1 - (effects.buyDiscount ?? 0)))) * techFleet;
    fleet *= 1 - .012 * (1 - (effects.repair ?? 0));
    const crewExperience = 1 + Math.min(.15, (turn % tenure) * .003);
    const battlePower = fleet * (1 + (effects.pilot ?? 0)) * crewExperience * (1 + (effects.sensors ?? 0) * .08);
    const opponent = 50 + turn * (5 + (seed % 11) * .2) * aggression;
    const warRisk = Math.max(.025, .12 * aggression - diplomacy * .08);
    if (turn > 18 && hostile < warRisk) {
      const ratio = battlePower / Math.max(1, opponent);
      const casualties = ratio > 1 ? .035 : .16;
      fleet *= 1 - casualties * (1 - (effects.repair ?? 0));
      warWeariness = clamp(warWeariness + 1, 0, 20);
      if (ratio < .65 && colonies.length > 1) {
        const target = colonies[colonies.length - 1]!;
        const troopFactor = 1 + (effects.troops ?? 0);
        target.pop *= effects.subterranean ? .97 : .94;
        if (ambient > troopFactor / (1 + troopFactor)) { colonies.pop(); lost++; }
      } else if (ratio > 1.25 && neighbours < .4) {
        relics += .15;
        credits += 15 * (1 + (effects.troops ?? 0));
        if (ambient < .18 && colonies.length < 24) colonies.push({ world: { ...home, size: 6 }, pop: 2, home: false, built: 1, improvement: 0, mixed: true });
      }
    } else warWeariness = Math.max(0, warWeariness - .4);
    if (effects.artifact && turn % 10 === 0) fleet += 6 + science * .1;
    if (controller === 'diplomat' && turn > 20 && turn % 15 === 0 && diplomacy > .4) credits += colonies.reduce((sum, colony) => sum + colony.pop, 0) * diplomacy * .4;
    if (credits < 0) { industryStock *= .95; fleet *= .98; }
    if (!Number.isFinite(fleet + credits + research)) throw new Error('Simulation invariant failed: non-finite resources');
  }
  const population = colonies.reduce((sum, colony) => sum + colony.pop, 0);
  const habitation = colonies.reduce((sum, colony) => sum + capacity(colony.world, effects, Math.min(3, adaptation), colony.improvement), 0);
  const score = Math.max(1, population * 10 + colonies.length * 30 + totalResearch * .12 + fleet * .5 + Math.max(0, credits) * .025 + relics * 40 - lost * 5);
  return { score, colonies: colonies.length, population, research: totalResearch, fleet, credits, inhabited: habitation, relics };
}

export function summarize(values: number[]) {
  const n = values.length;
  const mean = values.reduce((sum, value) => sum + value, 0) / Math.max(1, n);
  const variance = values.reduce((sum, value) => sum + (value - mean) ** 2, 0) / Math.max(1, n - 1);
  const error = 1.96 * Math.sqrt(variance / Math.max(1, n));
  return { n, mean, low: mean - error, high: mean + error };
}

export function treatmentIds(id: string) {
  const pick = PICKS.find(pick => pick.id === id)!;
  return [id, ...(pick.requires ?? [])];
}
