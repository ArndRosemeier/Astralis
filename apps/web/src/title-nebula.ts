export const TITLE_NEBULAE=[
  {id:'violet',name:'Magenta, violet and gold',path:'assets/title-nebula-violet.png'},
  {id:'azure',name:'Blue and cyan',path:'assets/title-nebula-azure.png'},
  {id:'emerald',name:'Emerald and teal',path:'assets/title-nebula-emerald.png'},
  {id:'ember',name:'Crimson and amber',path:'assets/title-nebula-ember.png'},
] as const;
export type TitleNebula=typeof TITLE_NEBULAE[number];

/** Cosmetic randomness only: choose once in App, independently of the game seed. */
export function chooseTitleNebula(random:()=>number=Math.random):TitleNebula{
  return TITLE_NEBULAE[Math.floor(random()*TITLE_NEBULAE.length)]??TITLE_NEBULAE[0];
}
