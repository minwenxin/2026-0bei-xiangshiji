import { test } from 'node:test'
import assert from 'node:assert/strict'
import { emptyProgress, normalizeProgress, discoverStory, collectStory, finishCooking, toggleMark, saveNoodleDialogue } from '../src/domain/progress.js'
import { createLocalRepository, STORAGE_KEY } from '../src/services/local-repository.js'

test('制作完成不会解锁故事或收取纪念物', () => {
  const progress = emptyProgress()
  finishCooking(progress, 'sesame-noodles')
  assert.equal(progress.cooking['sesame-noodles'], true)
  assert.deepEqual(progress.stories, {})
})
test('从隐藏入口发现、读完才能领取；重复领取不重复计数', () => {
  const progress = emptyProgress()
  assert.throws(() => collectStory(progress, 'other-story', 2))
  discoverStory(progress, 'other-story')
  assert.equal(progress.stories['other-story'].collected, false)
  assert.throws(() => collectStory(progress, 'other-story', 2))
  progress.stories['other-story'].page = 2
  collectStory(progress, 'other-story', 2)
  discoverStory(progress, 'other-story')
  collectStory(progress, 'other-story', 2)
  assert.deepEqual(progress.stories['other-story'], { found: true, collected: true, page: 2 })
  assert.equal(Object.keys(progress.stories).length, 1)
})
test('美食和帖子、收藏和点赞互不混淆', () => {
  const progress = emptyProgress()
  toggleMark(progress, 'favorites', 'food:noodles')
  toggleMark(progress, 'favorites', 'post:noodles')
  toggleMark(progress, 'likes', 'food:noodles')
  toggleMark(progress, 'favorites', 'food:noodles')
  assert.deepEqual(progress.favorites, ['post:noodles'])
  assert.deepEqual(progress.likes, ['food:noodles'])
})
test('损坏字段不能伪造发现记录；排除非数组和非字符串', () => {
  const result = normalizeProgress({ favorites: ['food:x', 'food:x', 3], likes: {}, posts: [null], stories: { a: { collected: true, page: -4 } }, cooking: { a: 'true' } })
  assert.deepEqual(result.favorites, ['food:x'])
  assert.deepEqual(result.posts, [])
  assert.deepEqual(result.likes, [])
  assert.equal(result.stories.a.collected, false)
  assert.equal(result.stories.a.page, 0)
  assert.deepEqual(result.cooking, {})
})
test('存储可在新会话读取；失败明确抛出，不冒充已保存', async () => {
  const values = new Map()
  const storage = { getItem: key => values.get(key), setItem: (key, value) => values.set(key, value) }
  const first = createLocalRepository(storage), data = emptyProgress()
  discoverStory(data, 'breakfast-note')
  await first.save(data)
  assert.equal((await createLocalRepository(storage).load()).stories['breakfast-note'].found, true)
  const denied = createLocalRepository({ getItem: () => null, setItem: () => { throw Error('quota') } })
  await assert.rejects(denied.save(data), /保存失败/)
  values.set(STORAGE_KEY, '{broken')
  await assert.rejects(first.load(), /无法读取/)
})

test('六句对话进度不沿用三幕页码；完成和领取相互独立', () => {
  const p=normalizeProgress({favorites:['food:noodles'],cooking:{'sesame-noodles':true},stories:{'breakfast-note':{found:true,page:2}}})
  assert.equal(p.stories['breakfast-note'].dialogueIndex,undefined)
  saveNoodleDialogue(p,5)
  assert.equal(p.stories['breakfast-note'].readComplete,false)
  assert.throws(()=>collectStory(p,'breakfast-note',2))
  saveNoodleDialogue(p,5,true)
  assert.equal(p.stories['breakfast-note'].collected,false)
  collectStory(p,'breakfast-note',5)
  collectStory(p,'breakfast-note',5)
  saveNoodleDialogue(p,0)
  assert.equal(p.stories['breakfast-note'].readComplete,true)
  assert.equal(p.stories['breakfast-note'].collected,true)
  assert.deepEqual(p.favorites,['food:noodles'])
  assert.equal(p.cooking['sesame-noodles'],true)
})
test('旧领取、明确完成记录保留；未发现不可直接写入对话',()=>{
  assert.throws(()=>saveNoodleDialogue(emptyProgress(),0))
  for(const flag of ['collected','completed','readComplete']){
    const p=normalizeProgress({stories:{'breakfast-note':{found:true,page:2,[flag]:true}}})
    assert.equal(p.stories['breakfast-note'].dialogueIndex,undefined)
    saveNoodleDialogue(p,0)
    assert.equal(p.stories['breakfast-note'].readComplete,true)
    assert.equal(p.stories['breakfast-note'].collected,flag==='collected')
  }
})
