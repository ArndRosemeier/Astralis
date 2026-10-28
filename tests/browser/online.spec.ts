import {test,expect} from '@playwright/test';
test('two commanders exchange a turn and survive a host migration',async({browser})=>{
 const a=await browser.newContext({viewport:{width:1280,height:900}}),b=await browser.newContext({viewport:{width:1280,height:900}});
 try{
  for(const context of [a,b])await context.addInitScript(()=>localStorage.setItem('astralis-settings',JSON.stringify({tutorial:false,motion:false,quality:'Low'})));
  const host=await a.newPage(),guest=await b.newPage();const errors:string[]=[];for(const page of [host,guest])page.on('pageerror',e=>errors.push(e.message));
  await host.goto('/');await host.getByRole('button',{name:'Click to start',exact:true}).click();await host.getByRole('button',{name:'Online play',exact:true}).click();await host.getByLabel('Your commander name').fill('QA Host');await host.getByRole('button',{name:'Create private room'}).click();await expect(host.getByRole('button',{name:'End turn'})).toBeVisible();await host.getByRole('button',{name:'Game menu'}).click();await host.getByRole('button',{name:'Online play',exact:true}).click();const code=await host.locator('.room-code strong').innerText();expect(code).toMatch(/^[A-Z0-9]{6}$/);await host.keyboard.press('Escape');
  await guest.goto('/');await guest.getByRole('button',{name:'Click to start',exact:true}).click();await guest.getByRole('button',{name:'Online play',exact:true}).click();await guest.getByLabel('Your commander name').fill('QA Guest');await guest.getByLabel('Room code').fill(code);await guest.getByRole('button',{name:'Join expedition',exact:true}).click();await expect(guest.getByRole('button',{name:'End turn'})).toBeVisible();
  await host.getByRole('button',{name:'End turn'}).click();await expect(host.getByRole('button',{name:'Waiting for commanders'})).toBeVisible();await guest.getByRole('button',{name:'End turn'}).click();await expect(host.getByText('TURN 002',{exact:true})).toBeVisible();await expect(guest.getByText('TURN 002',{exact:true})).toBeVisible();
  await host.close();await guest.getByRole('button',{name:'End turn'}).click();await expect(guest.getByText('TURN 003',{exact:true})).toBeVisible();expect(errors).toEqual([]);
 }finally{await a.close();await b.close();}
});
