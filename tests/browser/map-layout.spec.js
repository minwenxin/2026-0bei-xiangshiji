import { test, expect } from '@playwright/test'

test('1366×768 初次打开地图即可看到完整地图和地区选择', async ({ page }) => {
  await page.setViewportSize({ width: 1366, height: 768 })
  await page.goto('/#/map')
  await page.evaluate(() => document.fonts.ready)
  for (const selector of ['.held-map-art', '.china-atlas', '.south-sea-inset', '#atlas-select']) {
    await expect(page.locator(selector)).toBeInViewport({ ratio: 1 })
  }
  expect(await page.evaluate(() => scrollY)).toBe(0)
})

test('地图主体居中，34个省名置于色块上层且完整落在画布内', async ({ page }, testInfo) => {
  await page.goto('/#/map')
  await expect(page.locator('.province-label')).toHaveCount(34)

  for (const width of [2560, 1920, 1440, 720, 390]) {
    await page.setViewportSize({ width, height: 1000 })
    const result = await page.evaluate(() => {
      const svg = document.querySelector('.china-atlas')
      const canvas = svg.getBoundingClientRect()
      const paths = [...svg.querySelectorAll('.province-shape')]
      const boxes = paths.map(path => path.getBoundingClientRect())
      const left = Math.min(...boxes.map(box => box.left))
      const right = Math.max(...boxes.map(box => box.right))
      const labels = [...svg.querySelectorAll('.province-name')]
      const clipped = labels.filter(label => {
        const box = label.getBoundingClientRect()
        return box.left < canvas.left || box.right > canvas.right || box.top < canvas.top || box.bottom > canvas.bottom
      }).map(label => label.textContent)
      const allOnTop = labels.every(label => paths.every(path => path.compareDocumentPosition(label) & Node.DOCUMENT_POSITION_FOLLOWING))
      const paper = document.querySelector('.atlas-canvas').getBoundingClientRect()
      return {
        centerOffset: Math.abs((left + right) / 2 - (canvas.left + canvas.right) / 2),
        canvasOffset: Math.abs((paper.left + paper.right) / 2 - (canvas.left + canvas.right) / 2),
        clipped, allOnTop,
        overflow: document.documentElement.scrollWidth > innerWidth,
      }
    })
    expect(result.centerOffset, `主体居中 @${width}`).toBeLessThan(1)
    expect(result.canvasOffset, `画布居中 @${width}`).toBeLessThan(1)
    expect(result.clipped, `名称完整 @${width}`).toEqual([])
    expect(result.allOnTop).toBe(true)
    expect(result.overflow).toBe(false)
    await page.locator('.china-atlas').screenshot({ path: testInfo.outputPath(`map-${width}.png`) })
  }

  await page.setViewportSize({ width: 1440, height: 1000 })
  await page.locator('[data-map-code="610000"]').focus()
  await expect(page.locator('[data-label-code="610000"]')).toHaveClass(/is-raised/)
  await expect(page.locator('[data-label-code="610000"] .province-name')).toHaveText('陕西')
  await page.screenshot({ path: testInfo.outputPath('map-hover-shaanxi.png'), fullPage: true })
  await page.locator('[data-map-code="420000"]').focus()
  await page.keyboard.press('Enter')
  await expect(page.getByRole('heading', { name: '湖北，有滋有味' })).toBeVisible()
})

test('港澳外置热区各自响应鼠标、触屏和键盘，广东仍可进入', async ({ page, browser }) => {
  const regions = [['810000', '香港'], ['820000', '澳门']]
  await page.goto('/#/map')
  await expect(page.locator('.china-atlas title')).toHaveCount(0)
  await expect(page.locator('.south-sea-inset')).toBeVisible()
  for (const [id, name] of regions) {
    const target = page.locator(`[data-map-code="${id}"]`)
    const label = page.locator(`[data-label-code="${id}"]`)
    const hit = target.locator('.province-callout-hit')
    await hit.hover()
    await expect(label).toHaveClass(/is-raised/)
    await expect(label.locator('.province-leader')).toHaveCSS('stroke-width', '2px')
    await hit.click()
    await expect(page.locator('#toast')).toContainText(name + '的风味还在整理中')
    await page.mouse.move(0, 0)
    await target.focus()
    await expect(label).toHaveClass(/is-raised/)
    await page.keyboard.press('Space')
    await expect(page).toHaveURL(/#\/map$/)
  }
  const guangdong = page.locator('[data-map-code="440000"] .province-shape')
  const label = page.locator('[data-label-code="440000"]')
  await label.scrollIntoViewIfNeeded()
  const box = await label.locator('text').boundingBox()
  const point = { x: box.x + box.width / 2, y: box.y + box.height / 2 }
  await page.mouse.move(point.x, point.y)
  await expect(guangdong.locator('..')).toHaveClass(/is-hovered/)
  await page.mouse.click(point.x, point.y)
  await expect(page.getByRole('heading', { name: '广东，百味本鲜' })).toBeVisible()

  const touch = await browser.newContext({ hasTouch: true, viewport: { width: 390, height: 844 } })
  try {
    const phone = await touch.newPage()
    await phone.goto(new URL('/#/map', page.url()).href)
    for (const [id, name] of regions) {
      await phone.locator(`[data-map-code="${id}"] .province-callout-hit`).tap()
      await expect(phone.locator('#toast')).toContainText(name + '的风味还在整理中')
      await expect(phone.locator(`[data-label-code="${id}"]`)).toHaveClass(/is-raised/)
    }
  } finally {
    await touch.close()
  }
})
