import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync, existsSync } from 'node:fs'
import { foods, foodRegions } from '../src/data/foods.js'

test('文档37道菜全部有独立路由、配图及三步介绍，保留两道旧样板', () => {
  const rows = JSON.parse(readFileSync(new URL('../素材/菜品整理.json', import.meta.url), 'utf8').replace(/^\uFEFF/, ''))
  assert.equal(rows.length, 36)
  assert.equal(foods.length, 39)
  assert.equal(new Set(foods.map(food => food.id)).size, foods.length)
  for (const row of rows) {
    const food = foods.find(food => food.id === row[0])
    assert.ok(food, row[1])
    assert.equal(food.name, row[1])
    assert.equal(food.steps.length, 3)
    assert.equal(new Set(food.steps.map(step => step.text)).size, 3)
    assert.ok(food.intro.length > 25)
    assert.ok(food.ingredients.length >= 4)
    assert.ok(existsSync(new URL('../public/assets/' + food.image, import.meta.url)), food.image)
    assert.equal(food.storyId, undefined)
  }
  assert.equal(foods.find(food => food.id === 'noodles').documentName, '热干面')
  assert.ok(foods.find(food => food.id === 'dumplings'))
  assert.ok(foods.find(food => food.id === 'zongzi'))
  for (const region of ['湖北', '河南', '四川', '甘肃', '广东', '江苏', '浙江', '跨地域']) assert.ok(foodRegions.includes(region))
})
