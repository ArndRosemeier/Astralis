import {test,expect,type Page} from '@playwright/test';

const savedOptions=(page:Page)=>page.evaluate(()=>new Promise<{limit:number|null|string;turn:number}>((resolve,reject)=>{
 const request=indexedDB.open('astralis');request.onerror=()=>reject(request.error);
 request.onsuccess=()=>{const db=request.result,tx=db.transaction('saves'),get=tx.objectStore('saves').get('autosave');
  get.onsuccess=()=>{const state=get.result?JSON.parse(get.result).state:null;resolve({limit:state?state.options.turnLimit:'missing',turn:state?.turn??-1});};get.onerror=()=>reject(get.error);tx.oncomplete=()=>db.close();};
}));

test('an unlimited expedition saves its setting and resumes with working turns',async({page})=>{
 await page.emulateMedia({reducedMotion:'reduce'});
 await page.goto('/');await page.getByRole('button',{name:'Click to start',exact:true}).click();
 await page.getByRole('button',{name:'Begin an expedition',exact:true}).click();
 await expect(page.getByRole('combobox',{name:'Turn limit',exact:true})).toHaveValue('120');
 await page.getByRole('combobox',{name:'Turn limit',exact:true}).selectOption({label:'No turn limit (infinite)'});
 await expect(page.getByText('No score deadline. Other victory conditions still apply.',{exact:true})).toBeVisible();
 await page.getByText('Advanced expedition rules',{exact:true}).click();await page.getByLabel('Guided introduction').uncheck();
 await page.getByRole('button',{name:'Lift the Veil',exact:true}).click();
 await expect.poll(()=>savedOptions(page)).toEqual({limit:null,turn:0});
 await page.getByRole('button',{name:'End turn',exact:true}).click();await expect.poll(()=>savedOptions(page)).toEqual({limit:null,turn:1});
 await page.reload();await page.getByRole('button',{name:'Click to start',exact:true}).click();await page.getByRole('button',{name:'Continue expedition',exact:true}).click();
 await page.getByRole('button',{name:'End turn',exact:true}).click();await expect.poll(()=>savedOptions(page)).toEqual({limit:null,turn:2});
});
