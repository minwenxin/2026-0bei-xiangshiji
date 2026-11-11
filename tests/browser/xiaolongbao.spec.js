import {test,expect} from '@playwright/test'
const recipe='jiangnan-xiaolongbao',key='xiangshiji:formal:v1'
const button=(p,n)=>p.getByRole('button',{name:n,exact:true})
const next=p=>p.locator('.cook-next')
const pinchLabels=['捏起一边','收拢另一边','捏紧收口']
async function activate(target,keyboard=false){if(keyboard){await target.focus();await target.press('Enter')}else await target.click()}
async function roll(page,keyboard=false){
 await activate(button(page,'面团'),keyboard)
 await activate(button(page,'擀面杖'),keyboard)
 const area=page.getByRole('group',{name:'擀皮操作区'})
 if(keyboard){await area.focus();for(let i=0;i<24;i++)await page.keyboard.press(i%2?'ArrowLeft':'ArrowRight')}
 else{
  await area.scrollIntoViewIfNeeded();const r=await area.boundingBox()
  await page.mouse.move(r.x+r.width*.38,r.y+r.height*.5);await page.mouse.down()
  for(let i=0;i<12;i++)await page.mouse.move(r.x+r.width*(i%2?.38:.62),r.y+r.height*.5,{steps:12})
  await page.mouse.up()
 }
 await expect(page.locator('.cook-phase')).toContainText('面皮已擀好')
 await activate(next(page),keyboard)
}
async function fill(page,keyboard=false){
 await activate(button(page,'馅料碗'),keyboard)
 for(const label of pinchLabels)await activate(button(page,label),keyboard)
 await activate(next(page),keyboard)
}
async function place(page,keyboard=false){
 const bun=page.getByRole('button',{name:'按住拖动小笼包入笼，键盘按Enter选择'}),target=button(page,'蒸笼落点，确认放入小笼包')
 if(keyboard){await bun.focus();await page.keyboard.press('Enter');await page.keyboard.press('Tab');await expect(target).toBeFocused();await page.keyboard.press('Space')}
 else{
  await bun.scrollIntoViewIfNeeded();const a=await bun.boundingBox(),b=await target.boundingBox()
  await page.mouse.move(a.x+a.width/2,a.y+a.height/2);await page.mouse.down();await page.mouse.move(b.x+b.width/2,b.y+b.height/2,{steps:16});await page.mouse.up()
 }
 await expect(page.locator('.cook-phase')).toContainText('等待盖盖')
}
async function open(page){await button(page,'盖上笼盖').click();await expect(button(page,'揭开笼盖')).toBeEnabled();await button(page,'揭开笼盖').click();await expect(next(page)).toBeEnabled()}
async function stored(page){return page.evaluate(key=>JSON.parse(localStorage.getItem(key)),key)}

