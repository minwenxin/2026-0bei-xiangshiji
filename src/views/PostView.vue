<script setup>
import { computed, ref } from 'vue'
import { useRoute } from 'vue-router'
import { session, updateProgress, notify } from '../stores/session.js'
import { getFood } from '../data/foods.js'
import InteractionButtons from '../components/InteractionButtons.vue'
import EmptyState from '../components/EmptyState.vue'
const route = useRoute(), text = ref('')
const post = computed(() => session.progress.posts.find(item => item.id === route.params.id))
const comments = computed(() => session.progress.comments[route.params.id] || [])
const food = computed(() => getFood(post.value?.foodId))
async function comment() {
  if (!text.value.trim()) { notify('先写下你的想法再保存。'); return }
  const record = { id: crypto.randomUUID(), body: text.value.trim(), createdAt: new Date().toISOString() }
  if (await updateProgress(progress => { (progress.comments[post.value.id] ??= []).push(record) })) { text.value = ''; notify('留言已保存到当前浏览器') }
}
</script>
<template><section v-if="post" class="page"><RouterLink class="back" to="/square">← 回到广场</RouterLink><h1>{{ post.title }}</h1><div class="place">{{ post.region }} · 本地访客的分享 · 仅存本机</div><article class="detail-text"><img v-if="post.image" class="post-detail-image" :src="post.image" :alt="post.title + '的推荐照片'"><p class="post-body">{{ post.body }}</p><RouterLink v-if="food" class="text-link" :to="'/food/' + food.id">相关美食 · {{ food.name }} ↗</RouterLink><div class="actions"><InteractionButtons type="post" :id="post.id"/></div><h2>聊聊这一口</h2><p class="local-note">留言仅存本机，不代表公开评论。</p><div id="comments"><div v-for="item in comments" :key="item.id" class="post"><span class="place">本地访客</span><p>{{ item.body }}</p></div><p v-if="!comments.length">还没有留言，来说说你的想法。</p></div><form class="form" @submit.prevent="comment"><label>本地留言<textarea v-model="text" name="comment" required maxlength="300" placeholder="写下你的想法"></textarea></label><button class="button" :disabled="session.saving">{{ session.saving ? '正在保存…' : '保存留言' }}</button></form></article></section><section v-else class="page"><EmptyState heading="h1" title="这篇小记暂时找不到了" message="本地帖子无法跨设备共享，可以回广场写一篇新的推荐。" to="/square" action="回到广场 →"/></section></template>
