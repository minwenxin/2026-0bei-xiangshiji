import { test, expect } from '@playwright/test'

test('操作台按草图分区，食材与调味可选，未操作不能直接结束', async ({page}) => {
  await page.goto('/#/cook/sesame-noodles')
  await expect(page.locator('.ingredient-slot')).toHaveCount(7)
  await expect(page.locator('.seasoning-shelf button')).toHaveCount(6)
  const steps=await page.locator('.station-steps-board').boundingBox()
  const ingredients=await page.locator('.ingredient-drawer').boundingBox()
  const jars=await page.locator('.seasoning-shelf').boundingBox()
  expect(steps.y+steps.height).toBeLessThan(ingredients.y)
  expect(ingredients.x+ingredients.width).toBeLessThan(jars.x)
  await page.getByRole('button',{name:'碱水面',exact:true}).click()
  await expect(page.locator('#cook-dialogue')).toContainText('用漏勺')
  await expect(page.getByRole('button',{name:'下一步'})).toBeDisabled()
  await page.getByRole('button',{name:'盐',exact:true}).click()
  await expect(page.locator('#cook-dialogue')).toContainText('用漏勺')
  await page.getByRole('button',{name:'漏勺',exact:true}).click()
  await expect(page.locator('.blanch-skimmer')).toBeVisible()
  await expect(page.getByRole('button',{name:'下一步'})).toBeDisabled()
})

test('桌面与720宽度可完整操作，背景和截图核对', async ({page},testInfo) => {
  for(const width of [1920,1440,720]) {
    await page.setViewportSize({width,height:1000})
    await page.goto('/#/cook/sesame-noodles')
    await expect(page.locator('.ingredient-drawer')).toBeVisible()
    expect(await page.locator('.workstation-scroll').evaluate(el=>el.scrollWidth <= el.clientWidth + 1)).toBe(true)
    expect(await page.evaluate(()=>document.documentElement.scrollWidth <= innerWidth)).toBe(true)
    expect(await page.locator('.cooking-scene').evaluate(async el=>{
      const source=getComputedStyle(el).backgroundImage.match(/url\(["']?(.*?)["']?\)/)?.[1]
      const image=new Image();image.src=source || ''
      try{await image.decode();return image.naturalWidth>0}catch{return false}
    })).toBe(true)
    await page.evaluate(async()=>Promise.all([...document.images].map(img=>img.decode().catch(()=>{}))))
    await page.screenshot({path:testInfo.outputPath(`workstation-${width}.png`),fullPage:true})
  }
})

test('1366×768 三道菜的步骤、操作台和下一步都在首屏', async ({ page }) => {
  await page.setViewportSize({ width: 1366, height: 768 })
  for (const [id, ingredient] of [['sesame-noodles', '漏勺'], ['jiaxing-zongzi', '粽叶'], ['jiangnan-xiaolongbao', '面团']]) {
    await page.goto('/#/cook/' + id)
    for (const selector of ['.station-steps-board', '.workstation-canvas', '.cook-controls', '.cook-phase', '.cook-next']) {
      await expect(page.locator(selector), id + ' ' + selector).toBeInViewport({ ratio: 1 })
    }
    const tool = page.getByRole('button', { name: ingredient, exact: true })
    await tool.click()
    await expect(tool).toHaveAttribute('aria-pressed', 'true')
  }
})
