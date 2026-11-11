import { test, expect } from '@playwright/test'
import { finishNoodles } from './cooking-helpers.js'

test('手账改版的名称、四列陈列与分享筛选', async ({ page }) => {
  await page.goto('/#/square')
  await expect(page.getByRole('heading', { name: '烟火广场', exact: true })).toBeVisible()
  await expect(page.locator('header nav')).toContainText('时光手记')
  await page.getByRole('button', { name: '食客分享', exact: true }).click()
  await expect(page.locator('.scrapbook-post')).toHaveCount(7)
  await page.getByRole('combobox', { name:'筛选地区' }).selectOption('湖北')
  await expect(page.locator('.scrapbook-post')).toHaveCount(2)
  await page.locator('.scrapbook-post .post-preview').filter({ hasText: '清蒸武昌鱼' }).click()
  const reader = page.getByRole('dialog')
  await expect(reader).toContainText('虚构示例')
  await reader.getByRole('button', { name: '收藏', exact: true }).click()
  await page.goto('/#/me')
  await page.getByRole('button', { name: '帖子', exact: true }).click()
  await expect(page.locator('.scrapbook-post')).toHaveCount(1)
  await page.goto('/#/province/湖北')
  expect(await page.locator('.province-food-grid').evaluate(el => getComputedStyle(el).gridTemplateColumns.split(' ').length)).toBe(4)
})

test('手账与小厨房多尺寸可读，键盘能够完成制作', async ({ page }, testInfo) => {
  const errors = []
  page.on('pageerror', error => errors.push(error.message))
  for (const width of [1920, 1440, 720, 390]) {
    await page.setViewportSize({ width, height: 1000 })
    for (const route of ['/collection', '/square', '/province/湖北', '/cook/sesame-noodles']) {
      await page.goto('/#' + route)
      await expect(page.locator('main h1')).toBeVisible()
      if (route === '/cook/sesame-noodles' || route === '/collection') {
        // CSS 背景、蒙版不属于 document.images，也必须实际加载成功。
        const selector = route.startsWith('/cook') ? '.cooking-scene' : '.memento-silhouette'
        expect(await page.locator(selector).evaluate(async el => {
          const style = getComputedStyle(el)
          const url = (style.backgroundImage !== 'none' ? style.backgroundImage : style.maskImage).match(/url\(["']?(.*?)["']?\)/)?.[1]
          const image = new Image(); image.src = url || ''
          try { await image.decode(); return image.naturalWidth > 0 } catch { return false }
        })).toBe(true)
      }
      await page.locator('footer').scrollIntoViewIfNeeded()
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), route + ' @' + width).toBe(true)
      await page.evaluate(() => scrollTo(0,0))
      if ([1440,390].includes(width)) await page.screenshot({ path:testInfo.outputPath(width + route.replaceAll('/','-') + '.png'),fullPage:true })
    }
  }
  await finishNoodles(page,true)
  expect(errors).toEqual([])
})
