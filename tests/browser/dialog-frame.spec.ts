import {test,expect} from '@playwright/test';

test('dialog decoration remains outside scrolling content and honors motion preferences',async({page})=>{
 await page.addInitScript(()=>localStorage.setItem('astralis-settings',JSON.stringify({quality:'Low',motion:true,tutorial:false})));
 await page.goto('/');await page.getByRole('button',{name:'Click to start',exact:true}).click();
 await page.getByRole('button',{name:'Begin an expedition',exact:true}).click();
 const setup=page.getByRole('dialog',{name:'Expedition setup'}),frame=page.locator('.dialog-frame');
 await expect(frame).toBeVisible();
 const edge=()=>frame.evaluate(el=>({angle:getComputedStyle(el,'::after').getPropertyValue('--dialog-orbit-angle'),animation:getComputedStyle(el,'::after').animationName,pointer:getComputedStyle(el,'::after').pointerEvents,shadow:getComputedStyle(el,'::before').backgroundImage}));
 const start=await edge();expect(start.animation).toBe('dialog-orbit');expect(start.pointer).toBe('none');expect(start.shadow).toContain('radial-gradient');
 await expect.poll(async()=>(await edge()).angle).not.toBe(start.angle);
 const before=await frame.boundingBox();await setup.evaluate(el=>el.scrollTop=el.scrollHeight);const after=await frame.boundingBox();
 expect(after!.y).toBeCloseTo(before!.y,0);expect(after!.height).toBeCloseTo(before!.height,0);
 await page.getByRole('button',{name:'Lift the Veil',exact:true}).click();
 for(const name of ['Research','Empire','Fleets','Shipyard','Strategies','Diplomacy','Intelligence','Leaders','Manual']){
  await page.getByRole('button',{name,exact:true}).click();await expect(page.locator('.dialog-frame > [role=dialog]')).toBeVisible();
  await page.getByRole('button',{name:'Close dialog (Escape)',exact:true}).click();
 }
 await page.getByRole('button',{name:'Settings',exact:true}).click();
 await page.getByLabel('Animated interface & idle rotation').uncheck();expect((await edge()).animation).toBe('none');
 await page.getByLabel('Animated interface & idle rotation').check();await page.emulateMedia({reducedMotion:'reduce'});expect((await edge()).animation).toBe('none');
 await page.emulateMedia({reducedMotion:'no-preference'});expect((await edge()).animation).toBe('dialog-orbit');
 await expect(frame).toHaveCSS('opacity','1');
 await page.screenshot({path:'tmp/qa/dialog-nebula-desktop.png'});
 await page.setViewportSize({width:390,height:844});
 const box=await frame.boundingBox();expect(box!.x).toBeGreaterThanOrEqual(0);expect(box!.x+box!.width).toBeLessThanOrEqual(390);
 await page.screenshot({path:'tmp/qa/dialog-nebula-phone.png'});
 await page.getByRole('button',{name:'Close dialog (Escape)',exact:true}).click();
});
