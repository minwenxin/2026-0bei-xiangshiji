<script setup>
import { computed, ref, watch, nextTick, onMounted, onBeforeUnmount } from 'vue'
import { foods, featuredFoods, foodRegions, asset } from '../data/foods.js'
import { samplePosts } from '../data/community.js'
import { session } from '../stores/session.js'
import FoodArt from '../components/FoodArt.vue'
import PostCard from '../components/PostCard.vue'
import EmptyState from '../components/EmptyState.vue'
const type = ref('all'), region = ref('全部地区'), query = ref(''), showNotes = ref(false)
const paperTexture = `url("${new URL(asset('held-map-paper.webp'), document.baseURI).href}")`
const matches = item => (region.value === '全部地区' || [item.region, item.province].join(' ').includes(region.value)) && (!query.value.trim() || [item.name, item.title, item.body, item.description, item.region, item.province].join(' ').includes(query.value.trim()))
const ownPosts = computed(() => session.progress.posts.slice().reverse())
const list = computed(() => foods.filter(matches))
const posts = computed(() => [...ownPosts.value, ...samplePosts].filter(matches))
const entries = computed(() => {
  const notes = type.value === 'official' ? [] : posts.value
  const picks = type.value === 'user' ? [] : list.value
  const result = []
  for (let i = 0; i < Math.max(notes.length, picks.length); i++) {
    if (notes[i]) result.push({ kind: 'post', item: notes[i] })
    if (picks[i]) result.push({ kind: 'food', item: picks[i] })
  }
  return result
})
const commentCount = computed(() => Object.values(session.progress.comments).reduce((sum, items) => sum + items.length, 0))
const masonry = ref(null)
let cardsObserver, widthObserver, layoutFrame = 0, lastWidth = 0
function layoutMasonry() {
  cancelAnimationFrame(layoutFrame)
  layoutFrame = requestAnimationFrame(() => {
    const container = masonry.value
    if (!container) return
    const row = parseFloat(getComputedStyle(container).gridAutoRows)
    const spans = [...container.children].map(item => Math.ceil((item.firstElementChild.offsetHeight + 28) / row))
    ;[...container.children].forEach((item, index) => { item.style.gridRowEnd = `span ${spans[index]}` })
  })
}
function observeCards() {
  cardsObserver?.disconnect()
  for (const item of masonry.value?.children || []) cardsObserver?.observe(item.firstElementChild)
  layoutMasonry()
}
onMounted(() => {
  cardsObserver = new ResizeObserver(layoutMasonry)
  widthObserver = new ResizeObserver(([entry]) => {
    if (entry.contentRect.width === lastWidth) return
    lastWidth = entry.contentRect.width
    layoutMasonry()
  })
  widthObserver.observe(masonry.value)
  observeCards()
})
watch(entries, async () => { await nextTick(); observeCards() }, { flush: 'post' })
onBeforeUnmount(() => {
  cancelAnimationFrame(layoutFrame)
  cardsObserver?.disconnect()
  widthObserver?.disconnect()
})
</script>
<template>
  <section class="page square-page archive-square" :style="{ '--archive-paper-art': paperTexture }">
    <div class="square-layout">
      <aside class="square-left">
        <div class="square-title-note"><h1>烟火广场</h1><p>把日子，贴成一页好味道。</p></div>
        <div class="square-shortcuts"><RouterLink to="/publish">写小记 ↗</RouterLink><button :aria-expanded="showNotes" aria-controls="square-local-notes" @click="showNotes = !showNotes">本机消息</button></div>
        <section v-if="showNotes" id="square-local-notes" class="archive-paper local-messages" aria-live="polite"><h2>留在本机的消息</h2><p>已保存 {{ commentCount }} 条留言。</p><p>这里暂未接入私信与站内通知。</p><RouterLink to="/me">查看我的记录 →</RouterLink></section>
        <section class="archive-paper square-profile"><div class="profile-heading"><span class="paper-avatar" aria-hidden="true">我</span><div><h2>巷口过客</h2><p>本地访客 · 此刻在寻味</p></div></div><RouterLink class="profile-link" to="/me">翻开我的记录 →</RouterLink><h3>我的小记 <small>{{ ownPosts.length }} 篇</small></h3><RouterLink v-for="post in ownPosts.slice(0, 3)" :key="post.id" class="my-note-link" :to="'/post/' + post.id">{{ post.title }}<span>{{ post.region }}</span></RouterLink><div v-if="!ownPosts.length" class="blank-personal-note"><p>今天吃到了什么？<br>给平常的一餐留个位置。</p><RouterLink to="/publish">写下第一篇 →</RouterLink></div><p class="profile-footnote">只记在当前浏览器里</p></section>
        <section class="archive-paper region-note"><h2>循着饭香去走走</h2><div class="region-buttons"><button v-for="item in ['全部地区', ...foodRegions]" :key="item" :class="{ active: region === item }" :aria-pressed="region === item" @click="region = item">{{ item }}</button></div></section>
      </aside>
      <div class="square-feed">
        <div class="feed-toolbar"><div class="tabs" aria-label="内容类型"><button v-for="item in [{id:'all',text:'全部'}, {id:'official',text:'巷食推荐'}, {id:'user',text:'食客分享'}]" :key="item.id" :class="{active:type===item.id}" :aria-pressed="type===item.id" @click="type=item.id">{{ item.text }}</button></div><label class="square-search"><span class="visually-hidden">找一份好味道</span><input v-model="query" type="search" placeholder="搜美食、地方或小记"></label></div>
        <div class="feed-caption"><h2>巷口新鲜事</h2><span>一餐一饭，慢慢记。</span></div>
        <div ref="masonry" class="square-masonry">
          <div v-for="entry in entries" :key="entry.kind + entry.item.id" class="masonry-item">
            <PostCard v-if="entry.kind === 'post'" :post="entry.item"/>
            <article v-else class="archive-paper square-food-note"><div class="food-note-heading"><span>巷食推荐</span><small>{{ entry.item.region }}</small></div><RouterLink :to="'/food/' + entry.item.id"><FoodArt :food="entry.item"/><h3>{{ entry.item.name }}</h3><p>{{ entry.item.description }}</p><span class="food-note-open">翻开风味笔记 →</span></RouterLink><p class="food-note-source">团队策划 · 演示资料待核验</p></article>
          </div>
        </div>
        <EmptyState v-if="!entries.length" title="这一页还空着" message="换个关键词或地区，也可以写下自己的见闻。" to="/publish" action="写一篇推荐 →"/>
      </div>
      <aside class="square-right">
        <section class="archive-paper today-note"><h2>今日推荐</h2><p class="aside-caption">从一份熟悉的味道开始</p><RouterLink v-for="food in featuredFoods" :key="food.id" :to="'/food/' + food.id"><FoodArt :food="food"/><span>{{ food.name }}<small>{{ food.region }}</small></span></RouterLink><span class="margin-handwriting">有空，去尝尝。</span></section>
        <section class="archive-paper square-rank"><h2>美食达人榜</h2><div class="rank-placeholder"><span class="rank-stamp">待开席</span><p>等真实的分享，<br>在这里相遇。</p></div><p>尚未接入多人数据，暂不生成排名。</p><RouterLink to="/publish">先记下自己的好味道 →</RouterLink></section>
        <div class="square-kind-note"><p>口味各有所爱，<br>一张饭桌，容得下不同。</p></div>
      </aside>
    </div>
    <p class="square-demo-note">本地演示 · 发帖与互动只存于当前浏览器；“虚构示例”为编辑版式样例。</p>
  </section>
</template>
