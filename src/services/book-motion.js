// 仅在一次详情页翻阅中传递入场意图，不写入用户探索记录。
let revealTarget = null
export const BOOK_MOTION = Object.freeze({ fade: 320, turn: 1120, reveal: 520 })
export function queueBookReveal(id) { revealTarget = id }
export function consumeBookReveal(id) {
  const shouldReveal = revealTarget === id
  revealTarget = null
  return shouldReveal
}
export function clearBookReveal() { revealTarget = null }
