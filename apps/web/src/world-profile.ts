import type {Planet} from '../../../packages/sim/src/types';
import {tidalProfile} from './tidal-profile';

export type WorldScene='Surface'|'Atmosphere'|'Habitat'|'Belt';
type ArtProfile={title:string;description:string;alt:string};
export const WORLD_ART={
 temperate:{title:'A world beneath open skies',description:'Coasts, inland terrain and cloud systems frame this temperate landscape.',alt:'Green coastal islands and pale mountains overlook a sunlit turquoise sea.'},
 ocean:{title:'An unbroken horizon',description:'Open water stretches beneath the weather systems of an ocean world.',alt:'Turquoise ocean swells extend to a distant horizon beneath immense white clouds.'},
 frozen:{title:'The quiet of an ice world',description:'Glaciers and fractured ice dominate this cold landscape.',alt:'Blue-white glaciers and wind-carved snow surround dark peaks under a pale sky.'},
 desert:{title:'Landscapes written in stone',description:'Dunes, mineral plains and exposed rock shape this arid world.',alt:'Copper dunes and layered sandstone mesas stretch beneath a dusty daylight sky.'},
 airless:{title:'Beneath a silent sky',description:'Exposed rock and impact scars lie beneath a sky with little atmospheric scattering.',alt:'Gray crater rims and angular boulders cast sharp shadows under a black sky.'},
 clouded:{title:'Under a heavy sky',description:'Dense atmospheric haze veils the distant ridges of this hot rocky world.',alt:'Dark basalt plains disappear into thick golden haze below an opaque amber cloud ceiling.'},
 volcanic:{title:'The heat within',description:'An interpretation of fractured crust and molten terrain on an extremely hot world.',alt:'Black volcanic plates and obsidian cliffs are split by glowing orange magma channels.'},
 gas:{title:'Weather on a planetary scale',description:'The atmospheric view explores cloud bands and storms; this world has no accessible solid surface.',alt:'Pearl and amber cloud bands curl around an immense storm above a gas giant’s curved horizon.'},
 habitat:{title:'A home built among the stars',description:'An artificial habitat encloses living space within an engineered orbital structure.',alt:'A white and titanium ring habitat with sheltered interior strips floats in dark space.'},
 belt:{title:'A thousand small frontiers',description:'A dispersed field of rocky bodies, shown together rather than as a single planet.',alt:'Irregular cratered asteroids of different sizes drift through widely spaced dark space.'},
} satisfies Record<string,ArtProfile>;
export type WorldArt=keyof typeof WORLD_ART;

const scenes:Record<Planet['kind'],WorldScene>={rocky:'Surface',ocean:'Surface',ice:'Surface',gas:'Atmosphere',habitat:'Habitat',belt:'Belt'};
export function worldProfile(p:Planet){
 const scene=scenes[p.kind],tidal=tidalProfile(p);
 let category:WorldArt;
 if(p.kind==='gas'||p.kind==='habitat'||p.kind==='belt')category=p.kind;
 else if(p.temperature>=900)category='volcanic';
 else if(p.pressure>=10&&p.temperature>380)category='clouded';
 else if(p.kind==='ice'||p.temperature<220)category='frozen';
 else if(p.pressure<=.05)category='airless';
 else if(p.kind==='ocean'||p.water>=.85)category='ocean';
 else if(p.temperature<=380&&p.water>.15)category=p.chemistry==='Oxygen'?'temperate':'ocean';
 else category='desert';
 // Extreme conditions retain their own geology even on synchronously rotating worlds.
 const useTidal=tidal&&!['airless','clouded','volcanic'].includes(category);
 const details=useTidal?tidal:WORLD_ART[category];
 const locked=p.locked&&p.kind!=='belt'&&p.kind!=='habitat';
 return {category,scene,study:`${scene==='Surface'?'surface':scene==='Atmosphere'?'atmospheric':scene==='Habitat'?'habitat':'belt'} study`,...details,
  art:useTidal?tidal.art:`assets/planets/world-${category}.png`,
  locked,kicker:locked?'STAR-LOCKED':p.kind==='gas'?'GAS GIANT':p.kind==='habitat'?'ORBITAL HABITAT':p.kind==='belt'?'ASTEROID BELT':'PLANETARY LANDSCAPE',
  orbitCaption:locked?'One face to the star. Always.':p.kind==='habitat'?'Living space, engineered.':p.kind==='belt'?'Many bodies. One frontier.':p.kind==='gas'?'A world wrapped in clouds.':'A world turning beneath the stars.',
 };
}
