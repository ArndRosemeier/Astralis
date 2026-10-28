import { CALIBRATED_COSTS } from './costs.ts';

export type PickCategory = 'frame' | 'tolerance' | 'growth' | 'lifespan' | 'aptitude' | 'science' | 'origin' | 'special' | 'government' | 'attitude';
export type Effects = Record<string, number>;
export type PickDefinition = {
  id: string; name: string; category: PickCategory; description: string;
  draftCost: number; cost: number; effects: Effects;
  group?: string; requires?: string[]; excludes?: string[];
};

const rows: Omit<PickDefinition, 'cost'>[] = [
  { id: 'carbon', name: 'Carbon', category: 'frame', group: 'frame', draftCost: 0, description: 'Carbon-based life. The reference frame.', effects: {} },
  { id: 'lithic', name: 'Lithic', category: 'frame', group: 'frame', draftCost: 0, description: 'Radiation-resistant rock life; industry +20%, very slow growth, ancient lifespan.', effects: { industry: .2, radiationTolerance: 1, growth: -.5, longevity: 100, stability: 10 }, excludes: ['growth-fast', 'growth-very-fast', 'growth-slow', 'growth-very-slow', 'lifespan-short', 'lifespan-ephemeral', 'lifespan-long', 'lifespan-ancient'] },
  { id: 'synthetic', name: 'Synthetic', category: 'frame', group: 'frame', draftCost: 3, description: 'Machine population is assembled from industry, ignores chemistry, stability −10.', effects: { synthetic: 1, chemistryIndependent: 1, stability: -10 }, excludes: ['growth-fast', 'growth-very-fast', 'growth-slow', 'growth-very-slow'] },
  { id: 'temperature-narrow', name: 'Narrow thermal tolerance', category: 'tolerance', group: 'temperature', draftCost: -2, description: 'Each step away from the preferred temperature is more severe.', effects: { temperatureTolerance: -1 } },
  { id: 'temperature-wide', name: 'Wide thermal tolerance', category: 'tolerance', group: 'temperature', draftCost: 3, description: 'Temperature mismatches are one step less severe.', effects: { temperatureTolerance: 1 } },
  { id: 'gravity-narrow', name: 'Narrow gravity tolerance', category: 'tolerance', group: 'gravity', draftCost: -1, description: 'Gravity mismatches are more severe.', effects: { gravityTolerance: -1 } },
  { id: 'gravity-wide', name: 'Wide gravity tolerance', category: 'tolerance', group: 'gravity', draftCost: 2, description: 'Gravity mismatches are one step less severe.', effects: { gravityTolerance: 1 } },
  { id: 'amphibious', name: 'Amphibious', category: 'tolerance', draftCost: 3, description: 'Both land and aquatic environments count as home.', effects: { amphibious: 1 } },
  { id: 'radiation-vulnerable', name: 'Radiation-vulnerable', category: 'tolerance', group: 'radiation', draftCost: -2, description: 'Irradiated worlds are one habitability step worse.', effects: { radiationTolerance: -1 } },
  { id: 'radiation-resistant', name: 'Radiation-resistant', category: 'tolerance', group: 'radiation', draftCost: 2, description: 'Irradiated worlds are one habitability step better.', effects: { radiationTolerance: 1 } },
  { id: 'hardy', name: 'Hardy', category: 'tolerance', draftCost: 3, description: 'Hostile population cap rises from 15% to 25%; no dome stress.', effects: { hostileCap: .1, hardy: 1 } },
  { id: 'sealed-metabolism', name: 'Sealed metabolism', category: 'tolerance', draftCost: 5, description: 'Atmosphere chemistry does not affect habitability.', effects: { chemistryIndependent: 1 } },
  { id: 'growth-very-slow', name: 'Very slow reproduction', category: 'growth', group: 'growth', draftCost: -4, description: 'Natural population growth ×0.5.', effects: { growth: -.5 } },
  { id: 'growth-slow', name: 'Slow reproduction', category: 'growth', group: 'growth', draftCost: -2, description: 'Natural population growth ×0.75.', effects: { growth: -.25 } },
  { id: 'growth-fast', name: 'Fast reproduction', category: 'growth', group: 'growth', draftCost: 3, description: 'Natural population growth ×1.5.', effects: { growth: .5 } },
  { id: 'growth-very-fast', name: 'Very fast reproduction', category: 'growth', group: 'growth', draftCost: 6, description: 'Natural population growth ×2.', effects: { growth: 1 } },
  { id: 'lifespan-ephemeral', name: 'Ephemeral', category: 'lifespan', group: 'lifespan', draftCost: -2, description: 'Three-turn leader tenure; veteran crews retire quickly.', effects: { longevity: -15 } },
  { id: 'lifespan-short', name: 'Short-lived', category: 'lifespan', group: 'lifespan', draftCost: -1, description: 'Eight-turn leader tenure and faster veteran retirement.', effects: { longevity: -10 } },
  { id: 'lifespan-long', name: 'Long-lived', category: 'lifespan', group: 'lifespan', draftCost: 2, description: 'Sixty-turn leader tenure and stability +10.', effects: { longevity: 42, stability: 10 } },
  { id: 'lifespan-ancient', name: 'Ancient', category: 'lifespan', group: 'lifespan', draftCost: 3, description: 'Lifelong leaders and stability +10.', effects: { longevity: 100, stability: 10 } },
  { id: 'rigid', name: 'Rigid science', category: 'science', group: 'science', draftCost: -3, description: 'Unchosen projects in a tier become unavailable.', effects: { rigid: 1 } },
  { id: 'creative', name: 'Creative science', category: 'science', group: 'science', draftCost: 6, description: 'Alternate projects retain their normal research cost.', effects: { creative: 1 }, excludes: ['hive-mind'] },
  { id: 'origin-standard', name: 'Standard homeworld', category: 'origin', group: 'origin', draftCost: 0, description: 'A medium, established homeworld.', effects: {} },
  { id: 'origin-large', name: 'Large homeworld', category: 'origin', group: 'origin', draftCost: 2, description: 'Homeworld base population capacity rises to 14 bn.', effects: { homeSize: 4 } },
  { id: 'origin-small', name: 'Small homeworld', category: 'origin', group: 'origin', draftCost: -1, description: 'Homeworld base population capacity falls to 6 bn.', effects: { homeSize: -4 } },
  { id: 'origin-rich', name: 'Rich homeworld', category: 'origin', group: 'origin', draftCost: 2, description: 'A rich metals deposit adds six homeworld industry.', effects: { homeIndustry: 6 } },
  { id: 'origin-poor', name: 'Poor homeworld', category: 'origin', group: 'origin', draftCost: -2, description: 'Homeworld industry is reduced by three.', effects: { homeIndustry: -3 } },
  { id: 'origin-twin', name: 'Twin settlement', category: 'origin', group: 'origin', draftCost: 3, description: 'Begin with an additional nearby small colony.', effects: { twin: 1 } },
  { id: 'origin-vault', name: 'Gardener vault', category: 'origin', group: 'origin', draftCost: 4, description: 'A Gardener site and one recovered artifact at home.', effects: { artifact: 1 } },
  { id: 'origin-nomad', name: 'Nomad fleet', category: 'origin', group: 'origin', draftCost: 0, description: 'Habitat-based mobile capital; belt habitats are cheaper.', effects: { nomad: 1 } },
  { id: 'subterranean', name: 'Subterranean', category: 'special', draftCost: 3, description: 'Temperature, light and radiation count one step better; bombardment casualties halved. Incompatible with Hive mind (D49).', effects: { subterranean: 1 }, excludes: ['hive-mind'] },
  { id: 'photosynthetic', name: 'Photosynthetic', category: 'special', draftCost: 2, description: 'No colony upkeep and faster growth in normal/bright light; dim light is a full hazard.', effects: { photosynthetic: 1 } },
  { id: 'spore-borne', name: 'Spore-borne', category: 'special', draftCost: 3, description: 'Colony ships cost 40% less, but colonies start at half population.', effects: { colonyDiscount: .4, colonyPopFactor: -.5 } },
  { id: 'hive-mind', name: 'Hive mind', category: 'special', draftCost: 4, description: 'Unified government; immune to unrest and subversion, espionage defence +2, diplomacy −15. Incompatible with Subterranean (D49).', effects: { hive: 1, industry: .2, research: -.1, espionage: 2, diplomacy: -15 }, excludes: ['creative', 'subterranean', 'autocracy', 'republic', 'communion', 'federation', 'technocracy', 'directorate'] },
  { id: 'terraformers', name: 'Terraformers', category: 'special', draftCost: 3, description: 'Terraforming time and cost −40%.', effects: { terraDiscount: .4 } },
  { id: 'genetic-plasticity', name: 'Genetic plasticity', category: 'special', draftCost: 3, description: 'Adaptation projects cost half as much and allow one extra step.', effects: { adaptationDiscount: .5 } },
  { id: 'electrosense', name: 'Electrosense', category: 'special', draftCost: 2, description: 'Detection range +50%; better battle sensors and ECM.', effects: { sensors: .5, pilot: .05 } },
  { id: 'radiotrophic', name: 'Radiotrophic', category: 'special', draftCost: 2, description: 'Irradiated worlds become more suitable instead of less.', effects: { radiotrophic: 1 }, requires: ['radiation-resistant'] },
  { id: 'cybernetic', name: 'Cybernetic', category: 'special', draftCost: 3, description: 'Field ship repair and troops +25%; population upkeep +10%.', effects: { repair: .15, troops: .25, upkeep: .1 } },
  { id: 'autocracy', name: 'Autocracy', category: 'government', group: 'government', draftCost: 0, description: 'Ship cost −10%, troops +25%, research −10%; base stability 55.', effects: { shipDiscount: .1, troops: .25, research: -.1, stability: 0 }, excludes: ['hive-mind'] },
  { id: 'republic', name: 'Republic', category: 'government', group: 'government', draftCost: 3, description: 'Credits +20%, research +10%; base stability 60.', effects: { commerce: .2, research: .1, stability: 5 }, excludes: ['hive-mind'] },
  { id: 'communion', name: 'Communion', category: 'government', group: 'government', draftCost: 1, description: 'Troops +25%, research −15%; base stability 70.', effects: { troops: .25, research: -.15, stability: 15 }, excludes: ['hive-mind'] },
  { id: 'federation', name: 'Federation', category: 'government', group: 'government', draftCost: 3, description: 'Larger administration, diplomacy +10, credits +10%, ship cost +10%.', effects: { diplomacy: 10, commerce: .1, shipDiscount: -.1, admin: 4, stability: 5 }, excludes: ['hive-mind'] },
  { id: 'technocracy', name: 'Technocracy', category: 'government', group: 'government', draftCost: 4, description: 'Research +25%, credits −10%; base stability 50.', effects: { research: .25, commerce: -.1, stability: -5 }, excludes: ['hive-mind'] },
  { id: 'directorate', name: 'Directorate', category: 'government', group: 'government', draftCost: 3, description: 'Credits +30%, buying −25%, trade +25%, espionage +1; stability 50.', effects: { commerce: .3, buyDiscount: .25, espionage: 1, stability: -5, trade: .25 }, excludes: ['hive-mind'] },
  { id: 'xenophobic', name: 'Xenophobic', category: 'attitude', group: 'attitude', draftCost: -1, description: 'Own-species stability +5, mixed colonies −20, diplomacy −15.', effects: { stability: 5, diplomacy: -15, mixedPenalty: 20 } },
  { id: 'cosmopolitan', name: 'Cosmopolitan', category: 'attitude', group: 'attitude', draftCost: 1, description: 'Mixed-species colonies have no penalty and assimilate faster.', effects: { cosmopolitan: 1 } },
];

