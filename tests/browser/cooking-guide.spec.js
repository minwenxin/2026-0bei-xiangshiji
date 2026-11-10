import {test,expect} from '@playwright/test'
import {button,blanch,mixNoodles,finishNoodles,prepareZongzi,tieZongzi,finishZongzi} from './cooking-helpers.js'

async function checkAssets(page){
 await page.evaluate(async()=>Promise.all([...document.images].map(img=>img.decode())))
 const loaded=await page.locator('.workstation-canvas').evaluate(async el=>{const url=getComputedStyle(el).backgroundImage.match(/url\(["']?(.*?)["']?\)/)?.[1];const image=new Image();image.src=url;await image.decode();return image.naturalWidth>0})
 expect(loaded).toBe(true)
}
async function layout(page){
 await expect(page.locator('.station-speech')).toHaveCount(1)
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true)
 const bubble=await page.locator('#cook-dialogue').boundingBox(),scene=await page.locator('.workstation-canvas').boundingBox(),controls=await page.locator('.cook-controls').boundingBox()
 expect(controls.y).toBeGreaterThanOrEqual(scene.y+scene.height)
 expect(await page.locator('#cook-dialogue').evaluate(e=>e.scrollWidth<=e.clientWidth)).toBe(true)
 for(const sel of ['.ingredient-drawer','.seasoning-shelf','.blanch-skimmer','.layered-bowl','.zongzi-workspace','.zongzi-pot-area'])if(await page.locator(sel).count()){
  const r=await page.locator(sel).boundingBox()
  expect(bubble.x+bubble.width<=r.x||r.x+r.width<=bubble.x||bubble.y+bubble.height<=r.y||r.y+r.height<=bubble.y,sel).toBe(true)
 }
}
for(const width of [1440,720])for(const kind of ['noodles','zongzi'])test(`${kind} ${width} 完整流程、素材与布局`,async({page},testInfo)=>{
 await page.setViewportSize({width,height:1000});await page.goto('/#/cook/'+(kind==='noodles'?'sesame-noodles':'jiaxing-zongzi'))
 const errors=[];page.on('pageerror',e=>errors.push(e.message))
 await checkAssets(page);await layout(page)
 for(const slot of await page.locator('.ingredient-slot').all()){
  const image=await slot.locator('.ingredient-row-icon,.ingredient-object').boundingBox(),label=await slot.locator('.slot-caption').boundingBox()
  expect(image.y+image.height).toBeLessThanOrEqual(label.y+1)
 }
 if(kind==='noodles'){
  await blanch(page);await mixNoodles(page);await layout(page);await checkAssets(page)
  await page.screenshot({path:testInfo.outputPath('mixed.png'),fullPage:true})
  await page.getByRole('button',{name:'下一步'}).click();await button(page,'萝卜丁与葱花').click()
  for(const side of ['左侧','中间','右侧'])await button(page,'在面碗'+side+'撒料').click()
  await button(page,'在面碗左侧撒料').click();await expect(page.locator('.garnish-morsels')).toHaveCount(3)
  await expect(page.locator('.cook-phase')).toContainText('3/3')
  await button(page,'盛出这一碗').click();await expect(button(page,'再做一碗')).toBeVisible()
 }else{
  await prepareZongzi(page);await layout(page);await checkAssets(page)
  await page.screenshot({path:testInfo.outputPath('thread.png'),fullPage:true})
  await tieZongzi(page);await button(page,'点击桌上的锅煮粽子').click()
  await expect(button(page,'端出这只粽子')).toBeEnabled();await button(page,'端出这只粽子').click();await expect(button(page,'再包一只')).toBeVisible()
 }
 await page.screenshot({path:testInfo.outputPath('finished.png'),fullPage:true});expect(errors).toEqual([])
})
for(const keyboard of [false,true])test(`粽子完整${keyboard?'键盘':'鼠标'}流程和重做`,async({page})=>{
 await page.goto('/#/cook/jiaxing-zongzi');await finishZongzi(page,keyboard)
 const stored=await page.evaluate(()=>JSON.parse(localStorage.getItem('xiangshiji:formal:v1')))
 expect(stored.cooking).toEqual({'jiaxing-zongzi':true});expect(stored.stories).toEqual({})
 await button(page,'再包一只').click();await expect(page.locator('.cook-phase')).toContainText('折叶 0/3');await expect(page.locator('.parcel-tie')).toHaveCount(0)
})
test('取消、移出、无效拖动与离页不累计',async({page})=>{
 await page.goto('/#/cook/sesame-noodles');await button(page,'漏勺').click()
 const tool=button(page,'按住漏勺烫面，松开提起'),next=page.getByRole('button',{name:'下一步'})
 await tool.focus();await page.keyboard.down('Space');await page.waitForTimeout(200);await tool.dispatchEvent('pointercancel');await page.keyboard.up('Space');await page.waitForTimeout(2200);await expect(next).toBeDisabled()
 await tool.scrollIntoViewIfNeeded();let r=await tool.boundingBox();await page.mouse.move(r.x+r.width/2,r.y+r.height/2);await page.mouse.down();await page.mouse.move(r.x+r.width+100,r.y+100);await page.mouse.up();await expect(tool).not.toHaveClass(/immersed/)
 await page.goto('/#/cook/jiaxing-zongzi');await page.waitForTimeout(2000);await page.goto('/#/cook/sesame-noodles');await expect(page.locator('.cook-phase')).toContainText('待选择')
 await blanch(page);await next.click();await button(page,'芝麻酱').click()
 const bowl=page.getByRole('group',{name:'面碗搅拌区'});await bowl.scrollIntoViewIfNeeded();r=await bowl.boundingBox()
 await page.mouse.click(r.x+r.width*.5,r.y+r.height*.43);await expect(page.locator('.cook-phase')).toContainText('0%')
 await page.mouse.move(r.x+2,r.y+r.height-2);await page.mouse.down();await page.mouse.move(r.x+r.width*.5,r.y+r.height*.43);await page.mouse.up();await expect(page.locator('.cook-phase')).toContainText('0%')
 await page.mouse.move(r.x+r.width*.4,r.y+r.height*.43);await page.mouse.down();await page.mouse.move(r.x+r.width*.5,r.y+r.height*.43,{steps:4});await page.mouse.move(r.x+r.width+20,r.y+r.height);const summary=await page.locator('.cook-phase').innerText();await page.mouse.move(r.x+r.width*.3,r.y+r.height*.43);await page.mouse.up();await expect(page.locator('.cook-phase')).toHaveText(summary)
 await expect(page.locator('.noodle-fold').first()).toHaveCSS('transform','matrix(1, 0, 0, 1, 0, 0)')
 await page.goto('/#/food/noodles');await page.waitForTimeout(1000);await page.goto('/#/cook/sesame-noodles');await expect(next).toBeDisabled()
})
test('粽子误选、重复放料、提前松线及煮制取消',async({page})=>{
 await page.goto('/#/cook/jiaxing-zongzi');await button(page,'面粉').click();await expect(page.locator('#cook-dialogue')).toContainText('用粽叶')
 await button(page,'粽叶').click();for(let i=1;i<=3;i++)await button(page,'折叶第'+i+'处').click();await page.getByRole('button',{name:'下一步'}).click()
 await button(page,'肉馅').click();await expect(page.locator('.cook-phase')).toContainText('0/3');await button(page,'糯米').click();await button(page,'糯米').click();await expect(page.locator('.cook-phase')).toContainText('1/3');await expect(page.locator('.rice-base')).toHaveCount(1)
 await button(page,'糯米').click();await expect(page.locator('.cook-phase')).toContainText('1/3');await button(page,'肉馅').click();await button(page,'糯米').click();await page.getByRole('button',{name:'下一步'}).click()
 await button(page,'粽叶').click();for(let i=1;i<=2;i++)await button(page,'包合第'+i+'处').click();await button(page,'棉线').click()
 const path=page.locator('.thread-path');await path.scrollIntoViewIfNeeded();let r=await path.boundingBox();const pt=(x,y)=>[r.x+r.width*x/100,r.y+r.height*y/100]
 await page.mouse.move(...pt(32,43));await page.mouse.down();await page.mouse.move(...pt(65,36),{steps:14});await page.mouse.up();await expect(page.locator('.cook-phase')).toContainText('2/5')
 await page.mouse.move(...pt(65,36));await page.mouse.down();await page.mouse.move(...pt(98,98));await page.mouse.up();await expect(page.locator('.cook-phase')).toContainText('2/5')
 for(let i=3;i<=5;i++){await button(page,'包扎路径第'+i+'点').focus();await page.keyboard.press('Enter')}
 await button(page,'点击桌上的锅煮粽子').click();await expect(button(page,'棉线')).toBeDisabled();await page.evaluate(()=>window.dispatchEvent(new Event('blur')));await page.waitForTimeout(2100);await expect(button(page,'端出这只粽子')).toBeDisabled();await button(page,'点击桌上的锅煮粽子').click();await expect(button(page,'端出这只粽子')).toBeEnabled()
})
test('独立保存、保存失败重试与详情入口',async({page})=>{
 await page.goto('/#/food/zongzi');await page.getByRole('link',{name:'跟着师傅做一道'}).click();await expect(page).toHaveURL(/jiaxing-zongzi/)
 await finishZongzi(page,true)
 await page.goto('/#/cook/sesame-noodles');await blanch(page,true);await mixNoodles(page,true);await page.getByRole('button',{name:'下一步'}).click();await button(page,'萝卜丁与葱花').click();for(const side of ['左侧','中间','右侧'])await button(page,'在面碗'+side+'撒料').click()
 await page.evaluate(()=>{window.originalSetItem=Storage.prototype.setItem;Storage.prototype.setItem=function(){throw new DOMException('容量不足','QuotaExceededError')}})
 await button(page,'盛出这一碗').click();await expect(page.locator('#cook-dialogue')).toContainText('没记住');await expect(button(page,'再做一碗')).toHaveCount(0)
 let stored=await page.evaluate(()=>JSON.parse(localStorage.getItem('xiangshiji:formal:v1')));expect(stored.cooking).toEqual({'jiaxing-zongzi':true})
 await page.evaluate(()=>{Storage.prototype.setItem=window.originalSetItem});await button(page,'盛出这一碗').click();await expect(button(page,'再做一碗')).toBeVisible()
 stored=await page.evaluate(()=>JSON.parse(localStorage.getItem('xiangshiji:formal:v1')));expect(stored.cooking).toEqual({'jiaxing-zongzi':true,'sesame-noodles':true});expect(stored.stories).toEqual({})
 await page.goto('/#/food/noodles');await expect(page.getByRole('link',{name:'跟着师傅做一道'})).toHaveAttribute('href',/sesame-noodles/)
 await page.goto('/#/food/dumplings');await expect(page.getByRole('link',{name:'跟着师傅做一道'})).toHaveAttribute('href','#/cook/jiangnan-xiaolongbao')
})
test('减少动态效果：两种游戏仍可完整操作',async({page})=>{
 await page.emulateMedia({reducedMotion:'reduce'});await page.goto('/#/cook/sesame-noodles');await blanch(page,true);await mixNoodles(page,true);await expect(page.locator('.noodle-fold').first()).toHaveCSS('transform','none');await page.getByRole('button',{name:'下一步'}).click();await button(page,'萝卜丁与葱花').click();await button(page,'在面碗左侧撒料').click();await expect(page.locator('.garnish-morsels')).toHaveCSS('animation-name','none')
 await page.goto('/#/cook/jiaxing-zongzi');await prepareZongzi(page,true);await tieZongzi(page,true);await button(page,'点击桌上的锅煮粽子').click();await expect(page.locator('.pot-steam i').first()).toHaveCSS('animation-name','none');await expect(button(page,'端出这只粽子')).toBeEnabled()
})

test('实际按住和煮制期间切换路由，返回从初态开始',async({page})=>{
 await page.goto('/#/cook/sesame-noodles');await button(page,'漏勺').click();const tool=button(page,'按住漏勺烫面，松开提起')
 await tool.focus();await page.keyboard.down('Space');await page.waitForTimeout(300)
 await page.evaluate(()=>{location.hash='/cook/jiaxing-zongzi'});await page.keyboard.up('Space');await expect(page.locator('.zongzi-workspace')).toBeVisible();await page.waitForTimeout(1900)
 await page.evaluate(()=>{location.hash='/cook/sesame-noodles'});await expect(page.locator('.cook-phase')).toContainText('待选择');await expect(page.locator('.blanch-skimmer')).toHaveCount(0)
 await page.goto('/#/cook/jiaxing-zongzi');await prepareZongzi(page,true);await tieZongzi(page,true);await button(page,'点击桌上的锅煮粽子').click();await page.waitForTimeout(200)
 await page.evaluate(()=>{location.hash='/food/zongzi'});await expect(page.locator('.zongzi-workspace')).toHaveCount(0);await page.waitForTimeout(2100)
 await page.evaluate(()=>{location.hash='/cook/jiaxing-zongzi'});await expect(page.locator('.cook-phase')).toContainText('折叶 0/3')
 const stored=await page.evaluate(()=>JSON.parse(localStorage.getItem('xiangshiji:formal:v1')))
 expect(stored?.cooking||{}).toEqual({});expect(stored?.stories||{}).toEqual({})
})

for(const width of [1440,720])test(`粽子五项调整 ${width}：选叶后出现、同格铺盖米与直接点锅`,async({page},testInfo)=>{
 await page.setViewportSize({width,height:1000});await page.goto('/#/cook/jiaxing-zongzi')
 await expect(page.locator('.zongzi-workspace img')).toHaveCount(0)
 await expect(button(page,'覆盖糯米')).toHaveCount(0)
 await expect(button(page,'煮锅')).toHaveCount(0)
 await expect(page.locator('.put-in-pot')).toHaveCount(0)
 await expect(button(page,'点击桌上的锅煮粽子')).toBeDisabled()
 await button(page,'粽叶').click();await expect(page.locator('.folding-leaf')).toHaveCount(1)
 for(let i=1;i<=3;i++)await button(page,'折叶第'+i+'处').click()
 await page.getByRole('button',{name:'下一步'}).click()
 await button(page,'糯米').click();await button(page,'糯米').click();await expect(page.locator('.cook-phase')).toContainText('1/3')
 await page.locator('.zongzi-workspace').screenshot({path:testInfo.outputPath('rice-bottom.png')})
 await button(page,'肉馅').click();await expect(page.locator('.pork-fill')).toHaveCount(1)
 await page.locator('.zongzi-workspace').screenshot({path:testInfo.outputPath('rice-meat.png')})
 await button(page,'糯米').click();await expect(page.locator('.cook-phase')).toContainText('3/3');await expect(page.locator('.rice-cover')).toHaveCount(1)
 await page.locator('.zongzi-workspace').screenshot({path:testInfo.outputPath('rice-covered.png')})
 await page.getByRole('button',{name:'下一步'}).click();await button(page,'粽叶').click()
 for(let i=1;i<=2;i++)await button(page,'包合第'+i+'处').click()
 await button(page,'棉线').click();await tieZongzi(page)
 await expect(page.locator('.closed-parcel')).toHaveAttribute('src',/cook-tied-zongzi/)
 await expect(page.locator('.thread-path')).toBeHidden();await expect(page.locator('.parcel-tie')).toHaveCount(0)
 await page.screenshot({path:testInfo.outputPath('tied.png'),fullPage:true})
 const pot=button(page,'点击桌上的锅煮粽子');await expect(pot).toBeEnabled();await pot.click()
 await expect(page.locator('.pot-steam')).toBeVisible();await expect(pot).toBeDisabled()
 await expect(button(page,'端出这只粽子')).toBeEnabled();await button(page,'端出这只粽子').click()
 await button(page,'再包一只').click();await expect(page.locator('.zongzi-workspace img')).toHaveCount(0)
})
