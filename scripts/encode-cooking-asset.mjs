// 仅等比缩小和编码为WebP，保留生成素材的透明通道，不修改插画内容。
import { chromium } from '@playwright/test'
import { readFile, writeFile } from 'node:fs/promises'
const [sourcePath, name, size='512'] = process.argv.slice(2)
if (!sourcePath || !/^cook-[a-z-]+\.webp$/.test(name)) throw new Error('用法：node scripts/encode-cooking-asset.mjs <PNG路径> <cook-name.webp> [最大边长]')
const browser = await chromium.launch({channel:'chrome'})
try {
  const page=await browser.newPage()
  const result=await page.evaluate(async ({source,size})=>{
    const image=new Image();image.src=source;await image.decode()
    const canvas=document.createElement('canvas'),ratio=Math.min(1,size/Math.max(image.width,image.height))
    canvas.width=Math.round(image.width*ratio);canvas.height=Math.round(image.height*ratio)
    const ctx=canvas.getContext('2d');ctx.drawImage(image,0,0,canvas.width,canvas.height)
    const pixels=ctx.getImageData(0,0,canvas.width,canvas.height).data
    let transparent=0,opaque=0,edgeOpaque=0
    for(let i=3;i<pixels.length;i+=4){if(pixels[i]===0)transparent++;if(pixels[i]===255)opaque++}
    for(let y=0;y<canvas.height;y++)for(let x=0;x<canvas.width;x++)if((x===0||y===0||x===canvas.width-1||y===canvas.height-1)&&pixels[(y*canvas.width+x)*4+3]>240)edgeOpaque++
    return {bytes:canvas.toDataURL('image/webp',.9).split(',')[1],width:canvas.width,height:canvas.height,transparent,opaque,edgeOpaque}
  },{source:'data:image/png;base64,'+(await readFile(sourcePath)).toString('base64'),size:Number(size)})
  const {bytes,...metadata}=result
  if (!metadata.transparent) throw new Error('素材没有透明像素')
  await writeFile(new URL('../public/assets/'+name,import.meta.url),Buffer.from(bytes,'base64'))
  console.log(name,metadata,Buffer.byteLength(bytes,'base64')+' bytes')
} finally {await browser.close()}
