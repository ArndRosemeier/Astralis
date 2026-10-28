import {type Page} from '@playwright/test';

// Existing flow tests now complete the same required review as a player.
export async function finishTurn(page:Page){
 await page.getByRole('button',{name:'End turn',exact:true}).click();
 if(await page.locator('.research-required').isVisible()){
  await page.locator('.tech-card:enabled').first().click();await page.keyboard.press('Escape');
  await page.getByRole('button',{name:'End turn',exact:true}).click();
 }
 const confirm=page.getByRole('button',{name:'Produce trade goods & end turn',exact:true});
 if(await confirm.isVisible())await confirm.click();
}
