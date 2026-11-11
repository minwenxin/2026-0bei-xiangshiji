<script setup>
import { session, hasMark, mark } from '../stores/session.js'
defineProps({ type: { type: String, required: true }, id: { type: String, required: true } })
const actions = [
  { kind: 'favorites', label: '收藏', path: 'm12 3 2.8 5.7 6.3.9-4.6 4.4 1.1 6.3L12 17.4l-5.6 2.9 1.1-6.3L3 9.6l6.2-.9Z' },
  { kind: 'likes', label: '喜欢', path: 'M12 20.5 3.6 12A5.3 5.3 0 0 1 12 5.6 5.3 5.3 0 0 1 20.4 12Z' },
]
</script>
<template>
  <div class="journal-marks" role="group" aria-label="喜欢与收藏">
    <button v-for="action in actions" :key="action.kind" type="button" class="text-link journal-mark"
      :class="action.kind" :aria-label="(hasMark(action.kind, type, id) ? '取消' : '') + action.label"
      :aria-pressed="hasMark(action.kind, type, id)" :disabled="session.saving" @click="mark(action.kind, type, id)">
      <svg viewBox="0 0 24 24" aria-hidden="true"><path :d="action.path"/></svg>
      {{ action.label }}
    </button>
  </div>
</template>

<style scoped>
.journal-marks { display: flex; flex-wrap: wrap; gap: 2px 4px; }
.journal-marks .journal-mark { display: inline-flex; align-items: center; gap: 4px; min-width: 44px; min-height: 44px; padding: 5px; border-radius: 3px; }
.journal-mark:focus-visible { outline: 2px solid var(--red); outline-offset: 2px; }
.journal-mark svg { width: 23px; height: 23px; flex: none; fill: none; stroke: currentColor; stroke-width: 1.7; stroke-linejoin: round; }
.journal-mark[aria-pressed=true] svg { fill: var(--mark-color); stroke: var(--mark-outline, var(--mark-color)); }
.journal-mark.likes { --mark-color: #9c4233; }
.journal-mark.favorites { --mark-color: #d6a54d; --mark-outline: #8c642c; }
</style>
