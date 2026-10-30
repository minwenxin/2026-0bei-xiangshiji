// 仅转成网页编码，保留原尺寸与透明通道，不修改插画内容。
// 使用电脑已安装的 Chrome；传入原始 PNG 路径，无需启动预览服务。
import { chromium } from '@playwright/test'
import { readFile, writeFile } from 'node:fs/promises'

if (!process.argv[2]) throw new Error('请传入原始 PNG 路径：node scripts/encode-memento.mjs <path>')
const source = 'data:image/png;base64,' + (await readFile(process.argv[2])).toString('base64')

const browser = await chromium.launch({ channel: 'chrome' })
try {
  const page = await browser.newPage()
  const encoded = await page.evaluate(async source => {
    const image = new Image()
    image.src = source
    await image.decode()
    const canvas = document.createElement('canvas')
    canvas.width = image.naturalWidth
    canvas.height = image.naturalHeight
    canvas.getContext('2d').drawImage(image, 0, 0)
    return canvas.toDataURL('image/webp', .86).split(',')[1]
  }, source)
  const bytes = Buffer.from(encoded, 'base64')
  await writeFile(new URL('../public/assets/' + (process.argv[3] || 'memento-breakfast-note.webp'), import.meta.url), bytes)
  console.log(`WebP exported: ${bytes.length} bytes; dimensions and alpha preserved`)
} finally { await browser.close() }
