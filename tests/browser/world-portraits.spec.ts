import {finishTurn} from './turn-helpers';
import {test,expect,type Page} from '@playwright/test';
import {portraitCases} from '../world-portrait-cases';

async function load(page:Page){
 await page.emulateMedia({reducedMotion:'reduce'});await page.addInitScript(()=>localStorage.setItem('astralis-settings',JSON.stringify({motion:false,tutorial:false,celebrations:false,quality:'Low'})));await page.goto('/');
 const saved=await page.evaluate(async()=>{const {worldPortraitFixture}=await import('/tests/world-portrait-fixture.ts' as string),{encodeExpedition}=await import('/apps/web/src/save-expedition.ts' as string);return encodeExpedition(worldPortraitFixture(),0);});
 await page.getByRole('button',{name:'Click to start',exact:true}).click();await page.getByRole('button',{name:'Load game',exact:true}).click();await page.locator('input[type=file]').setInputFiles({name:'world-portraits.json',mimeType:'application/json',buffer:Buffer.from(saved)});await expect(page.getByRole('button',{name:'End turn',exact:true})).toBeVisible();
}

test('every kind in one explored system has working art, orbit and expand controls',async({page})=>{
 test.setTimeout(120000);const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});await load(page);
 for(const [name,kind,,,,locked,label] of portraitCases){
  await page.locator('.planet-row').filter({hasText:'Study '+name}).click();const card=page.locator('.world-portrait'),controls=card.getByRole('group',{name:'World portrait view'});
  await expect(card).toHaveAttribute('data-world-kind',kind);await expect(controls.getByRole('button')).toHaveCount(2);await controls.getByRole('button',{name:label,exact:true}).click();await expect(card).toHaveClass(/view-surface/);
  await expect.poll(()=>card.locator('.world-landscape').evaluate((img:HTMLImageElement)=>img.complete&&img.naturalWidth>1000)).toBe(true);
  await expect(page.getByLabel('Permanent lighting zones')).toHaveCount(locked?1:0);await controls.getByRole('button',{name:'Orbit',exact:true}).click();await expect(card).toHaveClass(/view-orbit/);await expect(card.locator('.world-orbit')).toHaveAttribute('data-rendered','true');
  if(kind==='habitat'||kind==='belt')await card.screenshot({path:`tmp/qa/world-${kind}-orbit.png`});
  await card.getByRole('button',{name:/^Expand /}).click();const dialog=page.getByRole('dialog');await expect(dialog).toBeVisible();await expect(dialog.locator('h2')).toHaveText('Study '+name);await expect(dialog).toContainText('Artist’s impression');
  if(['Coast','Giant','Habitat'].includes(name))await page.screenshot({path:`tmp/qa/world-${kind}-study.png`});
  await page.keyboard.press('Escape');await expect(dialog).not.toBeVisible();await expect(card.getByRole('button',{name:/^Expand /})).toBeFocused();
 }
 expect(errors).toEqual([]);
});

test('mobile and no-WebGL worlds retain the same portrait controls',async({page})=>{
 await page.setViewportSize({width:390,height:844});await page.addInitScript(()=>{const original=HTMLCanvasElement.prototype.getContext;HTMLCanvasElement.prototype.getContext=function(this:HTMLCanvasElement,type:string,...args:unknown[]){if(/webgl/i.test(type))return null;return original.call(this,type,...args as [])} as typeof original;});await load(page);
 for(const [name,label,fallback] of [['Coast','Surface','.world-fallback-orb'],['Giant','Atmosphere','.world-fallback-orb'],['Habitat','Habitat','.world-fallback-habitat'],['Belt','Belt','.world-fallback-belt']]){
  await page.locator('.planet-row').filter({hasText:'Study '+name}).click();const card=page.locator('.world-portrait');await card.getByRole('button',{name:label,exact:true}).click();await expect(card.locator('.world-landscape')).toBeVisible();await card.getByRole('button',{name:'Orbit',exact:true}).click();await expect(card.locator(fallback)).toBeVisible();await card.getByRole('button',{name:/^Expand /}).click();const dialog=page.getByRole('dialog');await expect(dialog).toBeVisible();expect((await dialog.boundingBox())!.width).toBeLessThan(390);await page.getByRole('button',{name:'Close world study',exact:true}).click();await expect(dialog).not.toBeVisible();
 }
 await page.locator('.planet-row').filter({hasText:'Study Giant'}).click();await page.locator('.world-portrait').getByRole('button',{name:/^Expand /}).click();await page.screenshot({path:'tmp/qa/world-portraits-mobile.png'});await page.keyboard.press('Escape');await finishTurn(page);await expect(page.getByText('TURN 002',{exact:true})).toBeVisible();
});