for(const width of [1366,720])for(const keyboard of [false,true])test(`小笼包 ${width} 完整${keyboard?'键盘':'鼠标'}流程与重做`,async({page},info)=>{
 const errors=[];page.on('pageerror',e=>errors.push(e.message))
 await page.setViewportSize({width,height:width===1366?768:1000})
 await page.goto('/#/food/dumplings');await expect(page.getByRole('heading',{name:'江南小笼包',exact:true})).toBeVisible()
 await activate(page.getByRole('link',{name:'跟着师傅做一道'}),keyboard);await expect(page).toHaveURL(new RegExp('/cook/'+recipe))
 await expect(page.locator('input[type=range],.seasoning-shelf')).toHaveCount(0)
 await expect(next(page)).toBeDisabled()
 await expect(page.locator('.bun-dough')).toHaveCount(0)
 await expect(page.locator('.ingredient-slot').first()).toHaveAccessibleName('面团')
 await roll(page,keyboard)
 await page.screenshot({path:info.outputPath('wrapper.png'),fullPage:true})
 await activate(button(page,'馅料碗'),keyboard)
 for(const [index,label] of pinchLabels.entries()){
  const p=button(page,label)
  await expect(page.locator('.bun-pinch-points button')).toHaveCount(1)
  if(keyboard&&index>0)await expect(p).toBeFocused()
  if(keyboard){await p.focus();await page.keyboard.press(index%2?'Enter':'Space')}
  else await p.click()
  await expect(page.locator('.cook-phase')).toContainText(`捏合 ${index+1}/3`)
  await page.screenshot({path:info.outputPath('pleats-'+(index+1)+'.png'),fullPage:true})
 }
 await expect(page.locator('.bun-pinch-points button')).toHaveCount(0)
 await activate(next(page),keyboard);await place(page,keyboard)
 if(keyboard){await button(page,'盖上笼盖').focus();await page.keyboard.press('Enter');await expect(button(page,'揭开笼盖')).toBeEnabled();await button(page,'揭开笼盖').focus();await page.keyboard.press('Space')}
 else{await button(page,'盖上笼盖').click();await button(page,'跳过蒸制演示').click();await button(page,'揭开笼盖').click()}
 await expect(next(page)).toBeEnabled()
 await page.locator('.bun-in-basket').evaluate(img=>img.decode())
 await page.waitForTimeout(350)
 await page.screenshot({path:info.outputPath('opened.png'),fullPage:true})
 await activate(button(page,'出笼啦'),keyboard);await expect(button(page,'再做一笼')).toBeVisible()
 await page.locator('.recipe-serving img').evaluate(img=>img.decode())
 await page.screenshot({path:info.outputPath('served.png'),fullPage:true})
 const saved=await stored(page);expect(saved.cooking).toEqual({[recipe]:true});expect(saved.stories).toEqual({})
 await expect(page.locator('.recipe-serving')).toContainText('整笼成品展示')
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true)
 expect(await page.evaluate(()=>[...document.images].filter(i=>i.complete&&!i.naturalWidth).map(i=>i.src))).toEqual([])
 await activate(button(page,'再做一笼'),keyboard);await expect(page.locator('.cook-phase')).toContainText('等待放面团');await expect(page.locator('.bun-dough')).toHaveCount(0)
 await page.reload();await expect(page.locator('.cook-phase')).toContainText('等待放面团');expect((await stored(page)).cooking[recipe]).toBe(true)
 expect(errors).toEqual([])
})

test('擀皮点击、无效区域、短拖、移出与取消不误完成',async({page})=>{
 await page.goto('/#/cook/'+recipe);await button(page,'擀面杖').click();await expect(page.locator('#cook-dialogue')).toContainText('先点一下面团')
 await button(page,'面团').dblclick();await expect(page.locator('.bun-dough')).toHaveCount(1)
 await expect(page.locator('.bun-rolling-pin')).toHaveCount(0)
 await button(page,'面粉').click();await expect(page.locator('#cook-dialogue')).toContainText('先用擀面杖')
 await button(page,'擀面杖').click();const area=page.getByRole('group',{name:'擀皮操作区'});await area.scrollIntoViewIfNeeded();const r=await area.boundingBox()
 await area.click();await expect(page.locator('.cook-phase')).toContainText('面团待擀')
 await page.mouse.move(r.x+r.width*.25,r.y+r.height*.5);await page.mouse.down();await page.mouse.move(r.x+r.width*.29,r.y+r.height*.5,{steps:4});await page.mouse.up();await expect(page.locator('.cook-phase')).toContainText('面团待擀')
 await page.mouse.move(r.x+r.width*.02,r.y+r.height*.02);await page.mouse.down();await page.mouse.move(r.x+r.width*.08,r.y+r.height*.03,{steps:4});await page.mouse.up();await expect(page.locator('.cook-phase')).toContainText('面团待擀')
 await page.mouse.move(r.x+r.width*.4,r.y+r.height*.5);await page.mouse.down();await page.mouse.move(r.x+r.width*.55,r.y+r.height*.5,{steps:6});await page.mouse.up()
 await expect(page.locator('.cook-phase')).toContainText('正在摊开');await expect(next(page)).toBeDisabled()
 const before=await page.locator('.bun-wrapper').getAttribute('style');await button(page,'擀面杖').click();expect(await page.locator('.bun-wrapper').getAttribute('style')).toBe(before)
 await page.mouse.move(r.x+r.width*.5,r.y+r.height*.5);await page.mouse.down();await page.mouse.move(r.x+r.width*1.05,r.y+r.height*.5)
 const stopped=await page.locator('.bun-wrapper').getAttribute('style');await page.mouse.move(r.x+r.width*.4,r.y+r.height*.5,{steps:6});await page.mouse.up();expect(await page.locator('.bun-wrapper').getAttribute('style')).toBe(stopped)
 await page.mouse.move(r.x+r.width*.5,r.y+r.height*.5);await page.mouse.down();await area.dispatchEvent('pointercancel');await page.mouse.up();await expect(next(page)).toBeDisabled()
 await page.goto('/#/cook/jiaxing-zongzi');await page.goto('/#/cook/'+recipe);await expect(page.locator('.bun-dough')).toHaveCount(0)
})

