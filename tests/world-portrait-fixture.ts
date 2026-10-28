import type {Planet} from '../packages/sim/src/types';
import {achievementFixture} from './achievement-fixture';
import {portraitCases} from './world-portrait-cases';
export function worldPortraitFixture(){const {game,home}=achievementFixture();const system=game.systems.find(s=>s.id===home.systemId)!;
 system.planets=[home,...portraitCases.map(([name,kind,temperature,water,pressure,locked],i):Planet=>({...structuredClone(home),id:`portrait-${i}`,name:'Study '+name,kind,temperature,water,pressure,locked,owner:null,speciesId:null,population:0,buildings:[],queue:[],progress:0}))];home.queue=[];return game;
}
