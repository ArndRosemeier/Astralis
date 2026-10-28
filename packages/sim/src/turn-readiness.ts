import type {Command,GameState} from './types';
import {applyCommand} from './engine';
import {researchRequired} from './rules';

// Validate the submitted draft, not the last committed state. Shared by worker and host.
export function turnSubmissionError(game:GameState,empireId:number,orders:Command[]):string|null{
 const empire=game.empires[empireId];
 if(!empire||empire.eliminated||empire.threat)return 'This empire cannot submit a turn.';
 const staged=structuredClone(game);
 for(const command of orders){
  if(command.empire!==empireId)return 'Orders must belong to your empire.';
  const error=applyCommand(staged,command);if(error)return error;
 }
 return researchRequired(staged,staged.empires[empireId])?'Choose a research project before ending the turn.':null;
}
