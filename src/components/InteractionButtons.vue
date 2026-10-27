<script setup>
import { session, hasMark, mark } from '../stores/session.js'
defineProps({ type: { type: String, required: true }, id: { type: String, required: true } })
</script>
<template>
  <button class="text-link" :aria-pressed="hasMark('favorites', type, id)" :disabled="session.saving" @click="mark('favorites', type, id)">{{ hasMark('favorites', type, id) ? '已收藏 · 取消' : '收藏' }}</button>
  <button class="text-link" :aria-pressed="hasMark('likes', type, id)" :disabled="session.saving" @click="mark('likes', type, id)">{{ hasMark('likes', type, id) ? '已喜欢 · 取消' : '喜欢' }}</button>
</template>
