import {test,expect} from '@playwright/test';
import {SPECIES} from '../../packages/sim/src/species';

test('setup shows the complete roster, mechanical differences and a comparison',async({page})=>{
  await page.goto('/');
  await page.getByRole('button',{name:'Click to start',exact:true}).click();
  await page.getByRole('button',{name:'Begin an expedition',exact:true}).click();
  for(const s of SPECIES){
    await page.locator('.species-picker').getByRole('button',{name:s.name+' '+s.epithet,exact:true}).click();
    const profile=page.getByRole('region',{name:`${s.name} abilities`});
    await expect(profile.locator('[data-trait]')).toHaveCount(s.picks.length);
    for(const id of s.picks)await expect(profile.locator(`[data-trait="${id}"]`)).toBeAttached();
  }
  await page.locator('.species-picker').getByRole('button',{name:/^Vael /}).click();
  await expect(page.locator('.species-stat.research strong')).toHaveText('+45%');
  await expect(page.locator('.species-budget strong')).toHaveText('10 / 10 points');
  await page.getByLabel('Compare civilization',{exact:true}).selectOption('corundi');
  await expect(page.getByRole('table')).toContainText('+40%');
  await expect(page.locator('.compare-traits')).toContainText('very slow growth');
  await page.locator('.species-profile').scrollIntoViewIfNeeded();
  await page.screenshot({path:'tmp/qa/species-comparison-desktop.png'});
  await page.getByLabel('Compare civilization',{exact:true}).selectOption('');
  await page.setViewportSize({width:390,height:844});
  await page.locator('.species-profile').scrollIntoViewIfNeeded();
  await expect(page.locator('.species-stat.research strong')).toBeVisible();
  expect(await page.locator('.setup-panel').evaluate(el=>el.scrollWidth<=el.clientWidth+1)).toBe(true);
  await page.screenshot({path:'tmp/qa/species-profile-mobile.png'});
  await page.setViewportSize({width:1440,height:1000});
  await page.getByRole('button',{name:'Lift the Veil',exact:true}).click();
  await page.locator('.commander').click();
  await expect(page.getByRole('region',{name:'Vael abilities'}).locator('[data-trait]')).toHaveCount(8);
});

test('saved designs can be repriced in the lab without discarding other custom civilizations',async({page})=>{
  const old={...SPECIES[0],id:'custom-old',name:'Old design',picks:['carbon','autocracy','industry-1','research-2','sealed-metabolism','hardy']};
  const valid={...SPECIES[0],id:'custom-valid',name:'Other design'};
  await page.addInitScript(({old,valid})=>localStorage.setItem('astralis-custom-species',JSON.stringify([old,valid])),{old,valid});
  await page.goto('/');await page.getByRole('button',{name:'Click to start',exact:true}).click();
  await page.getByRole('button',{name:'Begin an expedition',exact:true}).click();
  await expect(page.locator('.species-picker').getByRole('button',{name:/^Other design /})).toBeAttached();
  await page.getByRole('button',{name:'Revise in Species lab',exact:true}).click();
  await page.getByRole('combobox',{name:'Start from',exact:true}).selectOption('custom-old');
  const save=page.getByRole('button',{name:/Save custom species/});await expect(save).toBeDisabled();
  await page.getByRole('button',{name:'tolerance',exact:true}).click();
  await page.locator('.pick-card').filter({hasText:'Sealed metabolism'}).click();
  await page.locator('.pick-card').filter({hasText:'Hardy'}).click();
  await page.getByRole('button',{name:'growth',exact:true}).click();
  await page.locator('.pick-card').filter({hasText:'Very fast reproduction'}).click();
  await expect(save).toBeEnabled();await save.click();
  await expect(page.locator('.species-budget strong')).toHaveText('10 / 10 points');
  const stored=await page.evaluate(()=>JSON.parse(localStorage.getItem('astralis-custom-species')!));
  expect(stored.map((s:{id:string})=>s.id).sort()).toEqual(['custom-old','custom-valid']);
  expect(stored.find((s:{id:string})=>s.id==='custom-old').picks).toContain('growth-very-fast');
});
