import { test, expect } from '@playwright/test'

test('下一道美食贴纸向右倾斜、整张可点，翻页后更新详情并可返回', async ({ page }, testInfo) => {
  await page.goto('/#/food/noodles')
  const next = page.getByRole('link', { name: '下一页：排骨藕汤' })
  await expect(next).toHaveAttribute('href', '#/food/lotus-rib-soup')
  expect(await next.evaluate(el => Number(getComputedStyle(el).transform.match(/matrix\(([^)]+)\)/)[1].split(',')[1]))).toBeGreaterThan(0)
  const large = await page.locator('.current-food-sticker .food-art').boundingBox()
  const small = await page.locator('.next-food-sticker .food-art').boundingBox()
  expect(small.width).toBeLessThan(large.width * .85)
  // 点食物图片本体，非只点“下一页”文字。
  await next.locator('img').click()
  await expect(page.locator('.open-food-book')).toHaveAttribute('aria-busy', 'true')
  await expect(page.locator('.open-food-book')).toHaveAttribute('data-phase', 'turning')
  // 所有前景先消失，翻动的书页上不能携带菜图或文字。
  await expect(page.locator('.book-content')).toHaveCSS('opacity', '0')
  await expect(page.locator('.book-turn-sheet img')).toHaveCount(0)
  await expect(page.locator('.book-turn-sheet')).toHaveText('')
  const activeTurn = await page.locator('.book-turn-sheet').evaluate(el => el.getAnimations().map(animation => ({ duration:animation.effect.getTiming().duration, playState:animation.playState })))
  expect(activeTurn.some(item => item.duration === 1120)).toBe(true)
  await next.evaluate(el => el.click())
  await page.locator('.open-food-book').evaluate(el => {
    for (const animation of el.getAnimations({subtree:true}).filter(item => item.playState === 'running')) {
      animation.pause(); animation.currentTime = 560
    }
  })
  const curve = await page.locator('.paper-strip').evaluateAll(strips => strips.map(el => getComputedStyle(el).transform))
  expect(curve.length).toBeGreaterThan(8)
  expect(curve[0]).not.toBe(curve.at(-1))
  await page.screenshot({ path:testInfo.outputPath('book-turn-in-progress.png') })
  await page.locator('.open-food-book').evaluate(el => {
    for (const animation of el.getAnimations({subtree:true}).filter(item => item.playState === 'paused')) animation.play()
  })
  await expect(page).toHaveURL(/food\/lotus-rib-soup$/)
  await expect(page.locator('.open-food-book')).toHaveAttribute('data-phase', 'revealing')
  expect(await page.locator('.book-content').evaluate(el => el.getAnimations().some(animation => animation.effect.getTiming().duration === 520))).toBe(true)
  await expect(page.locator('.open-food-book')).toHaveAttribute('data-phase', 'idle')
  await expect(page.locator('.book-content')).toHaveCSS('opacity', '1')
  await expect(page.getByRole('heading', {name:'排骨藕汤',exact:true})).toBeVisible()
  await expect(page.locator('.current-food-sticker img')).toHaveAttribute('src',/lotus-rib-soup/)
  await expect(page.getByRole('link',{name:'下一页：清蒸武昌鱼'})).toBeVisible()
  await expect(page.getByRole('link',{name:'上一页：武汉热干面'})).toBeVisible()
  await page.goBack()
  await expect(page.getByRole('heading',{name:'武汉热干面',exact:true})).toBeVisible()
  await expect(page.locator('.book-turn-sheet')).toHaveCount(0)
  await page.getByRole('button', {name:'喜欢',exact:true}).click()
  await expect(page.getByRole('button', {name:'取消喜欢'})).toHaveAttribute('aria-pressed','true')
  const progress = await page.evaluate(() => JSON.parse(localStorage.getItem('xiangshiji:formal:v1')))
  expect(progress?.stories || {}).toEqual({})
})

