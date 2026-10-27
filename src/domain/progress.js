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
  if (!story?.found || story.page < lastPage) throw new Error('先读完这段巷口故事，再收下纪念物。')
  story.collected = true
}
