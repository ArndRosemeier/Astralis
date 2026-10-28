import {test} from 'node:test';
import assert from 'node:assert/strict';
import {existsSync} from 'node:fs';
import {TITLE_NEBULAE,chooseTitleNebula} from '../apps/web/src/title-nebula';
test('each nebula has an equal selection interval and a shipped asset',()=>{
 for(let i=0;i<4;i++){
  assert.equal(chooseTitleNebula(()=>i/4).id,TITLE_NEBULAE[i].id);
  assert.equal(chooseTitleNebula(()=>(i+1)/4-.00001).id,TITLE_NEBULAE[i].id);
  assert.ok(existsSync('public/'+TITLE_NEBULAE[i].path));
 }
});
