import { test, expect } from '@playwright/test'

test('小幅纪念物、未发现轮廓、移动端点击与收藏回看', async ({ page }, testInfo) => {
  await page.goto('/#/collection')
  await expect(page.locator('.memento-entry')).toHaveCount(1)
  await expect(page.locator('.memento-art.is-unknown')).toBeVisible()
  await expect(page.locator('.collection-count')).toContainText('0')
  await expect(page.locator('.memento-entry')).not.toContainText('阿云的早餐笺')
  await page.screenshot({ path: testInfo.outputPath('collection-undiscovered.png'), fullPage: true })

  // 在隔离的测试浏览器内建立已读记录，不改变开发者浏览器的发现进度。
  await page.evaluate(() => {
    localStorage.setItem('xiangshiji:formal:v1', JSON.stringify({
      version: 1, stories: { 'breakfast-note': { found: true, collected: true, page: 2 } },
    }))
  })
  await page.reload()
  await expect(page.locator('.collected-ticket')).toContainText('阿云的早餐笺')
  for (const width of [1440, 720, 390]) {
    await page.setViewportSize({ width, height: 900 })
    await page.goto('/#/collection')
    const sticker = page.locator('.memento-entry .memento-art')
    await expect(sticker.locator('img')).toBeVisible()
    const box = await sticker.boundingBox()
    expect(box.width).toBeLessThanOrEqual(220)
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
    expect(await page.locator('.collection-count').evaluate(element => getComputedStyle(element).flexDirection)).toBe('row')
    await page.screenshot({ path: testInfo.outputPath(`collection-${width}.png`), fullPage: true })

    await page.goto('/#/food/noodles')
    await expect(page.locator('#clue img')).toBeVisible()
    const clueBox = await page.locator('#clue').boundingBox()
    const artBox = await page.locator('#clue .memento-art').boundingBox()
    // 124px 图幅轻微旋转后，外接框会比内容宽度略大。
    expect(artBox.width).toBeLessThanOrEqual(140)
    expect(clueBox.width).toBeGreaterThanOrEqual(44)
    expect(clueBox.height).toBeGreaterThanOrEqual(44)
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
    await page.screenshot({ path: testInfo.outputPath(`food-clue-${width}.png`), fullPage: true })
  }
  await page.locator('#clue').focus()
  await page.keyboard.press('Enter')
  await expect(page).toHaveURL(/story/)
  await expect(page.locator('.dialogue-line')).toContainText('热干面的吃法也是有讲究的。')
  await page.goto('/#/collection')
  await page.locator('.memento-food-link').click()
  await expect(page).toHaveURL(/food\/noodles/)
})
