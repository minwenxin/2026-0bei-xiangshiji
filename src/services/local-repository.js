import { emptyProgress, normalizeProgress } from '../domain/progress.js'

export const STORAGE_KEY = 'xiangshiji:formal:v1'

// 注入存储，便于测试以及替换未来真实服务；不用旧样板的存储键。
export function createLocalRepository(storage) {
  return {
    async load() {
      const raw = storage.getItem(STORAGE_KEY)
      if (!raw) return emptyProgress()
      try { return normalizeProgress(JSON.parse(raw)) }
      catch { throw new Error('本地记录无法读取。请先导出备份，再清理浏览器记录；本次可临时浏览。') }
    },
    async save(progress) {
      try { storage.setItem(STORAGE_KEY, JSON.stringify(progress)) }
      catch { throw new Error('本地保存失败，可能是存储空间不足或浏览器禁用了保存。此次修改未保存，请保留输入后重试。') }
    },
  }
}
