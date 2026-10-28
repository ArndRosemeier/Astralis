import type {GameState,StarSystem} from '../../../packages/sim/src/types';

/** A display frame only: catalog coordinates and simulation distances stay unchanged. */
export function mapOrigin(game:GameState,seat:number):StarSystem{
 const empire=game.empires[seat]||game.empires[0];
 return game.systems.find(s=>s.planets.some(p=>p.id===empire.capital))
  ||game.systems.find(s=>s.planets.some(p=>p.owner===empire.id))||game.systems[0];
}
export function mapCoordinates(system:StarSystem,origin:StarSystem,flat=false):[number,number,number]{
 return [system.x-origin.x,flat?0:system.z-origin.z,system.y-origin.y];
}
