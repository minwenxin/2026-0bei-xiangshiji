import { stallDialogues } from '../data/stall-dialogues.js'
const dialogueLengths = Object.fromEntries(stallDialogues.map(story => [story.id, story.lines.length]))
export function emptyProgress() {
  return { version: 1, favorites: [], likes: [], posts: [], comments: {}, submissions: [], cooking: {}, stories: {} }
}

export function normalizeProgress(input) {
  const output = emptyProgress()
  if (!input || typeof input !== 'object' || Array.isArray(input)) return output
  for (const key of ['favorites', 'likes']) {
    if (Array.isArray(input[key])) output[key] = [...new Set(input[key].filter(value => typeof value === 'string'))]
  }
  for (const key of ['posts', 'submissions']) {
    if (Array.isArray(input[key])) output[key] = input[key].filter(value => value && typeof value.id === 'string' && typeof value.title === 'string' && typeof value.body === 'string')
  }
  for (const key of ['stories', 'cooking', 'comments']) {
    if (input[key] && typeof input[key] === 'object' && !Array.isArray(input[key])) {
      for (const [id, value] of Object.entries(input[key])) {
        if (['__proto__', 'constructor', 'prototype'].includes(id)) continue
        if (key === 'comments') {
          if (Array.isArray(value)) output[key][id] = value.filter(x => x && typeof x.id === 'string' && typeof x.body === 'string')
        } else if (key === 'stories' && value && typeof value === 'object') {
          output.stories[id] = { found: value.found === true, collected: value.found === true && value.collected === true, page: Math.max(0, Math.floor(Number(value.page) || 0)) }
          if(id==='breakfast-note'&&(value.completed===true||value.readComplete===true||value.collected===true)) output.stories[id].readComplete=value.found===true
          if(id==='breakfast-note'&&value.dialogueVersion===1) Object.assign(output.stories[id],{dialogueVersion:1,dialogueIndex:Math.min(5,Math.max(0,Math.floor(Number(value.dialogueIndex)||0))),readComplete:value.found===true&&(value.readComplete===true||value.completed===true||value.collected===true)})
          if (dialogueLengths[id] && value.dialogueVersion === 1) Object.assign(output.stories[id], {
            dialogueVersion: 1, dialogueIndex: Math.min(dialogueLengths[id] - 1, Math.max(0, Math.floor(Number(value.dialogueIndex) || 0))),
            readComplete: value.found === true && (value.readComplete === true || value.collected === true),
          })
        } else if (key === 'cooking' && value === true) output.cooking[id] = true
      }
    }
  }
  return output
}

export function toggleMark(progress, kind, key) {
  if (!['favorites', 'likes'].includes(kind)) throw new Error('未知的互动类型')
  const list = progress[kind]
  const index = list.indexOf(key)
  if (index < 0) list.push(key)
  else list.splice(index, 1)
  return index < 0
}

export function finishCooking(progress, recipeId) {
  progress.cooking[recipeId] = true
}

export function discoverStory(progress, storyId) {
  progress.stories[storyId] ??= { found: true, collected: false, page: 0 }
  progress.stories[storyId].found = true
}

export function collectStory(progress, storyId, lastPage) {
  const story = progress.stories[storyId]
  if (storyId === 'breakfast-note' || dialogueLengths[storyId]) {
    if (story?.collected) return
    if (!story?.found || story.dialogueVersion !== 1 || !story.readComplete) throw new Error('先读完对话，再收下纪念物。')
    story.collected = true
    return
  }
  if (!story?.found || story.page < lastPage) throw new Error('先读完这段巷口故事，再收下纪念物。')
  story.collected = true
}

export function saveNoodleDialogue(progress,index,complete=false){
 const story=progress.stories['breakfast-note']
 if(!story?.found)throw new Error('请先找到碗边纸条。')
 const previousComplete=story.readComplete===true||story.collected===true||story.completed===true
 Object.assign(story,{dialogueVersion:1,dialogueIndex:Math.min(5,Math.max(0,Math.floor(Number(index)||0))),readComplete:previousComplete||(complete&&index===5)})
}

export function saveStallDialogue(progress, storyId, index, complete = false) {
 const length = dialogueLengths[storyId], story = progress.stories[storyId]
 if (!length || !story?.found) throw new Error('请先发现对应的隐藏物件。')
 const target = Math.floor(Number(index))
 if (!Number.isFinite(target) || target < 0 || target >= length) throw new Error('对话位置无效。')
 const previous = story.dialogueVersion === 1 ? story.dialogueIndex : 0
 if (target !== 0 && target > previous + 1) throw new Error('请按顺序读完对话。')
 if (complete && target !== length - 1) throw new Error('读到最后一句才能结束。')
 Object.assign(story, { dialogueVersion: 1, dialogueIndex: target, readComplete: story.readComplete === true || story.collected === true || complete })
}
