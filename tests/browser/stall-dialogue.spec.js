import {test,expect} from '@playwright/test'
import {stallDialogues} from '../../src/data/stall-dialogues.js'
const key='xiangshiji:formal:v1'
for(const id of ['dumplings','zongzi','mapo-tofu','shunde-milk-custard','steamed-wuchang-fish','lanzhou-beef-noodles','gaodan-niangpi']){
 test(id+'入口、读完领取、刷新续读和独立记录',async({page})=>{
  const d=stallDialogues.find(x=>x.foodId===id)
  await page.emulateMedia({reducedMotion:'reduce'})
  await page.goto('/#/story/'+d.id)
  await expect(page.getByRole('heading',{name:'故事还藏在巷子里'})).toBeVisible()
  await page.goto('/#/food/'+id)
  await page.locator('#clue').click()
  await expect(page).toHaveURL(new RegExp('/story/'+d.id))
  await expect(page.getByRole('heading',{name:d.title})).toBeVisible()
  await expect(page.getByRole('button',{name:'收下'+d.memento.name,exact:true})).toHaveCount(d.lines.length===1?1:0)
  for(let i=1;i<d.lines.length;i++){
   await page.getByRole('button',{name:'继续 ›',exact:true}).click()
   await expect(page.locator('.dialogue-copy small')).toHaveText(`第 ${i+1} / ${d.lines.length} 句`)
   await page.waitForTimeout(190)
  }
  await page.getByRole('button',{name:'收下'+d.memento.name,exact:true}).click()
  await expect(page.locator('.collected-note').first()).toContainText('已收录')
  const record=await page.evaluate(key=>JSON.parse(localStorage.getItem(key)),key)
  expect(record.stories[d.id].collected).toBe(true)
  expect(Object.keys(record.stories)).toEqual([d.id])
  await page.reload()
  if(d.lines.length>1)await page.getByRole('button',{name:'继续上次'}).click()
  await expect(page.locator('.collected-note').first()).toContainText('已收录')
  await page.goto('/#/collection')
  await page.getByRole('button',{name:d.province,exact:true}).click()
  await expect(page.getByRole('heading',{name:d.memento.name,exact:true})).toBeVisible()
 })
}
test('720宽度的完整对话、存储失败重试、批次陈列无横向溢出',async({page})=>{
 await page.setViewportSize({width:720,height:1000});await page.emulateMedia({reducedMotion:'reduce'});
 const d=stallDialogues[0];await page.goto('/#/food/'+d.foodId);await page.locator('#clue').click();
 await page.getByRole('button',{name:'继续 ›',exact:true}).click();await expect(page.locator('.dialogue-copy small')).toContainText('第 2');
 await page.reload();await page.getByRole('button',{name:'继续上次'}).click();await expect(page.locator('.dialogue-copy small')).toContainText('第 2');
 await page.screenshot({path:'test-results/stall-dialogue-720.png',fullPage:true});
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
 await page.evaluate(()=>{window.originalSetItem=Storage.prototype.setItem;Storage.prototype.setItem=function(){throw Error('quota')}});
 await page.getByRole('button',{name:'继续 ›',exact:true}).click();await expect(page.getByRole('button',{name:'重试保存'})).toBeVisible();
 await page.evaluate(()=>Storage.prototype.setItem=window.originalSetItem);await page.getByRole('button',{name:'重试保存'}).click();await expect(page.locator('.dialogue-copy small')).toContainText('第 3');
 await page.goto('/#/collection');await expect(page.locator('.memento-entry')).toHaveCount(9);
 await page.getByRole('button',{name:/再翻一页旧物/}).click();await expect(page.locator('.memento-entry')).toHaveCount(18);
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
})
