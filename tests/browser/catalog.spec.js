import { test, expect } from '@playwright/test'
import { foods } from '../../src/data/foods.js'

test('38道美食均可打开，独立工艺文字和图片完整', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  const errors = []
  page.on('pageerror', error => errors.push(error.message))
  for (const food of foods) {
    await page.goto('/#/food/' + food.id)
    await expect(page.locator('h1')).toHaveText(food.name)
    await expect(page.locator('.book-method li')).toHaveCount(3)
    const image = page.locator('.current-food-sticker img')
    expect(await image.evaluate(async image => { await image.decode(); return image.naturalWidth > 0 }), food.name).toBe(true)
    if (food.steps) {
      for (const [index, step] of food.steps.entries()) await expect(page.locator('.book-method li p').nth(index)).toHaveText(step.text)
    }
  }
  expect(errors).toEqual([])
})

test('新地区四列、筛选、末页翻阅和资料来源可用', async ({ page }, testInfo) => {
  for (const [province, count] of [['湖北',8], ['河南',5], ['四川',9], ['甘肃',6], ['广东',8]]) {
    await page.goto('/#/province/' + province)
    await expect(page.locator('.food-entry')).toHaveCount(count)
    expect(await page.locator('.province-food-grid').evaluate(el => getComputedStyle(el).gridTemplateColumns.split(' ').length)).toBe(4)
  }
  await page.locator('#city-filter').selectOption('佛山')
  await expect(page.locator('.food-entry')).toHaveCount(1)
  await page.locator('.food-entry a').click()
  await expect(page.locator('h1')).toHaveText('顺德双皮奶')
  await page.locator('.food-source-note summary').click()
  await expect(page.locator('.food-source-note')).toContainText('南方网')
  for (const width of [1440,720]) {
    await page.setViewportSize({ width, height: 1000 })
    await page.goto('/#/food/mapo-tofu')
    await page.locator('.current-food-sticker img').evaluate(image => image.decode())
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
    await page.screenshot({ path: testInfo.outputPath('tofu-' + width + '.png'), fullPage: true })
  }
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.goto('/#/map')
  await expect(page.locator('.atlas-special-food')).toHaveCount(0)
  await page.goto('/#/food/jiaozi')
  await expect(page.locator('h1')).toHaveText('这道风味暂时找不到了')
  await page.goto('/#/food/shunde-milk-custard')
  await page.getByRole('link', { name: '下一页：武汉热干面' }).click()
  await expect(page.locator('h1')).toHaveText('武汉热干面')
})
