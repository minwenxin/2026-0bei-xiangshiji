<script setup>
import { session, hasMark, mark } from '../stores/session.js'
defineProps({ type: { type: String, required: true }, id: { type: String, required: true }, icons: Boolean })
</script>
<template>
  <button class="text-link" :aria-pressed="hasMark('favorites', type, id)" :disabled="session.saving" @click="mark('favorites', type, id)"><svg v-if="icons" class="journal-action-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="m12 3 2.8 5.7 6.3.9-4.6 4.4 1.1 6.3L12 17.4l-5.6 2.9 1.1-6.3L3 9.6l6.2-.9Z"/></svg>{{ hasMark('favorites', type, id) ? '已收藏 · 取消' : '收藏' }}</button>
  <button class="text-link" :aria-pressed="hasMark('likes', type, id)" :disabled="session.saving" @click="mark('likes', type, id)"><svg v-if="icons" class="journal-action-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 20.5 3.6 12A5.3 5.3 0 0 1 12 5.6 5.3 5.3 0 0 1 20.4 12Z"/></svg>{{ hasMark('likes', type, id) ? '已喜欢 · 取消' : '喜欢' }}</button>
</template>
