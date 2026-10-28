import {test,expect} from '@playwright/test';

test('3D observatory renders, moves, pauses and switches physical viewpoints',async({page})=>{
 const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
 await page.addInitScript(()=>localStorage.setItem('astralis-settings',JSON.stringify({sound:false,motion:true})));
 await page.goto('/');await page.getByRole('button',{name:'Click to start',exact:true}).click();
 const canvas=page.locator('.title-observatory canvas');await expect(canvas).toBeVisible();
 await page.waitForTimeout(2000);await page.screenshot({path:'tmp/qa/observatory-home.png'});
 const capture=()=>page.screenshot({clip:{x:800,y:240,width:570,height:390},animations:'disabled'});const first=await capture();await page.waitForTimeout(1200);expect((await capture()).equals(first)).toBe(false);
 await page.getByRole('button',{name:'Pause orbital motion',exact:true}).click();await page.waitForTimeout(400);
 const frozen=await capture();await page.waitForTimeout(500);expect((await capture()).equals(frozen)).toBe(true);
 await page.getByRole('button',{name:'Orbital shipyard',exact:true}).click();await page.screenshot({path:'tmp/qa/observatory-station.png'});
 await page.getByRole('button',{name:'Lunar approach',exact:true}).click();await page.screenshot({path:'tmp/qa/observatory-moon.png'});
 await page.getByRole('button',{name:'Homeworld',exact:true}).click();
 await page.setViewportSize({width:390,height:844});await page.screenshot({path:'tmp/qa/observatory-phone.png'});
 expect(errors).toEqual([]);
});
