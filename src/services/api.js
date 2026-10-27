import { createLocalRepository } from './local-repository.js'

// 只有这一层访问浏览器存储；后端接入时替换 load/save 实现。
const browserStorage = {
  getItem: key => window.localStorage.getItem(key),
  setItem: (key, value) => window.localStorage.setItem(key, value),
}
export const progressRepository = createLocalRepository(browserStorage)
export const dataMode = 'local'
