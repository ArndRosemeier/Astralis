import nearbySystems from './systems.json';
import nearbyPlanets from './planets.json';

export interface CatalogStar {
  name: string;
  spectral: string;
  category: 'star' | 'white dwarf' | 'brown dwarf';
  uncertain?: boolean;
  mass?: number;
  luminosity?: number;
  temperature?: number | null;
}

export interface CatalogSystem {
  id: string;
  name: string;
  x: number;
  y: number;
  z: number;
  distance: number;
  spectral: string;
  luminosity: number;
  mass: number;
  temperature: number;
  observationDepth: 'deep' | 'moderate' | 'shallow';
  stars: CatalogStar[];
  source: string;
  estimated: string[];
  epoch: number;
  aliases: string[];
}

export interface CatalogPlanet {
  id: string;
  systemId: string;
  name: string;
  host: string;
  hostLuminosity?: number;
  hostMass?: number;
  status: 'confirmed' | 'candidate';
  controversial?: boolean;
  confidence?: number;
  confidenceBasis?: string;
  radius: number | null;
  mass: number | null;
  orbit: number | null;
  temperature: number | null;
  period: number | null;
  eccentricity: number | null;
  discoveryYear?: number;
  discoveryMethod?: string;
  estimated: string[];
  source: string;
}

export const systems = nearbySystems as CatalogSystem[];
export const planets = nearbyPlanets as CatalogPlanet[];

/** Explicit dynamic loading keeps the 100pc catalogue out of the title-screen bundle. */
export async function loadExtendedCatalog(): Promise<{ systems: CatalogSystem[]; planets: CatalogPlanet[] }> {
  const [stars, worlds] = await Promise.all([import('./extended-systems.json'), import('./extended-planets.json')]);
  return { systems: stars.default as CatalogSystem[], planets: worlds.default as CatalogPlanet[] };
}

export function selectRegion(catalog: readonly CatalogSystem[], radius: number, centre = { x: 0, y: 0, z: 0 }): CatalogSystem[] {
  const r2 = radius * radius;
  return catalog.filter(s => (s.x-centre.x)**2 + (s.y-centre.y)**2 + (s.z-centre.z)**2 <= r2);
}
