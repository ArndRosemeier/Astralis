import type {Planet} from '../../../packages/sim/src/types';

/** Presentation classes only: never infer a habitability score or change the simulation. */
export function tidalProfile(p:Planet){
 if(!p.locked||!['rocky','ice'].includes(p.kind))return null;
 const climate=p.kind==='ice'||p.temperature<220?'frost':p.temperature<=380&&p.water>.15&&p.pressure>.05?'ocean':'rock';
 const descriptions={
  frost:{title:'Stillness beneath the ice',description:'A frozen landscape between constant starlight and permanent night.',alt:'Amber starlight grazes fractured blue glaciers, fading into a dark, icy horizon.'},
  ocean:{title:'On the edge of daylight',description:'A water-bearing world imagined along its permanent twilight frontier.',alt:'An amber-lit ocean coast meets teal twilight waters and the blue ice of the night side.'},
  rock:{title:'A world of light and shadow',description:'Mineral plains and basalt ridges beneath a fixed stellar horizon.',alt:'Copper-lit basalt plains and dark escarpments grade into a deep violet night side.'},
 };
 return {climate,...descriptions[climate],art:`assets/planets/tidal-${climate}.png`,transport:p.pressure>=3?'A dense atmosphere can redistribute heat between hemispheres.':p.pressure<=.05?'With little atmosphere, heat redistribution is limited.':'Atmosphere and oceans can redistribute heat; twilight is not automatically habitable.'};
}

export const TIDAL_SUN=[-.93,.12,.35] as const;
/** A locked surface holds its orientation to the star; orbit motion belongs to the system view. */
export const worldRotation=(locked:boolean,time:number)=>locked?0:.4+time*.065;
