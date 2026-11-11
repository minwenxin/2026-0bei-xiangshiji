<script setup>
import { computed, ref } from 'vue'
import { useCommunity } from '../composables/useCommunity.js'
import { foods } from '../data/foods.js'
import { session } from '../stores/session.js'
import FoodCard from '../components/FoodCard.vue'
import PostCard from '../components/PostCard.vue'
import EmptyState from '../components/EmptyState.vue'
const {data:communityData,loading:communityLoading,error:communityError,reload:reloadCommunity}=useCommunity()
const kind = ref('favorites'), type = ref('food')
const markedFoods = computed(() => foods.filter(food => session.progress[kind.value].includes('food:' + food.id)))
const markedPosts = computed(() => [...session.progress.posts, ...(communityData.value?.posts||[])].filter(post => session.progress[kind.value].includes('post:' + post.id)))
const keepsakes = computed(() => Object.values(session.progress.stories).filter(story => story.collected).length)
const commentCount = computed(() => Object.values(session.progress.comments).reduce((count, comments) => count + comments.length, 0))
function exportRecords() {
  const blob = new Blob([JSON.stringify(session.progress, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob), link = document.createElement('a')
  link.href = url; link.download = '巷食记记录.json'; link.click(); setTimeout(() => URL.revokeObjectURL(url), 1000)
}
</script>
<template>
  <section class="page me-journal">
    <div class="archive-paper me-pass">
      <div class="me-identity">
        <span class="me-seal" aria-hidden="true">饭</span>
        <div>
          <span class="friend-stamp">巷口饭友</span>
          <h1>我的巷食手记</h1>
          <p>收好喜欢的味道，记下自己的一餐。</p>
        </div>
      </div>
      <dl class="me-tallies">
        <div><dt>我的小记</dt><dd>{{ session.progress.posts.length }}</dd></div>
        <div><dt>故事纪念物</dt><dd>{{ keepsakes }}</dd></div>
        <div><dt>投稿记录</dt><dd>{{ session.progress.submissions.length }}</dd></div>
      </dl>
      <div class="actions me-shortcuts">
        <RouterLink class="text-link" to="/publish">写一篇小记 ↗</RouterLink>
        <RouterLink class="text-link" to="/submission">正式美食投稿 ↗</RouterLink>
        <RouterLink class="text-link" to="/collection">我的故事纪念物 ↗</RouterLink>
        <button class="text-link" @click="exportRecords">导出记录</button>
      </div>
      <details class="me-messages">
        <summary>我的消息</summary>
        <p>已保存 {{ commentCount }} 条留言。</p>
        <p>这里暂未接入私信与站内通知。</p>
      </details>

    </div>

    <section class="me-shelf" aria-label="我的收藏与喜欢">
      <h2>收进手记的好味道</h2>
      <div class="me-filters">
        <div class="tabs" role="group" aria-label="记录类型">
          <button :class="{ active: kind === 'favorites' }" :aria-pressed="kind === 'favorites'" @click="kind = 'favorites'"><span>我的收藏</span></button>
          <button :class="{ active: kind === 'likes' }" :aria-pressed="kind === 'likes'" @click="kind = 'likes'"><span>我的喜欢</span></button>
        </div>
        <div class="tabs" role="group" aria-label="内容类型">
          <button :class="{ active: type === 'food' }" :aria-pressed="type === 'food'" @click="type = 'food'"><span>美食</span></button>
          <button :class="{ active: type === 'post' }" :aria-pressed="type === 'post'" @click="type = 'post'"><span>帖子</span></button>
        </div>
      </div>
      <template v-if="type === 'food'">
        <div v-if="markedFoods.length" class="food-spread"><FoodCard v-for="food in markedFoods" :key="food.id" :food="food" interactive/></div>
        <EmptyState v-else title="还没记下风味" message="遇见喜欢的美食时，可以收藏或点个喜欢。"/>
      </template>
      <template v-else>
        <section v-if="communityError" role="alert">
          <p>{{ communityError }}</p>
          <button class="text-link" @click="reloadCommunity">重新取回演示小记 →</button>
        </section>
        <PostCard v-for="post in markedPosts" :key="post.id" :post="post"/>
        <EmptyState v-if="!markedPosts.length && !communityLoading && !communityError"
          title="还没有记下帖子" to="/square" action="去烟火广场逛逛 →"/>
      </template>
    </section>

    <section class="my-section">
      <div class="section-heading">
        <h2>我写下的巷口小记</h2>
        <RouterLink class="text-link" to="/publish">写一篇推荐 →</RouterLink>
      </div>
      <PostCard v-for="post in session.progress.posts" :key="post.id" :post="post"/>
      <p v-if="!session.progress.posts.length">还没有写下小记，把今天值得记住的一口留在这里吧。</p>
    </section>
    <section class="my-section">
      <h2>投稿记录</h2>
      <article v-for="record in session.progress.submissions" :key="record.id" class="post">
        <h3>{{ record.title }}</h3>
        <p>{{ record.region }} · 投稿草稿</p>
      </article>
      <p v-if="!session.progress.submissions.length">还没有投稿。正式投稿与广场普通发帖分别保存。</p>
    </section>

  </section>
</template>

<style scoped>
.me-journal { max-width: 1140px; margin-inline: auto; }
.me-pass { padding: clamp(18px, 4vw, 36px); }
.me-identity { display: flex; align-items: center; gap: clamp(12px, 3vw, 26px); }
.me-seal {
  display: grid; place-items: center; flex: none;
  width: clamp(50px, 8vw, 78px); aspect-ratio: 1;
  border: 4px double #f7e2c6; border-radius: 10px 6px 10px 6px;
  background: #8b392c; color: #fff4dc;
  font: clamp(25px, 5vw, 44px) var(--serif); rotate: -4deg;
}
.me-identity h1 { font-size: clamp(28px, 5vw, 45px); margin: 8px 0 4px; }
.me-identity p { margin: 0; color: #69513e; }
.me-tallies {
  display: grid; grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 8px; margin: 24px 0 14px;
  padding: 14px 0; border-block: 1px dashed #bca486;
}
.me-tallies div { display: flex; align-items: baseline; flex-wrap: wrap; gap: 3px 9px; }
.me-tallies dt { font-size: 16px; color: #6c523c; }
.me-tallies dd { margin: 0; font: 25px var(--serif); color: #873b2e; }
.me-shortcuts { gap: 8px 18px; flex-wrap: wrap; margin: 10px 0 0; }
.me-shortcuts > * { display: inline-flex; align-items: center; min-height: 44px; }
.me-messages { border-top: 1px dashed #bca486; margin-top: 8px; }
.me-messages summary { width: fit-content; padding: 10px 4px; cursor: pointer; color: var(--green); }
.me-messages p { margin: 0 0 6px; font-size: 14px; }
.me-pass .local-note { margin: 6px 0 0; }
.me-shelf { margin-top: 36px; }
.me-filters { display: flex; justify-content: space-between; flex-wrap: wrap; gap: 4px 20px; border-bottom: 1px dashed #bca486; }
.me-filters .tabs { margin: 6px 0 12px; }
.me-samples { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 20px; }
.me-samples article { padding: 20px; }
.me-samples h3 { margin: 10px 0 6px; }
.me-samples .memento-art { width: min(100%, 140px); margin: 8px auto 0; }
.sample-review { color: #805321; font-size: 15px; }
@media (max-width: 720px) {
  .me-samples { grid-template-columns: 1fr; }
}
</style>
