import { test, expect } from '@playwright/test'

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
