import { test, expect } from '@playwright/test'

test('广场类型、搜索、空状态与本机消息保持可用', async ({ page }) => {
  await page.goto('/#/square')
  await page.getByRole('button', { name: '食客分享', exact: true }).click()
  await expect(page.locator('.scrapbook-post')).toHaveCount(3)
  await expect(page.locator('.square-food-note')).toHaveCount(0)
  await page.getByRole('searchbox').fill('蒸笼')
  await expect(page.locator('.scrapbook-post')).toHaveCount(1)
  await page.getByRole('searchbox').fill('暂时不存在的菜名')
  await expect(page.getByRole('heading', { name: '这一页还空着' })).toBeVisible()
  await page.getByRole('button', { name: '本机消息' }).click()
  await expect(page.locator('#square-local-notes')).toContainText('已保存 0 条留言')
  await page.getByRole('button', { name: '本机消息' }).click()
  await expect(page.locator('#square-local-notes')).toHaveCount(0)
})

test('广场与手持地图在桌面及720宽度保留完整内容', async ({ page }, testInfo) => {
  for (const width of [1920, 1440, 720]) {
    await page.setViewportSize({ width, height: 1000 })
    for (const route of ['square', 'map']) {
      await page.goto('/#/' + route)
      await page.evaluate(async () => Promise.all([...document.images].map(image => { image.loading = 'eager'; return image.decode().catch(() => {}) })))
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
      expect(await page.locator('img').evaluateAll(images => images.every(image => image.naturalWidth > 0))).toBe(true)
      if (route === 'map') {
        await expect(page.locator('.held-map-art')).toBeVisible()
        await expect(page.locator('[data-map-code]')).toHaveCount(34)
        await expect(page.locator('.atlas-select-label')).toBeVisible()
      }
      await page.screenshot({ path: testInfo.outputPath(`${route}-${width}.png`), fullPage: true })
    }
  }
})
