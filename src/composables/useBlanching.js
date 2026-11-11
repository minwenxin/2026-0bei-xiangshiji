import { ref, onBeforeUnmount } from 'vue'
import { useOperationCleanup } from './cookingInteraction.js'

export function useBlanching() {
  const elapsed=ref(0), holding=ref(false), draining=ref(false), done=ref(false), note=ref('')
  const requiredMs=1800
  let frame=0, last=0, drainTimer=0
  function tick(now) {
    if (!holding.value) return
    elapsed.value=Math.min(requiredMs,elapsed.value+Math.min(100,Math.max(0,now-last)))
    last=now
    frame=requestAnimationFrame(tick)
  }
  function start() {
    if (holding.value || draining.value || done.value) return
    note.value=''; holding.value=true; last=performance.now(); frame=requestAnimationFrame(tick)
  }
  function stop(cancel=false) {
    if (!holding.value) return
    holding.value=false; cancelAnimationFrame(frame)
    if (cancel) { note.value='先歇一下，想继续时再按住漏勺。'; return }
    draining.value=true
    drainTimer=window.setTimeout(()=>{
      draining.value=false
      if (elapsed.value>=requiredMs) done.value=true
      else note.value='再烫一会儿，面就热乎啦。'
    },450)
  }
  const cancel=()=>{stop(true);clearTimeout(drainTimer);draining.value=false}
  useOperationCleanup(cancel)
  onBeforeUnmount(()=>{cancelAnimationFrame(frame);clearTimeout(drainTimer)})
  return {elapsed,holding,draining,done,note,start,stop,cancel}
}