const aptitudeRows = [
  ['industry', 'Industry', .2, 2, 3, 7], ['research', 'Research', .2, 2, 3, 7],
  ['commerce', 'Commerce', .25, 1, 2, 5], ['pilot', 'Piloting', .1, 2, 3, 6],
  ['troops', 'Troops', .25, 1, 2, 4], ['espionage', 'Espionage', 1, 1, 2, 4],
  ['diplomacy', 'Diplomacy', 15, 1, 2, 4], ['stability', 'Stability', 10, 2, 3, 5],
] as const;
for (const [key, name, effect, refund, cost1, cost2] of aptitudeRows) {
  for (const [suffix, level, draftCost] of [['minus', -1, -refund], ['1', 1, cost1], ['2', 2, cost2]] as const) {
    const idKey = key === 'pilot' ? 'piloting' : key;
    rows.push({ id: `${idKey}-${suffix}`, name: `${name} ${level > 0 ? '+' : ''}${level}`, category: 'aptitude', group: `aptitude-${key}`, draftCost, description: `${name} aptitude ${level > 0 ? '+' : ''}${level}.`, effects: { [key]: level * effect } });
  }
}

export const PICKS: PickDefinition[] = rows.map(pick => ({ ...pick, cost: CALIBRATED_COSTS[pick.id] ?? pick.draftCost }));
export const PICK_COSTS: Record<string, number> = Object.fromEntries(PICKS.map(pick => [pick.id, pick.cost]));
export const SPECIALS = PICKS.filter(pick => pick.category === 'special');