test('捏合顺序和加馅去重；拖错、提前松开、取消，蒸制失焦与离页',async({page})=>{
 await page.goto('/#/cook/'+recipe);await roll(page,true)
 await button(page,'馅料碗').click();await button(page,'馅料碗').click();await expect(page.locator('.bun-filling-portion')).toHaveCount(1)
 await expect(button(page,'捏紧收口')).toHaveCount(0);await expect(page.locator('.cook-phase')).toContainText('0/3')
 await button(page,'捏起一边').dblclick();await expect(page.locator('.cook-phase')).toContainText('1/3')
 for(const label of pinchLabels.slice(1))await button(page,label).click();await next(page).click()
 const bun=page.locator('.bun-to-steamer');await bun.scrollIntoViewIfNeeded();let r=await bun.boundingBox()
 await page.mouse.move(r.x+r.width/2,r.y+r.height/2);await page.mouse.down();await page.mouse.move(r.x+r.width/2+20,r.y+r.height/2+10);await page.mouse.up()
 await expect(page.locator('#cook-dialogue')).toContainText('回案板');await expect(page.locator('.cook-phase')).toContainText('等待入笼')
 await page.mouse.down();await bun.dispatchEvent('pointercancel');await page.mouse.up();await expect(bun).toHaveCSS('translate','0px')
 await place(page,true);await button(page,'盖上笼盖').click();await page.evaluate(()=>window.dispatchEvent(new Event('blur')));await expect(page.locator('.cook-phase')).toContainText('已暂停');await page.waitForTimeout(1900);await expect(next(page)).toBeDisabled()
 await button(page,'点击笼盖重新开始蒸制').click();await page.goto('/#/food/dumplings');await page.waitForTimeout(1900);await page.goto('/#/cook/'+recipe);await expect(page.locator('.cook-phase')).toContainText('等待放面团')
})

test('保存失败可重试、独立记录与减少动态效果',async({page})=>{
 await page.emulateMedia({reducedMotion:'reduce'})
 await page.goto('/')
 await page.evaluate(key=>localStorage.setItem(key,JSON.stringify({cooking:{'sesame-noodles':true,'jiaxing-zongzi':true},stories:{'breakfast-note':{found:true,collected:true,page:2}}})),key)
 await page.goto('/#/cook/'+recipe);await page.reload();await roll(page,true);await fill(page,true);await place(page,true);await open(page)
 await expect(page.locator('.bun-in-basket')).toHaveAttribute('src',/cook-bun-cooked/)
 await page.evaluate(()=>{window.savedSet=Storage.prototype.setItem;Storage.prototype.setItem=()=>{throw Error('quota')}})
 await button(page,'出笼啦').click();await expect(page.locator('#cook-dialogue')).toContainText('没记住');await expect(button(page,'再做一笼')).toHaveCount(0)
 expect((await stored(page)).cooking).toEqual({'sesame-noodles':true,'jiaxing-zongzi':true})
 await page.evaluate(()=>{Storage.prototype.setItem=window.savedSet});await button(page,'出笼啦').click()
 const result=await stored(page);expect(result.cooking).toEqual({'sesame-noodles':true,'jiaxing-zongzi':true,[recipe]:true});expect(result.stories['breakfast-note'].collected).toBe(true)
})

test('模拟慢网下素材加载、减少动态效果与完整制作',async({page})=>{
 const cdp=await page.context().newCDPSession(page)
 await cdp.send('Network.enable')
 await cdp.send('Network.emulateNetworkConditions',{offline:false,latency:250,downloadThroughput:512*1024,uploadThroughput:128*1024})
 await page.emulateMedia({reducedMotion:'reduce'})
 await page.goto('/#/cook/'+recipe)
 await roll(page,true);await fill(page,true);await place(page,true)
 await button(page,'盖上笼盖').click()
 await expect(page.locator('.bun-steam i').first()).toHaveCSS('animation-name','none')
 await expect(button(page,'揭开笼盖')).toBeEnabled();await button(page,'揭开笼盖').click();await button(page,'出笼啦').click()
 await page.locator('.recipe-serving img').evaluate(img=>img.decode())
 expect(await page.evaluate(()=>[...document.images].every(i=>i.complete&&i.naturalWidth>0))).toBe(true)
 expect((await stored(page)).cooking[recipe]).toBe(true)
})