test('从湖北进入书本，键盘可前后翻页，首尾不循环', async ({ page }) => {
  await page.emulateMedia({reducedMotion:'reduce'})
  await page.goto('/#/province/湖北')
  await page.locator('.food-entry a[href="#/food/noodles"]').click()
  await expect(page.getByRole('link',{name:/^上一页：/})).toHaveCount(0)
  await page.getByRole('link',{name:'下一页：排骨藕汤'}).focus()
  await page.keyboard.press('Enter')
  await expect(page.getByRole('heading',{name:'排骨藕汤',exact:true})).toBeVisible()
  await page.getByRole('link',{name:'上一页：武汉热干面'}).press('Enter')
  await expect(page.getByRole('heading',{name:'武汉热干面',exact:true})).toBeVisible()
  await expect(page.locator('.book-turn-sheet')).toHaveCount(0)
  await expect(page.locator('.book-cook-tab')).toBeVisible()
  await page.goto('/#/food/gongan-guokui')
  await expect(page.getByRole('link',{name:/^下一页：/})).toHaveCount(0)
  await page.getByRole('link',{name:'返回美食地图 ↗'}).click()
  await expect(page).toHaveURL(/#\/map$/)
})

test('离开详情页时中止旧的翻页，不延迟跳回美食', async ({ page }) => {
  await page.goto('/#/food/noodles')
  await page.getByRole('link',{name:'下一页：排骨藕汤'}).click()
  await page.locator('header nav a[href="#/map"]').click()
  await expect(page).toHaveURL(/map$/)
  await page.waitForTimeout(1700)
  await expect(page).toHaveURL(/map$/)
})

test('书本详情多尺寸显示、图片可用、留存截图', async ({ page }, testInfo) => {
  for(const [width,height] of [[1920,1080],[1440,900],[1366,768],[720,1000],[390,1000]]) {
    await page.setViewportSize({width,height})
    await page.goto('/#/food/noodles')
    await expect(page.locator('.guide-sticker')).toBeVisible()
    await expect(page.locator('.guide-sticker')).toHaveAttribute('src', /ayun-watercolor\.webp$/)
    if (width > 800) {
      await expect(page.locator('.open-food-book')).toBeInViewport({ ratio: 0.999 })
      await expect(page.locator('.next-food-sticker .next-page-label')).toBeInViewport({ ratio: 1 })
      await expect(page.locator('#clue')).toBeInViewport({ ratio: 1 })
      await expect(page.locator('.book-cook-tab')).toBeInViewport({ ratio: 1 })
    }
    await expect(page.locator('.recipe-clipboard-art')).toBeVisible()
    expect(await page.locator('.recipe-clipboard-art').evaluate(async el => {
      const url = getComputedStyle(el).borderImageSource.match(/url\(["']?(.*?)["']?\)/)?.[1]
      const image = new Image(); image.src = url || ''
      try { await image.decode(); return image.naturalWidth > 0 } catch { return false }
    })).toBe(true)
    await expect(page.locator('.recipe-ingredients img, .method-photo')).toHaveCount(0)
    await expect(page.locator('.method-stamp')).toHaveCount(3)
    await page.evaluate(async()=>Promise.all([...document.images].map(img=>img.decode().catch(()=>{}))))
    expect(await page.locator('.open-food-book').evaluate(async el => {
      const url = getComputedStyle(el).backgroundImage.match(/url\(["']?(.*?)["']?\)/)?.[1]
      const image = new Image(); image.src = url || ''
      try { await image.decode(); return image.naturalWidth > 0 } catch { return false }
    })).toBe(true)
    const paperTab = await page.locator('.book-cook-tab').boundingBox()
    expect(paperTab.width).toBeLessThan(225)
    expect(await page.evaluate(()=>[...document.images].filter(img=>!img.naturalWidth).map(img=>img.src))).toEqual([])
    expect(await page.evaluate(()=>document.documentElement.scrollWidth <= innerWidth)).toBe(true)
    await page.screenshot({path:testInfo.outputPath(`book-${width}.png`),fullPage:true})
  }
  await page.locator('.next-food-sticker img').click()
  await expect(page).toHaveURL(/food\/lotus-rib-soup$/)
  await expect(page.getByRole('heading',{name:'排骨藕汤',exact:true})).toBeVisible()
})

test('翻页各阶段沿背景书脊定位，纸边不会超出书本上下边缘', async ({ page }, testInfo) => {
  for (const width of [1440,720,390]) {
    await page.setViewportSize({width,height:1000})
    await page.goto('/#/food/noodles')
    await page.reload()
    await page.locator('.next-food-sticker').click()
    await expect(page.locator('.open-food-book')).toHaveAttribute('data-phase','turning')
    for(const fraction of [.2,.5,.8]) {
      const bounds = await page.locator('.open-food-book').evaluate((book,fraction)=>{
        for(const animation of book.getAnimations({subtree:true})) { animation.pause(); animation.currentTime=1120*fraction }
        const rect=book.getBoundingClientRect()
        const pieces=[...book.querySelectorAll('.turn-sheet-front')].map(el=>el.getBoundingClientRect())
        return {top:Math.min(...pieces.map(r=>r.top))-rect.top,bottom:Math.max(...pieces.map(r=>r.bottom))-rect.top,height:rect.height}
      },fraction)
      expect(bounds.top).toBeGreaterThan(bounds.height*.04)
      expect(bounds.bottom).toBeLessThan(bounds.height*.96)
      await page.screenshot({path:testInfo.outputPath(`aligned-${width}-${fraction}.png`),fullPage:true})
    }
  }
})
