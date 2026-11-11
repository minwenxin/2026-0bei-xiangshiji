import {test,expect} from '@playwright/test'
import {readFile} from 'node:fs/promises'
const seed=JSON.parse((await readFile(new URL('../../public/data/community-demo.json',import.meta.url),'utf8')).replace(/^\uFEFF/,''))
const mock=async(page,data)=>page.route('**/data/community-demo.json',route=>route.fulfill({json:data}))
const button=(page,name)=>page.getByRole('button',{name,exact:true})
test('六省使用Word原文，文档未给出的湖北保留原文',async({page})=>{
 const copy=[['河南','敦和浓重','中原本味，质朴绵长'],['甘肃','粗中有细','粗似大漠，细如清风'],['四川','热辣如火','辣在舌尖，火在心间'],['广东','百味本鲜','清而不淡，鲜而不俗'],['浙江','鲜雅清隽','山河本味，江南滋味'],['江苏','平和清润','温润雅致，不偏不烈']]
 for(const [name,title,intro] of copy){await page.goto('/#/province/'+name);await expect(page.getByRole('heading',{name:name+'，'+title,exact:true})).toBeVisible();await expect(page.locator('.page-intro')).toHaveText(intro)}
 await page.goto('/#/province/湖北');await expect(page.getByRole('heading',{name:'湖北，有滋有味'})).toBeVisible()
})
test('今日推荐按演示点赞排序，保留搜索、两类筛选与地区',async({page})=>{
 await page.goto('/#/square');await expect(page.locator('.recommendation-story h3')).toHaveText('武汉的早晨，从一碗热干面开始')
 await expect(page.locator('.recommendation-banner')).toContainText('点赞 15')
 await expect(page.locator('.recommendation-banner img')).toHaveCount(0)
 await button(page,'下一篇推荐').click();await expect(page.locator('.recommendation-story h3')).toHaveText('清蒸武昌鱼，真的好嫩');await expect(page.locator('.recommendation-banner')).toContainText('点赞 13')
 await button(page,'小编推荐').click();await expect(page.locator('.feed-caption')).toHaveText('巷口新鲜事');await page.getByRole('button',{name:'再翻一些手记 →'}).click();await expect(page.locator('.scrapbook-post')).toHaveCount(7)
 await button(page,'食客分享').click();await expect(page.locator('.scrapbook-post')).toHaveCount(7);await expect(page.locator('.square-food-note')).toHaveCount(0)
 await page.getByRole('searchbox').fill('武昌鱼');await expect(page.locator('.scrapbook-post')).toHaveCount(1)
 await page.getByRole('searchbox').fill('没有这种美食');await expect(page.getByRole('heading',{name:'这一页还空着'})).toBeVisible()
 await page.getByRole('searchbox').fill('');await page.getByRole('combobox',{name:'筛选地区'}).selectOption('湖北');await expect(page.locator('.scrapbook-post')).toHaveCount(2)
 await button(page,'全部').click()
 await page.getByRole('searchbox').fill('武汉热干面')
 await expect(page.locator('.square-masonry .scrapbook-post')).toHaveCount(1)
 await expect(page.locator('.square-food-note')).toHaveCount(0)
 await page.getByRole('searchbox').fill('排骨藕汤')
 await expect(page.locator('.square-food-note .card-head-meta')).toContainText('小编推荐')
})
test('右侧前五、完整榜、并列和食客到代表小记的闭环；本机互动不改演示榜',async({page})=>{
 await page.goto('/#/square');await expect(page.locator('.square-rank .taster-row')).toHaveCount(5)
 const top=page.locator('.square-rank .taster-row').first();await expect(top).toContainText('68')
 await top.getByRole('link',{name:'巷口阿禾',exact:true}).click();await expect(page.getByRole('heading',{name:'巷口阿禾的寻味手记'})).toBeVisible();await expect(page.locator('.contribution-total')).toContainText('68');await expect(page.locator('.contribution-breakdown')).toContainText('20 分')
 await page.locator('.post-preview').first().click();await expect(page.locator('.place')).toContainText('虚构示例')
 await button(page,'喜欢').click();await button(page,'收藏').click();await page.goto('/#/tasters');await expect(page.locator('.taster-row')).toHaveCount(6);await expect(page.locator('.taster-row').first()).toContainText('68');await expect(page.locator('.taster-row').nth(1)).toContainText('并列');await expect(page.locator('.taster-row').nth(2)).toContainText('并列')
 await expect(page.getByRole('table')).toContainText('每周最多计 3 篇');await expect(page.locator('.demo-disclosure').first()).toContainText('虚构人物与演示数据')
 await page.goto('/#/me');await button(page,'帖子').click();await expect(page.locator('.scrapbook-post')).toHaveCount(1)
})
test('桌面和窄屏可从小饭桌发帖，在我的记录查看消息和三种示例',async({page})=>{
 for(const width of [1440,390]){
  await page.setViewportSize({width,height:900})
  await page.goto('/#/square')
  const table=page.locator('.square-profile')
  await expect(page.locator('.square-title-note').getByRole('link')).toHaveCount(0)
  await expect(page.getByText('本机消息',{exact:true})).toHaveCount(0)
  await table.getByRole('link',{name:'查看我的记录'}).click();await expect(page).toHaveURL(/#\/me$/)
  const notes=page.locator('.me-messages')
  await notes.locator('summary').click();await expect(notes.getByText('已保存 0 条留言。')).toBeVisible()
  await notes.locator('summary').press('Enter');await expect(notes.getByText('已保存 0 条留言。')).toBeHidden()
  const samples=page.getByRole('region',{name:'手记展示示例'})
  await expect(samples.locator('article')).toHaveCount(3)
  for(const name of ['巷口的热干面，趁热拌才香','武汉三鲜豆皮','阿云的早餐笺'])await expect(samples.getByRole('heading',{name})).toBeVisible()
  await expect(samples.getByText('投稿示例 · 待审核')).toBeVisible()
  await expect(page.locator('.me-tallies dd')).toHaveText(['0','0','0'])
  await page.goBack()
  await table.getByRole('link',{name:'写一篇小记'}).click();await expect(page).toHaveURL(/#\/publish$/);await expect(page.getByLabel('推荐标题')).toBeVisible()
 }
})
test('首页保留随机寻味，手机宽度广场使用单列卡片',async({page})=>{
 await page.setViewportSize({width:390,height:900})
 await page.goto('/#/')
 await expect(page.getByRole('button',{name:'今天吃点什么'})).toHaveCount(0)
 await expect(button(page,'随机寻味')).toBeVisible()
 await page.getByRole('navigation',{name:'主导航'}).getByRole('link',{name:'烟火广场'}).click()
 const cards=page.locator('.square-masonry .masonry-item')
 await expect(cards).toHaveCount(12)
 const first=await cards.nth(0).boundingBox(),second=await cards.nth(1).boundingBox()
 expect(first.x).toBe(second.x)
 expect(second.y-first.y-first.height).toBeCloseTo(16,0)
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true)
})
test('无人上榜、加载失败可重试，已移除人物或帖子可继续浏览',async({page})=>{
 await mock(page,{...seed,entries:[]});await page.goto('/#/tasters');await expect(page.getByRole('heading',{name:'这周还没有饭友上榜'})).toBeVisible()
 await page.unroute('**/data/community-demo.json');await page.route('**/data/community-demo.json',route=>route.abort());await page.reload();await expect(page.getByRole('heading',{name:'榜单暂时没取回来'})).toBeVisible()
 await page.unroute('**/data/community-demo.json');await button(page,'重新试试').click();await expect(page.locator('.taster-row')).toHaveCount(6)
 await page.goto('/#/taster/missing');await expect(page.getByRole('heading',{name:'这位饭友的手记暂时找不到了'})).toBeVisible();await page.getByRole('link',{name:'回烟火广场 →'}).click();await expect(page).toHaveURL(/square/)
 await mock(page,{...seed,entries:seed.entries.filter(x=>x.postId!=='note-noodles')});await page.goto('/#/post/note-noodles');await expect(page.getByRole('heading',{name:'这篇小记暂时找不到了'})).toBeVisible()
})

test('小编帖和食客帖的星星、爱心在列表、详情与个人记录同步', async ({ page }) => {
 for (const [title, id] of [['武汉的早晨，从一碗热干面开始', 'note-noodles'], ['清蒸武昌鱼，真的好嫩', 'note-wuchang-fish']]) {
  await page.goto('/#/square')
  const card = page.locator('.square-masonry .scrapbook-post').filter({ has: page.getByRole('heading', {name:title,exact:true}) })
  for (const [label, color] of [['收藏', 'rgb(214, 165, 77)'], ['喜欢', 'rgb(156, 66, 51)']]) {
   const control = card.getByRole('button', { name: label, exact: true })
   await expect(control.locator('svg')).toHaveCSS('fill', 'none')
   await control.press('Space')
   const active = card.getByRole('button', { name: '取消' + label })
   await expect(active).toHaveAttribute('aria-pressed', 'true')
   await expect(active.locator('svg')).toHaveCSS('fill', color)
  }
  await page.goto('/#/post/' + id)
  await expect(button(page,'取消喜欢')).toBeVisible()
  await expect(button(page,'取消收藏')).toBeVisible()
  await page.goto('/#/me')
  await button(page,'帖子').click()
  const saved = page.locator('.me-shelf .scrapbook-post')
  await expect(saved.getByRole('heading',{name:title,exact:true})).toBeVisible()
  await saved.getByRole('button',{name:'取消喜欢'}).click()
  await expect(saved.getByRole('button',{name:'喜欢'}).locator('svg')).toHaveCSS('fill','none')
  await saved.getByRole('button',{name:'取消收藏'}).click()
  await expect(saved).toHaveCount(0)
 }
})
for(const width of [1440,720])test(`广场榜单人物页 ${width} 布局与键盘`,async({page},testInfo)=>{
 await page.setViewportSize({width,height:1000});const errors=[];page.on('pageerror',e=>errors.push(e.message))
 for(const route of ['/square','/tasters','/taster/demo-yun']){
  await page.goto('/#'+route);await expect(page.locator('.taster-row,.taster-profile').first()).toBeVisible()
  await page.evaluate(async()=>Promise.all([...document.images].map(i=>{i.loading='eager';return i.decode()})))
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true)
  await page.screenshot({path:testInfo.outputPath(route.replaceAll('/','-')+'.png'),fullPage:true})
 }
 await page.goto('/#/square');await expect(page.locator('.taster-row')).toHaveCount(5);
 const cards=page.locator('.square-masonry .masonry-item')
 await expect(cards).toHaveCount(12)
 await cards.locator('img').evaluateAll(images=>Promise.all(images.map(image=>{
  image.loading='eager'
  return image.decode()
 })))
 const columns = await cards.evaluateAll(elements => {
  const byPosition = new Map()
  for (const element of elements) {
   const { left, top, bottom, width } = element.getBoundingClientRect()
   if (!byPosition.has(left)) byPosition.set(left, [])
   byPosition.get(left).push({ left, top, bottom, width })
  }
  return [...byPosition.values()]
 })
 expect(columns).toHaveLength(width===720?2:3)
 expect(new Set(columns.flat().map(card=>Math.round(card.bottom-card.top))).size).toBeGreaterThan(2)
 for (const column of columns) {
  for (const [index, card] of column.entries()) {
   expect(Math.abs(card.width-columns[0][0].width)).toBeLessThan(1)
   if (index===0) continue
   const gap=card.top-column[index-1].bottom
   expect(gap).toBeGreaterThanOrEqual(15)
   expect(gap).toBeLessThan(25)
  }
 }
 const more=await page.getByRole('button',{name:'再翻一些手记 →'}).boundingBox()
 expect(more.y-Math.max(...columns.flat().map(card=>card.bottom))).toBeLessThan(35)
 if(width===720){const rank=await page.locator('.square-right').boundingBox(),cards=await page.locator('.square-masonry').boundingBox();expect(rank.y+rank.height).toBeLessThanOrEqual(cards.y)}
 else {
  const rank=page.locator('.square-right')
  await page.evaluate(()=>scrollTo({top:500,behavior:'instant'}))
  const initial=await rank.boundingBox()
  await page.evaluate(()=>scrollTo({top:900,behavior:'instant'}))
  await expect.poll(async()=>Math.abs((await rank.boundingBox()).y-initial.y)).toBeLessThan(2)
  expect(initial.y).toBeGreaterThanOrEqual(100)
  expect(initial.y+initial.height).toBeLessThanOrEqual(1000)
  await rank.evaluate(el=>{el.scrollTop=el.scrollHeight})
  expect(await rank.evaluate(el=>el.scrollTop)).toBeGreaterThan(0)
  expect(await page.evaluate(()=>scrollY)).toBe(900)
  await button(page,'食客分享').click()
  await page.getByRole('combobox',{name:'筛选地区'}).selectOption('湖北')
  await expect(cards).toHaveCount(2)
  expect((await cards.nth(0).boundingBox()).x).toBeCloseTo(columns[0][0].left,0)
  expect((await cards.nth(1).boundingBox()).x).toBeCloseTo(columns[1][0].left,0)
  await page.getByRole('searchbox').fill('武昌鱼')
  await expect(cards).toHaveCount(1)
  expect((await cards.first().boundingBox()).x).toBeCloseTo(columns[0][0].left,0)
  await expect(page.getByRole('button',{name:'再翻一些手记 →'})).toHaveCount(0)
  await page.getByRole('searchbox').fill('')
  await page.getByRole('combobox',{name:'筛选地区'}).selectOption('全部地区')
  await button(page,'全部').click()
 }
 await page.evaluate(()=>scrollTo({top:500,behavior:'instant'}));const left=await page.locator('.square-left').boundingBox();expect(left.y).toBeGreaterThanOrEqual(95);expect(left.y).toBeLessThanOrEqual(150);await page.evaluate(()=>scrollTo({top:0,behavior:'instant'}));const next=button(page,'下一篇推荐');await next.focus();await page.keyboard.press('Enter');await expect(page.locator('.recommendation-story h3')).toHaveText('清蒸武昌鱼，真的好嫩')
 expect(errors).toEqual([])
})

