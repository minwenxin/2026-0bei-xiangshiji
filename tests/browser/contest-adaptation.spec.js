import {test,expect} from '@playwright/test'
const pages=[['/','home'],['/map','map'],['/province/湖北','province'],['/province/广东','province'],['/square','square'],['/collection','collection'],['/me','me'],['/publish','publish'],['/submission','submission'],['/tasters','tasters'],['/food/noodles','food'],['/food/blackbean-ribs','food'],['/food/dumplings','food'],['/food/zongzi','food'],['/cook/sesame-noodles','cook'],['/cook/jiangnan-xiaolongbao','cook'],['/cook/jiaxing-zongzi','cook'],['/story/taste-blackbean-ribs','story'],['/story/breakfast-note','story'],['/story/taste-dumplings','story']]
test('比赛配置确实运行Chrome129',async({browser},info)=>{test.skip(!info.config.metadata.contestBrowser,'仅指定版本验收检查');expect(await browser.version()).toMatch(/^129\./)})
for(const [width,height] of [[1920,1080],[1440,900],[720,1000],[1000,1000],[1366,768]])test(`参赛页面规格 ${width}×${height}：内容及入口不越界`,async({page})=>{
 const errors=[];page.on('pageerror',e=>errors.push(e.message));await page.setViewportSize({width,height})
 await page.goto('/');await page.locator('.view-home').waitFor()
 await page.evaluate(()=>localStorage.setItem('xiangshiji:formal:v1',JSON.stringify({stories:{'taste-blackbean-ribs':{found:true,page:0},'breakfast-note':{found:true,page:0},'taste-dumplings':{found:true,page:0}}})));await page.reload()
 for(const [route,kind] of pages){
  await page.goto('/#'+route);await page.locator('main.view-'+kind+' h1').first().waitFor({state:'attached'});await page.evaluate(()=>document.fonts.ready)
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),route).toBe(true)
  const outside=await page.locator('main').evaluate(main=>[...main.querySelectorAll('a,button,summary,select,input,textarea')].filter(e=>{const r=e.getBoundingClientRect();return r.width&&r.height&&!e.closest('svg,.workstation-scroll')&&getComputedStyle(e).visibility!=='hidden'&&(r.left< -2||r.right>innerWidth+2)}).map(e=>e.innerText||e.getAttribute('aria-label')))
  expect(outside,route).toEqual([])
 }
 expect(errors).toEqual([])
})
test('Chrome129模拟慢网仍可导航、选省并保存互动',async({page},info)=>{
 test.skip(!info.config.metadata.contestBrowser,'慢网专项随比赛配置执行');test.setTimeout(120000)
 const cdp=await page.context().newCDPSession(page),errors=[];page.on('pageerror',e=>errors.push(e.message))
 await cdp.send('Network.enable');await cdp.send('Network.setCacheDisabled',{cacheDisabled:true});await cdp.send('Network.emulateNetworkConditions',{offline:false,latency:150,downloadThroughput:93750,uploadThroughput:31250,connectionType:'cellular3g'})
 const start=Date.now();await page.goto('/',{waitUntil:'domcontentloaded',timeout:60000});await page.locator('.painted-map').waitFor({timeout:60000});const usableHomeMs=Date.now()-start
 await page.getByRole('navigation',{name:'主导航'}).getByRole('link',{name:'美食地图'}).click();await page.locator('#atlas-select').selectOption('420000',{timeout:60000});await page.locator('.view-province .food-entry').first().click({timeout:60000});await page.locator('.view-food .journal-mark.likes').click({timeout:60000});await expect(page.locator('.journal-mark.likes')).toHaveAttribute('aria-pressed','true')
 await info.attach('慢网实测',{body:JSON.stringify({latencyMs:150,downloadBytesPerSecond:93750,uploadBytesPerSecond:31250,usableHomeMs,totalMs:Date.now()-start}),contentType:'application/json'});expect(errors).toEqual([])
})
