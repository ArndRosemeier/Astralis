import {test,expect} from '@playwright/test';
test('Shift-click two ships then click the destination star itself',async({page})=>{
 await page.emulateMedia({reducedMotion:'reduce'});await page.goto('/');await page.getByRole('button',{name:'Click to start',exact:true}).click();await page.getByRole('button',{name:'Begin an expedition',exact:true}).click();await page.getByText('Advanced expedition rules',{exact:true}).click();await page.getByLabel('Guided introduction').uncheck();await page.getByRole('button',{name:'Lift the Veil',exact:true}).click();
 const ships=page.locator('.ship-marker');await ships.nth(0).click({modifiers:['Shift']});await ships.nth(1).click({modifiers:['Shift']});await expect(page.locator('.ship-marker[aria-pressed=true]')).toHaveCount(2);
 const destination=page.locator('.star-label').filter({hasText:'Alpha Centauri'});await expect(destination).toHaveClass(/reachable/);
 const point=await destination.evaluate(el=>{const m=new DOMMatrix(getComputedStyle(el).transform),r=el.parentElement!.getBoundingClientRect();return {x:r.x+m.m41,y:r.y+m.m42};});
 await page.mouse.click(point.x,point.y);await expect(page.locator('.ship-marker[aria-pressed=true]')).toHaveCount(0);await expect(page.locator('.toast')).toContainText('course to Alpha Centauri');await expect(page.locator('.fleet-course')).toHaveCount(0);
});