test('北京时间周一零点自动切换演示统计期',async({page})=>{
 await page.clock.install({time:new Date('2026-11-08T15:59:58.000Z')})
 await page.goto('/#/tasters');await expect(page.locator('.week-period')).toContainText('2026-11-02')
 await page.clock.runFor(3000)
 await expect(page.locator('.week-period')).toContainText('2026-11-09')
 await expect(page.locator('.taster-row')).toHaveCount(6)
})

test('广场推荐与十四篇详情使用同一组正文和配图', async ({page}) => {
 const entries=seed.entries
 expect(entries.filter(entry=>entry.kind==='editorial')).toHaveLength(7)
 expect(entries.filter(entry=>entry.kind==='share')).toHaveLength(7)
 expect(new Set(entries.map(entry=>entry.image)).size).toBe(14)
 await page.goto('/#/square')
 await expect(page.locator('.recommendation-story').getByRole('link',{name:/武汉的早晨/})).toHaveAttribute('href','#/post/note-noodles')
 for(const entry of entries){
  await page.goto('/#/post/'+entry.postId)
  await expect(page.locator('.post-reader-main h1')).toHaveText(entry.title)
  expect(await page.locator('.post-body').textContent()).toBe(entry.body)
  const image=page.locator('.post-detail-image')
  await expect(image).toHaveAttribute('src','./assets/'+entry.image)
  expect(await image.evaluate(async img=>{await img.decode();return img.naturalWidth})).toBeGreaterThan(0)
 }
})
