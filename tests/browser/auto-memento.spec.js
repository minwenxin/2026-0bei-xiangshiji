import {test,expect} from '@playwright/test'
import {stallDialogues} from '../../src/data/stall-dialogues.js'
const key='xiangshiji:formal:v1',d=stallDialogues.find(s=>s.foodId==='blackbean-ribs')
async function finalLine(page){
 await page.goto('/')
 await page.evaluate(({key,d})=>localStorage.setItem(key,JSON.stringify({stories:{[d.id]:{found:true,page:0,dialogueVersion:1,dialogueIndex:d.lines.length-1,readComplete:false,collected:false}}})),{key,d})
 await page.goto('/#/story/'+d.id);await page.reload();await page.getByRole('button',{name:'继续上次'}).click()
}
async function record(page){return page.evaluate(({key,id})=>JSON.parse(localStorage.getItem(key)).stories[id],{key,id:d.id})}
test('末句未显示完不领取，首次入册动画，重播不重复播放',async({page},info)=>{
 await finalLine(page)
 expect((await record(page)).collected).toBe(false)
 await page.getByLabel('逐字显示').uncheck()
 await expect(page.locator('.memento-arrival')).toBeVisible()
 expect((await record(page)).collected).toBe(true)
 await expect(page.locator('.arrival-scene img')).toHaveCSS('animation-name',/sticker-arrival/)
 await page.waitForTimeout(450);await page.screenshot({path:info.outputPath('memento-arrival.png')})
 const fading=await page.locator('.memento-arrival').evaluate(e=>{const a=e.getAnimations().find(a=>a.animationName?.startsWith('arrival-dismiss'));a.pause();a.currentTime=4200;return Number(getComputedStyle(e).opacity)})
 expect(fading).toBeGreaterThan(0);expect(fading).toBeLessThan(1)
 await expect(page.locator('.memento-arrival')).toHaveCount(0,{timeout:5000})
 await page.getByRole('button',{name:'再聊一遍'}).click()
 for(let i=1;i<d.lines.length;i++){await page.waitForTimeout(200);await page.locator('.dialogue-next').click()}
 await page.waitForTimeout(1100);await expect(page.locator('.memento-arrival')).toHaveCount(0)
})
test('领取持久化失败不播放成功动画，重试后再入册，减少动态效果',async({page})=>{
 await page.emulateMedia({reducedMotion:'reduce'});await finalLine(page)
 await page.evaluate(()=>{const original=Storage.prototype.setItem;let calls=0;window.restoreStorage=()=>Storage.prototype.setItem=original;Storage.prototype.setItem=function(...args){if(++calls===2)throw Error('quota');return original.apply(this,args)}})
 await expect(page.getByRole('button',{name:'重试保存'})).toBeVisible()
 expect((await record(page)).collected).toBe(false)
 await expect(page.locator('.memento-arrival')).toHaveCount(0)
 await page.evaluate(()=>window.restoreStorage());await page.getByRole('button',{name:'重试保存'}).click()
 await expect(page.locator('.memento-arrival')).toBeVisible()
 expect((await record(page)).collected).toBe(true)
 await expect(page.locator('.arrival-scene img')).toHaveCSS('animation-name','none')
})
test('末句领取前离开不在后台领取',async({page})=>{
 await page.emulateMedia({reducedMotion:'reduce'});await finalLine(page)
 await page.locator('.noodle-dialogue > .back').click()
 await page.waitForTimeout(1200)
 expect((await record(page)).collected).toBe(false)
})
