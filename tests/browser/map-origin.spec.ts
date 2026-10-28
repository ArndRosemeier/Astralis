import {test,expect} from '@playwright/test';

test('alien map centers on its capital on start, flatten, Home and saved-game resume',async({page})=>{
 await page.addInitScript(()=>localStorage.setItem('astralis-settings',JSON.stringify({sound:false,motion:false,tutorial:false})));
 await page.goto('/');await page.getByRole('button',{name:'Click to start',exact:true}).click();
 await page.getByRole('button',{name:'Begin an expedition',exact:true}).click();
 await page.locator('.species-picker').getByRole('button',{name:/^Vael/}).click();
 await page.getByRole('button',{name:'Lift the Veil',exact:true}).click();
 const map=page.locator('.star-map');const origin=await map.getAttribute('data-origin');expect(origin).not.toBe('sol');
 const homeName=await page.locator('.system-name h2').innerText();
 await expect(page.locator('.system-heading')).toContainText(`0.00 ly from ${homeName}`);
 await expect(page.getByRole('heading',{name:`${homeName} neighbourhood`,exact:true})).toBeVisible();
 const centered=async()=>{await expect.poll(()=>page.locator('.star-label.selected').evaluate(el=>{const t=new DOMMatrix(getComputedStyle(el).transform);return Math.abs(t.m41-innerWidth/2)+Math.abs(t.m42-innerHeight/2);})).toBeLessThan(3);};
 await centered();await page.getByRole('button',{name:'3D view',exact:true}).click();await centered();
 await page.mouse.move(650,350);await page.mouse.down();await page.mouse.move(750,480,{steps:10});await page.mouse.up();
 await page.getByRole('button',{name:'Reset camera (Home)',exact:true}).click();await centered();
 await page.reload();await page.getByRole('button',{name:'Click to start',exact:true}).click();await page.getByRole('button',{name:'Continue expedition',exact:true}).click();
 await expect(map).toHaveAttribute('data-origin',origin!);await centered();
 await page.screenshot({path:'tmp/qa/alien-home-map.png',animations:'disabled'});
});
