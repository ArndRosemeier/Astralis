import {test,expect} from '@playwright/test';
import {TITLE_NEBULAE} from '../../apps/web/src/title-nebula';

test('startup selects one nebula and retains it through the gate, dialogs, quality changes and title return',async({page})=>{
 const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('/');const scene=page.locator('.title-observatory');const id=await scene.getAttribute('data-nebula');
 const sun=await scene.getAttribute('data-sun');expect(sun).toMatch(/sun$/);
 expect(TITLE_NEBULAE.map(n=>n.id)).toContain(id);
 const path=TITLE_NEBULAE.find(n=>n.id===id)!.path;
 await expect(scene).toHaveCSS('background-size','cover');await expect(scene).toHaveCSS('background-image',new RegExp(path.replaceAll('.','\\.')));
 await page.getByRole('button',{name:'Click to start',exact:true}).click();await expect(scene).toHaveAttribute('data-nebula',id!);
 await page.getByRole('button',{name:'Settings',exact:true}).click();await page.getByRole('combobox',{name:/Graphics quality/}).selectOption('Low');await expect(scene).toHaveAttribute('data-nebula',id!);await page.keyboard.press('Escape');
 await page.getByRole('button',{name:'Begin an expedition',exact:true}).click();await page.getByRole('button',{name:'Back',exact:true}).click();await expect(scene).toHaveAttribute('data-nebula',id!);
 await expect(scene).toHaveAttribute('data-sun',sun!);
 for(const nebula of TITLE_NEBULAE){
  await scene.evaluate((el,path)=>{(el as HTMLElement).style.backgroundImage=`url(${path})`;},nebula.path);
  await page.evaluate(path=>new Promise<void>((resolve,reject)=>{const img=new Image();img.onload=()=>resolve();img.onerror=()=>reject(Error(path));img.src=path;}),nebula.path);
  await page.screenshot({path:`tmp/qa/title-nebula-${nebula.id}.png`});
 }
 await page.setViewportSize({width:390,height:844});await page.screenshot({path:'tmp/qa/title-nebula-phone.png'});
 expect(errors).toEqual([]);
});
