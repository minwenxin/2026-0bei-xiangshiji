import { onBeforeUnmount, onMounted } from 'vue'

// 每种连续操作都在失焦、隐藏、卸载时终止；不补算后台经过的时间。
export function useOperationCleanup(stop) {
  const hidden = () => { if (document.hidden) stop() }
  onMounted(() => {
    window.addEventListener('blur', stop)
    document.addEventListener('visibilitychange', hidden)
  })
  onBeforeUnmount(() => {
    stop()
    window.removeEventListener('blur', stop)
    document.removeEventListener('visibilitychange', hidden)
  })
}
export function insideEllipse(x, y, cx=.5, cy=.43, rx=.43, ry=.29) {
  return ((x-cx)/rx)**2 + ((y-cy)/ry)**2 <= 1
}
