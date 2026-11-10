import { expect } from '@playwright/test'
export const button=(page,name)=>page.getByRole('button',{name,exact:true})
export async function activate(page,name,keyboard=false){const target=page.getByRole('button',{name,exact:name!=='下一步'});if(keyboard){await target.focus();await page.keyboard.press('Enter')}else await target.click()}
export async function blanch(page,keyboard=false){
 await activate(page,'漏勺',keyboard)
 const tool=page.getByRole('button',{name:'按住漏勺烫面，松开提起',exact:true})
 if(keyboard){await tool.focus();await page.keyboard.down('Space');await page.waitForTimeout(2050);await page.keyboard.up('Space')}
 else{await tool.scrollIntoViewIfNeeded();const r=await tool.boundingBox();await page.mouse.move(r.x+r.width*.5,r.y+r.height*.6);await page.mouse.down();await page.waitForTimeout(2050);await page.mouse.up()}
 await expect(page.getByRole('button',{name:'下一步'})).toBeEnabled()
}
export async function mixNoodles(page,keyboard=false){
 await activate(page,'下一步',keyboard);await activate(page,'芝麻酱',keyboard)
 const bowl=page.getByRole('group',{name:'面碗搅拌区'})
 if(keyboard){await bowl.focus();for(let i=0;i<13;i++){await page.keyboard.press(i%2?'ArrowLeft':'ArrowRight')}}
 else{await bowl.scrollIntoViewIfNeeded();const r=await bowl.boundingBox();await page.mouse.move(r.x+r.width*.3,r.y+r.height*.43);await page.mouse.down();for(let i=0;i<25;i++)await page.mouse.move(r.x+r.width*(i%2?.3:.7),r.y+r.height*.43,{steps:4});await page.mouse.up()}
 await expect(page.getByRole('button',{name:'下一步'})).toBeEnabled()
}
export async function finishNoodles(page,keyboard=false){
 await blanch(page,keyboard);await mixNoodles(page,keyboard)
 await activate(page,'下一步',keyboard);await activate(page,'萝卜丁与葱花',keyboard)
 for(const side of ['左侧','中间','右侧']){const target=button(page,'在面碗'+side+'撒料');if(keyboard){await target.focus();await page.keyboard.press('Space')}else await target.click()}
 await activate(page,'盛出这一碗',keyboard);await expect(button(page,'再做一碗')).toBeVisible()
}
export async function prepareZongzi(page,keyboard=false){
 await activate(page,'粽叶',keyboard)
 for(let i=1;i<=3;i++)await activate(page,'折叶第'+i+'处',keyboard)
 await activate(page,'下一步',keyboard)
 for(const name of ['糯米','肉馅','糯米'])await activate(page,name,keyboard)
 await activate(page,'下一步',keyboard)
 await activate(page,'粽叶',keyboard)
 for(let i=1;i<=2;i++)await activate(page,'包合第'+i+'处',keyboard)
 await activate(page,'棉线',keyboard)
}
export async function tieZongzi(page,keyboard=false){
 if(keyboard){for(let i=1;i<=5;i++){await button(page,'包扎路径第'+i+'点').focus();await page.keyboard.press('Enter')}}
 else{
  const path=page.locator('.thread-path');await path.scrollIntoViewIfNeeded();const r=await path.boundingBox(),points=(await path.locator('.thread-guide').getAttribute('points')).split(' ').map(p=>p.split(',').map(Number))
  await page.mouse.move(r.x+r.width*points[0][0]/100,r.y+r.height*points[0][1]/100);await page.mouse.down()
  for(const [x,y]of points.slice(1))await page.mouse.move(r.x+r.width*x/100,r.y+r.height*y/100,{steps:14})
  await page.mouse.up()
 }
 await expect(page.locator('.cook-phase')).toContainText('包扎 5/5')
}
export async function finishZongzi(page,keyboard=false){
 await prepareZongzi(page,keyboard);await tieZongzi(page,keyboard)
 const pot=button(page,'点击桌上的锅煮粽子');if(keyboard){await pot.focus();await page.keyboard.press('Enter')}else await pot.click()
 await expect(button(page,'端出这只粽子')).toBeEnabled()
 await activate(page,'端出这只粽子',keyboard);await expect(button(page,'再包一只')).toBeVisible()
}
