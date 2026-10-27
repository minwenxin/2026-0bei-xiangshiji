<script setup>
import { computed, ref } from 'vue'
import { foods } from '../data/foods.js'
import { session } from '../stores/session.js'
import FoodCard from '../components/FoodCard.vue'
import PostCard from '../components/PostCard.vue'
import EmptyState from '../components/EmptyState.vue'
const type = ref('all'), region = ref('全部地区')
const list = computed(() => foods.filter(food => region.value === '全部地区' || food.province === region.value))
const posts = computed(() => session.progress.posts.filter(post => region.value === '全部地区' || post.region === region.value).slice().reverse())
</script>
<template><section class="page"><div class="section-heading"><div><h1>巷口广场</h1><p>聊聊一餐饭的好，也听听别人的日常。</p></div><RouterLink class="button" to="/publish">发布推荐 ↗</RouterLink></div><p class="local-note">本地演示：推荐、评论与互动仅保存在当前浏览器，没有向其他用户公开。</p><div class="tabs" aria-label="内容类型"><button v-for="item in [{ id: 'all', text: '全部' }, { id: 'official', text: '巷食推荐' }, { id: 'user', text: '食客分享' }]" :key="item.id" :class="{ active: type === item.id }" :aria-pressed="type === item.id" @click="type = item.id">{{ item.text }}</button></div><div class="filter-bar"><label>地区<select v-model="region"><option v-for="item in ['全部地区', '湖北', '江苏', '浙江', '其他地区']" :key="item">{{ item }}</option></select></label></div><template v-if="type !== 'user'"><p class="place">巷食推荐 · 团队策划的演示内容，资料待核验</p><div class="food-spread"><FoodCard v-for="food in list" :key="food.id" :food="food"/></div><EmptyState v-if="!list.length" title="这里的风味还在整理" message="先逛逛已开放的地方吧。"/></template><template v-if="type !== 'official'"><h2 class="community-heading">食客分享</h2><PostCard v-for="post in posts" :key="post.id" :post="post"/><EmptyState v-if="!posts.length" title="巷口还等着第一篇小记" message="写下一份值得推荐的味道，记录只保存在这台设备。" to="/publish" action="写一篇推荐 →"/></template></section></template>
