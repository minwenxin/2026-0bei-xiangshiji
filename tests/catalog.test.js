import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync, existsSync } from 'node:fs'
import { stallDialogues } from '../src/data/stall-dialogues.js'
import { foods, foodRegions } from '../src/data/foods.js'

test('保留38道美食的路由和配图，按用户要求移除饺子', () => {
  const rows = JSON.parse(readFileSync(new URL('../素材/菜品整理.json', import.meta.url), 'utf8').replace(/^\uFEFF/, ''))
  assert.equal(rows.length, 36)
  assert.equal(foods.length, 38)
  assert.equal(new Set(foods.map(food => food.id)).size, foods.length)
  for (const row of rows) {
    const food = foods.find(food => food.id === row[0])
    if (row[0] === 'jiaozi') { assert.equal(food, undefined); continue }
    assert.ok(food, row[1])
    assert.equal(food.name, row[1])
    assert.equal(food.steps.length, 3)
    assert.equal(new Set(food.steps.map(step => step.text)).size, 3)
    assert.ok(food.intro.length > 25)
    assert.ok(food.ingredients.length >= 4)
    assert.ok(existsSync(new URL('../public/assets/' + food.image, import.meta.url)), food.image)
    assert.equal(food.storyId, stallDialogues.find(story => story.foodId === food.id)?.id)
  }
  assert.equal(foodRegions.includes('跨地域'), false)
  assert.equal(foods.find(food => food.id === 'noodles').documentName, '热干面')
  assert.ok(foods.find(food => food.id === 'dumplings'))
  assert.ok(foods.find(food => food.id === 'zongzi'))
  for (const region of ['湖北', '河南', '四川', '甘肃', '广东', '江苏', '浙江']) assert.ok(foodRegions.includes(region))
})
