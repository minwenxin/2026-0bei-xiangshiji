import { test } from 'node:test'
import assert from 'node:assert/strict'
import { existsSync } from 'node:fs'
import { stallDialogues } from '../src/data/stall-dialogues.js'
import { foods } from '../src/data/foods.js'
import { emptyProgress, discoverStory, collectStory, saveStallDialogue, normalizeProgress } from '../src/domain/progress.js'

test('37段新增对话有独立入口、唯一纪念物及有效网页素材', () => {
 assert.equal(stallDialogues.length, 37)
 for (const key of ['id', 'foodId']) assert.equal(new Set(stallDialogues.map(x=>x[key])).size,37)
 assert.equal(new Set(stallDialogues.map(x=>x.memento.image)).size,37)
 for (const d of stallDialogues) {
  assert.equal(foods.find(f=>f.id===d.foodId).storyId,d.id)
  assert.ok(d.lines.length>0 && d.lines.every(l=>l.text && l.speaker))
  for(const file of [d.scene,d.portrait,d.memento.image]) assert.ok(existsSync('public/assets/'+file),file)
 }
})
test('逐句阅读、领取和续读按故事独立保存，不能提前领取或跳到结尾', () => {
 for(const d of stallDialogues){
  let p=emptyProgress()
  assert.throws(()=>saveStallDialogue(p,d.id,0))
  discoverStory(p,d.id)
  assert.throws(()=>collectStory(p,d.id,0))
  if(d.lines.length>2) assert.throws(()=>saveStallDialogue(p,d.id,d.lines.length-1,true))
  for(let i=0;i<d.lines.length;i++)saveStallDialogue(p,d.id,i)
  assert.throws(()=>collectStory(p,d.id,d.lines.length-1))
  saveStallDialogue(p,d.id,d.lines.length-1,true)
  assert.equal(p.stories[d.id].collected,false)
  collectStory(p,d.id,d.lines.length-1)
  p=normalizeProgress(JSON.parse(JSON.stringify(p)))
  assert.equal(p.stories[d.id].collected,true)
  assert.equal(p.stories[d.id].dialogueIndex,d.lines.length-1)
  saveStallDialogue(p,d.id,0)
  assert.equal(p.stories[d.id].readComplete,true)
  assert.equal(Object.keys(p.stories).length,1)
 }
})
