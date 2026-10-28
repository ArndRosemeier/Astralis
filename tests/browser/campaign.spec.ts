import {finishTurn} from './turn-helpers';
import {test,expect} from '@playwright/test';
test('a complete browser campaign can reach its score ending',async({page})=>{
 const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));await page.addInitScript(()=>localStorage.setItem('astralis-settings',JSON.stringify({tutorial:false,motion:false,quality:'Low'})));await page.goto('/');await page.getByRole('button',{name:'Click to start',exact:true}).click();await page.getByRole('button',{name:'Begin an expedition'}).click();await page.getByLabel('Map size').selectOption('Small');await page.getByLabel('Civilizations').selectOption('2');await page.getByLabel('Turn limit').selectOption('60');await page.getByText('Advanced expedition rules',{exact:true}).click();await page.getByLabel('The Approach').uncheck();await page.getByLabel('Guided introduction').uncheck();await page.getByRole('button',{name:'Lift the Veil'}).click();
 for(let turn=1;turn<=60;turn++){const end=page.getByRole('button',{name:'End turn',exact:true});if(await end.isDisabled())break;await finishTurn(page);await expect(page.getByText('TURN '+String(turn+1).padStart(3,'0'),{exact:true})).toBeVisible();}
 await expect(page.locator('.victory-banner')).toBeVisible();await page.screenshot({path:'tmp/qa/campaign-ending.png',animations:'disabled'});expect(errors).toEqual([]);
});
