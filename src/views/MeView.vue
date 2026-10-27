<script setup>
import { computed, ref } from 'vue'
import { foods } from '../data/foods.js'
import { session } from '../stores/session.js'
import FoodCard from '../components/FoodCard.vue'
import PostCard from '../components/PostCard.vue'
import EmptyState from '../components/EmptyState.vue'
const kind = ref('favorites'), type = ref('food')
const markedFoods = computed(() => foods.filter(food => session.progress[kind.value].includes('food:' + food.id)))
const markedPosts = computed(() => session.progress.posts.filter(post => session.progress[kind.value].includes('post:' + post.id)))
function exportRecords() {
  const blob = new Blob([JSON.stringify(session.progress, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob), link = document.createElement('a')
  link.href = url; link.download = '巷食记本地记录.json'; link.click(); setTimeout(() => URL.revokeObjectURL(url), 1000)
}
</script>
<template><section class="page"><h1>我的巷食手记</h1><p class="page-intro">本地访客 · 未登录真实账号 · 清除浏览器数据后记录会丢失</p><div class="actions"><RouterLink class="text-link" to="/submission">正式美食投稿 ↗</RouterLink><RouterLink class="text-link" to="/collection">我的故事纪念物 ↗</RouterLink><button class="text-link" @click="exportRecords">导出本地记录</button></div><div class="tabs"><button :class="{ active: kind === 'favorites' }" @click="kind = 'favorites'">我的收藏</button><button :class="{ active: kind === 'likes' }" @click="kind = 'likes'">我的喜欢</button></div><div class="tabs"><button :class="{ active: type === 'food' }" @click="type = 'food'">美食</button><button :class="{ active: type === 'post' }" @click="type = 'post'">帖子</button></div><template v-if="type === 'food'"><div class="food-spread"><FoodCard v-for="food in markedFoods" :key="food.id" :food="food"/></div><EmptyState v-if="!markedFoods.length" title="还没记下风味" message="遇见喜欢的美食时，可以收藏或点个喜欢。"/></template><template v-else><PostCard v-for="post in markedPosts" :key="post.id" :post="post"/><EmptyState v-if="!markedPosts.length" title="还没有记下帖子" to="/square" action="去广场逛逛 →"/></template><section class="my-section"><div class="section-heading"><h2>我写下的巷口小记</h2><RouterLink class="text-link" to="/publish">写一篇推荐 →</RouterLink></div><PostCard v-for="post in session.progress.posts" :key="post.id" :post="post"/><p v-if="!session.progress.posts.length">还没有写下小记，把今天值得记住的一口留在这里吧。</p></section><section class="my-section"><h2>投稿记录</h2><article v-for="record in session.progress.submissions" :key="record.id" class="post"><h3>{{ record.title }}</h3><p>{{ record.region }} · 待审核（本地流程演示，未真实提交）</p></article><p v-if="!session.progress.submissions.length" class="local-note">还没有投稿。正式投稿与广场普通发帖分别保存。</p></section></section></template>
