import {test,expect} from '@playwright/test';

test.beforeEach(async({page})=>{
 await page.addInitScript(()=>{
  const original=HTMLMediaElement.prototype.play;
  (window as any).audioCalls=[];
  HTMLMediaElement.prototype.play=function(){
   (window as any).audioCalls.push({media:this,activated:navigator.userActivation.isActive});
   return original.call(this);
  };
 });
});

test('sound defaults on but starts only from the welcome gesture, then survives track changes',async({page})=>{
 await page.goto('/');
 await expect(page.getByRole('checkbox',{name:'Enable sound',exact:true})).toBeChecked();
 expect(await page.evaluate(()=>(window as any).audioCalls.length)).toBe(0);
 await page.screenshot({path:'tmp/qa/audio-welcome.png'});
 await page.getByRole('button',{name:'Click to start',exact:true}).press('Enter');
 expect(await page.evaluate(()=>(window as any).audioCalls[0].activated)).toBe(true);
 await expect.poll(()=>page.evaluate(()=>{const m=(window as any).audioCalls[0]?.media;return m&&!m.paused&&m.currentTime>0&&m.volume>0;})).toBe(true);
 await page.getByRole('button',{name:'Begin an expedition',exact:true}).click();
 await page.getByRole('button',{name:'Lift the Veil',exact:true}).click();
 await expect.poll(()=>page.evaluate(()=>{const m=(window as any).audioCalls[0]?.media;return m?.src.endsWith('/exploration.mp3')&&!m.paused&&m.currentTime>0;})).toBe(true);
});

test('saved mute is respected and can be enabled directly from a click',async({page})=>{
 await page.addInitScript(()=>localStorage.setItem('astralis-settings',JSON.stringify({sound:false})));
 await page.goto('/');await expect(page.getByRole('checkbox',{name:'Enable sound',exact:true})).not.toBeChecked();
 await page.getByRole('button',{name:'Click to start',exact:true}).click();
 expect(await page.evaluate(()=>(window as any).audioCalls.length)).toBe(0);
 await page.getByRole('button',{name:'Enable sound',exact:true}).click();
 expect(await page.evaluate(()=>(window as any).audioCalls[0].activated)).toBe(true);
 await expect.poll(()=>page.evaluate(()=>{const m=(window as any).audioCalls[0]?.media;return m&&!m.paused&&m.currentTime>0;})).toBe(true);
});

test('full title fits a narrow screen even with enlarged interface text',async({page})=>{
 await page.setViewportSize({width:360,height:800});
 await page.addInitScript(()=>localStorage.setItem('astralis-settings',JSON.stringify({sound:false,scale:1.35})));
 await page.goto('/');
 const assertFits=async()=>{const bounds=await page.getByRole('heading',{name:'ASTRALIS',exact:true}).evaluate(el=>{const range=document.createRange();range.selectNodeContents(el);const r=range.getBoundingClientRect();return {left:r.left,right:r.right,viewport:innerWidth};});expect(bounds.left).toBeGreaterThanOrEqual(0);expect(bounds.right).toBeLessThanOrEqual(bounds.viewport);};
 await assertFits();await page.getByRole('button',{name:'Click to start',exact:true}).click();await assertFits();
 await page.screenshot({path:'tmp/qa/title-scaled-mobile.png',animations:'disabled'});
});
