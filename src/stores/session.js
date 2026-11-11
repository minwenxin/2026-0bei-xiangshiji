import { reactive, readonly } from 'vue'
import { progressRepository } from '../services/api.js'
import { emptyProgress, normalizeProgress, toggleMark, discoverStory, collectStory, finishCooking, saveNoodleDialogue, saveStallDialogue } from '../domain/progress.js'

const data = reactive({ progress: emptyProgress(), ready: false, saving: false, notice: '', storageError: '' })
let noticeTimer
export function notify(message) {
  data.notice = message
  clearTimeout(noticeTimer)
  noticeTimer = setTimeout(() => { data.notice = '' }, 4000)
}
export async function initialize() {
  try { data.progress = await progressRepository.load() }
  catch (error) { data.storageError = error.message }
  finally { data.ready = true }
}
export async function updateProgress(mutation) {
  if (data.saving) return false
  data.saving = true
  const next = normalizeProgress(JSON.parse(JSON.stringify(data.progress)))
  try {
    mutation(next)
    await progressRepository.save(next)
    data.progress = next
    data.storageError = ''
    return true
  } catch (error) {
    data.storageError = error.message
    notify(error.message)
    return false
  } finally { data.saving = false }
}
export async function mark(kind, type, id) {
  let added
  if (await updateProgress(p => { added = toggleMark(p, kind, `${type}:${id}`) })) notify(added ? '已记入“我的”' : '已取消')
}
export const hasMark = (kind, type, id) => data.progress[kind].includes(`${type}:${id}`)
export const findStory = id => updateProgress(p => discoverStory(p, id))
export const readStoryPage = (id, page) => updateProgress(p => { if (p.stories[id]?.found) p.stories[id].page = Math.max(p.stories[id].page, page) })
export const takeMemento = (id, lastPage) => updateProgress(p => collectStory(p, id, lastPage))
export const completeRecipe = id => updateProgress(p => finishCooking(p, id))
export const session = readonly(data)

export const saveDialogue = (index,complete=false) => updateProgress(p=>saveNoodleDialogue(p,index,complete))

export const saveStoryDialogue = (id, index, complete = false) => updateProgress(p => saveStallDialogue(p, id, index, complete))
