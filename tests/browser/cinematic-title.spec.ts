import {test,expect} from '@playwright/test';

test('sculpture, close passes, paused viewpoints and compact navigation',async({page})=>{
 test.setTimeout(180000);
 const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
 await page.goto('/');await page.getByRole('button',{name:'Click to start',exact:true}).click();
 const scene=page.locator('.cinematic-scene');
 await expect(page.locator('.title-sculpture--rendered')).toBeVisible();
 await expect(scene).toHaveAttribute('data-traffic',/arriving|departing|docked|cruising/);
 await page.mouse.move(10,10);await page.screenshot({path:'tmp/qa/cinematic-home.png'});
 await expect(page.locator('.title-tagline,.probe-console,.observatory-controls')).toHaveCount(0);
 await page.getByRole('button',{name:'Animate ASTRALIS title',exact:true}).click();
 await expect(scene).toHaveAttribute('data-sculpture','reassembling');
 await page.mouse.move(10,10);await page.waitForTimeout(1500);
 await page.screenshot({path:'tmp/qa/cinematic-sculpture.png'});
 await expect(scene).toHaveAttribute('data-flyby','waiting',{timeout:60000});
 // Freeze at the actual close pass, even when software WebGL makes screenshots slow.
 await scene.evaluate(el=>{const observer=new MutationObserver(()=>{if((el as HTMLElement).dataset.flyby==='close-pass'){document.querySelector<HTMLButtonElement>('[aria-label="Pause scene"]')!.click();observer.disconnect();}});observer.observe(el,{attributes:true,attributeFilter:['data-flyby']});});
 await page.getByRole('button',{name:'Send a close flyby',exact:true}).click();
 await expect(page.getByRole('button',{name:'Resume scene',exact:true})).toBeVisible({timeout:60000});
 await expect(scene).toHaveAttribute('data-flyby','close-pass');
 await page.screenshot({path:'tmp/qa/cinematic-flyby.png'});
 const capture=()=>page.screenshot({clip:{x:700,y:330,width:650,height:380},animations:'disabled'});
 await page.waitForTimeout(400);const frozen=await capture();await page.waitForTimeout(500);expect((await capture()).equals(frozen)).toBe(true);
 await page.getByRole('button',{name:'Change viewpoint',exact:true}).click();
 await expect(scene).toHaveAttribute('data-view','1');
 await page.getByRole('button',{name:'Change viewpoint',exact:true}).click();
 await expect(scene).toHaveAttribute('data-view','2');
 await page.screenshot({path:'tmp/qa/cinematic-dock.png'});
 await page.getByRole('button',{name:'Change viewpoint',exact:true}).click();
 await page.setViewportSize({width:390,height:844});
 await expect(page.getByRole('button',{name:'Begin an expedition',exact:true})).toBeInViewport();
 await expect(page.getByRole('button',{name:/BUILD .*What's new/})).toBeInViewport();
 await page.screenshot({path:'tmp/qa/cinematic-phone.png'});
 await page.getByRole('button',{name:/BUILD .*What's new/}).click();
 await expect(page.getByRole('dialog')).toBeVisible();
 expect(errors).toEqual([]);
});

test('without WebGL the title stays readable and navigation still works',async({page})=>{
 await page.addInitScript(()=>{const getContext=HTMLCanvasElement.prototype.getContext;HTMLCanvasElement.prototype.getContext=function(this:HTMLCanvasElement,kind:string,...args:any[]){if(kind.includes('webgl'))return null;return (getContext as any).call(this,kind,...args);} as any;});
 await page.goto('/');await expect(page.locator('.scene-unavailable')).toBeVisible();
 await expect(page.locator('.title-sculpture--rendered')).toHaveCount(0);
 const title=page.getByRole('button',{name:'Animate ASTRALIS title',exact:true});
 await expect(title).not.toHaveCSS('color','rgba(0, 0, 0, 0)');
 await page.getByRole('button',{name:'Click to start',exact:true}).click();
 await page.getByRole('button',{name:/BUILD .*What's new/}).click();await expect(page.getByRole('dialog')).toBeVisible();
 await page.keyboard.press('Escape');await page.getByRole('button',{name:'Begin an expedition',exact:true}).click();
 await expect(page.getByRole('button',{name:'Lift the Veil',exact:true})).toBeVisible();
});

test('letters orbit independently through world depth and reassemble while the sun persists',async({page})=>{
 test.setTimeout(120000);
 const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('/');await page.getByRole('button',{name:'Click to start',exact:true}).click();
 const scene=page.locator('.cinematic-scene'),sun=await scene.getAttribute('data-sun');
 await page.screenshot({path:'tmp/qa/living-sky-sun.png'});
 await scene.evaluate(el=>{const observer=new MutationObserver(()=>{if((el as HTMLElement).dataset.titleOrbitPhase==='behind-world'){document.querySelector<HTMLButtonElement>('[aria-label="Pause scene"]')!.click();observer.disconnect();}});observer.observe(el,{attributes:true,attributeFilter:['data-title-orbit-phase']});});
 await page.getByRole('button',{name:'Orbit the title',exact:true}).click();
 await expect(scene).toHaveAttribute('data-title-orbit','orbiting');
 await expect(scene).toHaveAttribute('data-orbit-letters',/[2-7]/);
 await page.screenshot({path:'tmp/qa/letter-orbit-departure.png'});
 await expect(page.getByRole('button',{name:'Resume scene',exact:true})).toBeVisible({timeout:60000});
 await expect(scene).toHaveAttribute('data-orbit-letters',/[5-8]/);
 await page.screenshot({path:'tmp/qa/living-sky-title-behind.png'});
 await page.setViewportSize({width:390,height:844});await page.screenshot({path:'tmp/qa/letter-orbit-phone.png'});
 await page.setViewportSize({width:1440,height:1000});
 await page.getByRole('button',{name:'Resume scene',exact:true}).click();
 await expect(scene).toHaveAttribute('data-title-orbit','home',{timeout:60000});
 await expect(scene).toHaveAttribute('data-sun',sun!);
 await page.screenshot({path:'tmp/qa/living-sky-title-return.png'});
 expect(errors).toEqual([]);
});