export function pickEffects(ids: readonly string[]): Effects {
  const effects: Effects = {};
  for (const id of new Set(ids)) {
    const pick = PICKS.find(candidate => candidate.id === id);
    if (!pick) continue;
    for (const [key, value] of Object.entries(pick.effects)) effects[key] = (effects[key] ?? 0) + value;
  }
  return effects;
}

export function evaluatePicks(ids: readonly string[], budget = 10) {
  const errors: string[] = [];
  const groups = new Set<string>();
  const selected = new Set(ids);
  // Do not sell capped/redundant benefits, or refund drawbacks the biology ignores.
  if(selected.has('hive-mind')&&['stability-minus','stability-1','stability-2'].some(id=>selected.has(id)))errors.push('Hive mind fixes stability at 75; stability aptitudes cannot be selected.');
  if(selected.has('lithic')&&selected.has('industry-2'))errors.push('Lithic industry already reaches its aptitude cap with Industry +1.');
  if(selected.has('lithic')&&selected.has('radiation-resistant'))errors.push('Lithic biology already includes radiation resistance.');
  if(selected.has('synthetic')&&selected.has('sealed-metabolism'))errors.push('Synthetic biology already ignores atmospheric chemistry.');
  let spent = 0;
  let rawRefund = 0;
  if (selected.size !== ids.length) errors.push('A pick may only be selected once.');
  for (const id of selected) {
    const pick = PICKS.find(candidate => candidate.id === id);
    if (!pick) { errors.push(`Unknown pick: ${id}`); continue; }
    if (pick.group) {
      if (groups.has(pick.group)) errors.push(`Choose only one option in ${pick.group}.`);
      groups.add(pick.group);
    }
    if (pick.cost >= 0) spent += pick.cost;
    else rawRefund -= pick.cost;
    for (const prerequisite of pick.requires ?? []) {
      const providedByFrame = prerequisite === 'radiation-resistant' && selected.has('lithic');
      if (!selected.has(prerequisite) && !providedByFrame) errors.push(`${pick.name} requires ${prerequisite}.`);
    }
    for (const exclusion of pick.excludes ?? []) if (selected.has(exclusion)) errors.push(`${pick.name} cannot be combined with ${exclusion}.`);
  }
  const refund = Math.min(6, rawRefund);
  const remaining = budget + refund - spent;
  if (remaining < 0) errors.push(`The selection exceeds the ${budget}-point budget by ${-remaining}.`);
  return { spent, refund, rawRefund, remaining, valid: errors.length === 0, errors };
}
