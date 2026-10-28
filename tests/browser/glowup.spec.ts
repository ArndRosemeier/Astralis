import {test,expect} from '@playwright/test';

test('title probes work without motion and setup can be dismissed with Escape',async({page})=>{
 await page.emulateMedia({reducedMotion:'reduce'});
 await page.goto('/');await page.getByRole('button',{name:'Click to start',exact:true}).click();
 await expect(page.locator('html')).toHaveAttribute('data-motion','off');
 await page.getByRole('button',{name:'Lunar approach',exact:true}).click();
 await expect(page.getByRole('button',{name:'Lunar approach',exact:true})).toHaveAttribute('aria-pressed','true');await page.getByRole('button',{name:'Homeworld',exact:true}).click();
 const probe=page.getByRole('button',{name:/Launch a probe/});
 await probe.focus();await page.keyboard.press('Enter');
 await expect(page.getByText(/Probe reports: space is enormous/)).toBeVisible();
 await page.getByRole('button',{name:'Begin an expedition',exact:true}).click();
 await page.keyboard.press('Escape');
 await expect(page.getByRole('heading',{name:'ASTRALIS',exact:true})).toBeVisible();
 await page.screenshot({path:'tmp/qa/glowup-title.png',animations:'disabled'});
 await page.setViewportSize({width:390,height:844});
 await expect(probe).toBeInViewport();
 await expect(page.getByRole('button',{name:'Begin an expedition',exact:true})).toBeInViewport();
 await page.screenshot({path:'tmp/qa/glowup-title-mobile.png',animations:'disabled'});
});

test('colony cards and output charts follow queued focus changes',async({page})=>{
 const errors:string[]=[];page.on('pageerror',error=>errors.push(error.message));
 await page.goto('/');await page.getByRole('button',{name:'Click to start',exact:true}).click();await page.getByRole('button',{name:'Begin an expedition',exact:true}).click();
 await page.getByRole('button',{name:'Lift the Veil',exact:true}).click();
 await page.getByRole('button',{name:'Empire',exact:true}).click();
 await expect(page.getByRole('heading',{name:'Worlds at work'})).toBeVisible();
 const industry=page.locator('.yield-line.industry b').first();const before=Number(await industry.innerText());
 await page.getByLabel('Earth focus',{exact:true}).selectOption('Industry');
 await expect.poll(async()=>Number(await industry.innerText())).toBeGreaterThan(before);
 await page.screenshot({path:'tmp/qa/glowup-empire.png',animations:'disabled'});
 await page.getByRole('button',{name:/Sol SYSTEM Earth/}).click();
 await expect(page.getByRole('heading',{name:'Earth',exact:true})).toBeVisible();
 await page.getByRole('button',{name:'Research',exact:true}).click();
 await page.screenshot({path:'tmp/qa/glowup-research.png',animations:'disabled'});
 expect(errors).toEqual([]);
});

test('a fresh expedition clears the previous fleet selection',async({page})=>{
 await page.goto('/');await page.getByRole('button',{name:'Click to start',exact:true}).click();await page.getByRole('button',{name:'Begin an expedition',exact:true}).click();
 await page.getByRole('button',{name:'Lift the Veil',exact:true}).click();
 await page.getByRole('button',{name:'Fleets',exact:true}).click();
 await page.getByRole('button',{name:'Chart course'}).first().click();
 await expect(page.locator('.fleet-course')).toBeVisible();
 await page.getByRole('button',{name:'Game menu',exact:true}).click();
 await page.getByRole('button',{name:'Return to title',exact:true}).click();
 await page.getByRole('button',{name:'Begin an expedition',exact:true}).click();
 await page.getByRole('button',{name:'Lift the Veil',exact:true}).click();
 await expect(page.locator('.fleet-course')).toHaveCount(0);
});
