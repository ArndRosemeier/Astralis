import {test,expect,type Page} from '@playwright/test';

async function load(page:Page,advanced=false,broken=false){
 await page.addInitScript(()=>localStorage.setItem('astralis-settings',JSON.stringify({motion:false,tutorial:false,celebrations:false,quality:'Low'})));await page.goto('/');
 const saved=await page.evaluate(async({advanced,broken})=>{const {achievementFixture}=await import('/tests/achievement-fixture.ts' as string),{encodeExpedition}=await import('/apps/web/src/save-expedition.ts' as string),{TECHS}=await import('/packages/sim/src/rules.ts' as string);const {game,home,industry}=achievementFixture();game.empires[0].research=[];game.empires[0].researchProgress=0;home.queue=[];industry.queue=[];if(advanced)game.empires[0].techs=TECHS.filter((t:{tier:number})=>t.tier===1).map((t:{id:string})=>t.id);return encodeExpedition(game,0,broken?[{id:'invalid',kind:'command',label:'Missing fleet order',command:{empire:0,type:'strategy',fleet:'missing',strategy:'Brawler'}}]:[]);},{advanced,broken});
 await page.getByRole('button',{name:'Click to start',exact:true}).click();await page.getByRole('button',{name:'Load game',exact:true}).click();await page.locator('input[type=file]').setInputFiles({name:'turn-review.json',mimeType:'application/json',buffer:Buffer.from(saved)});
}

test('research is mandatory, undo restores the gate, and colony review can lead to construction or trade',async({page})=>{
 await load(page);await page.getByRole('button',{name:'End turn',exact:true}).click();await expect(page.locator('.research-required')).toBeVisible();await expect(page.getByText('TURN 001',{exact:true})).toBeVisible();
 await page.locator('.tech-card:enabled').first().click();await page.keyboard.press('Escape');await page.getByRole('button',{name:'Undo order',exact:true}).click();await page.getByRole('button',{name:'End turn',exact:true}).click();await expect(page.locator('.research-required')).toBeVisible();await page.locator('.tech-card:enabled').first().click();await page.keyboard.press('Escape');
 await page.getByRole('button',{name:'End turn',exact:true}).click();const review=page.getByRole('dialog',{name:'turn-review'});await expect(review).toContainText('2 industry per credit');await expect(review.locator('.list-card')).toHaveCount(2);await page.screenshot({path:'tmp/qa/turn-review.png'});
 await review.locator('.list-card').filter({hasText:'Haven'}).click();await expect(page.locator('.world-detail')).toContainText('Haven');await page.getByRole('button',{name:'Ships',exact:true}).click();await page.locator('.build-list button:enabled').filter({hasText:'Survey probe'}).click();
 await page.getByRole('button',{name:'End turn',exact:true}).click();await expect(review.locator('.list-card')).toHaveCount(1);await page.getByRole('button',{name:'Produce trade goods & end turn',exact:true}).click();await expect(page.getByText('TURN 002',{exact:true})).toBeVisible();
 await page.reload();await page.getByRole('button',{name:'Click to start',exact:true}).click();await page.getByRole('button',{name:'Continue expedition',exact:true}).click();await expect(page.getByText('TURN 002',{exact:true})).toBeVisible();
});

test('a blocked turn explains conflicting draft orders and offers a repair path',async({page})=>{
 await load(page,false,true);await expect(page.getByRole('button',{name:'End turn',exact:true})).toBeDisabled();
 const orders=page.getByRole('button',{name:'Turn orders',exact:true});await expect(orders).toContainText('1 need attention');await orders.click();await expect(page.getByRole('alert')).toContainText('Some orders depended');await page.getByRole('button',{name:'Cancel order: Missing fleet order',exact:true}).click();await page.keyboard.press('Escape');await expect(page.getByRole('button',{name:'End turn',exact:true})).toBeEnabled();await page.getByRole('button',{name:'End turn',exact:true}).click();await expect(page.locator('.research-required')).toBeVisible();
});

test('advanced research opens a selectable tier and mobile review supports keyboard dismissal',async({page})=>{
 await page.setViewportSize({width:390,height:844});await load(page,true);await page.getByRole('button',{name:'End turn',exact:true}).click();await expect(page.locator('.tier-tabs button.active')).toHaveText('2');await expect(page.locator('.tech-card:enabled').first()).toBeVisible();await page.locator('.tech-card:enabled').first().click();await page.keyboard.press('Escape');
 await page.getByRole('button',{name:'End turn',exact:true}).click();const dialog=page.getByRole('dialog',{name:'turn-review'});await expect(dialog).toBeVisible();expect(await dialog.evaluate(el=>el.scrollWidth<=el.clientWidth+1)).toBe(true);await page.screenshot({path:'tmp/qa/turn-review-mobile.png'});await page.keyboard.press('Escape');await expect(dialog).toHaveCount(0);await expect(page.getByText('TURN 001',{exact:true})).toBeVisible();
 await page.getByRole('button',{name:'End turn',exact:true}).click();await page.getByRole('button',{name:'Produce trade goods & end turn',exact:true}).click();await expect(page.getByText('TURN 002',{exact:true})).toBeVisible();
});
