<script setup>
import { computed, ref } from 'vue'
import { useCommunity } from '../composables/useCommunity.js'
import { foods } from '../data/foods.js'
import { getStory } from '../data/stories.js'
import { session } from '../stores/session.js'
import FoodCard from '../components/FoodCard.vue'
import PostCard from '../components/PostCard.vue'
import EmptyState from '../components/EmptyState.vue'
import MementoArt from '../components/MementoArt.vue'
const {data:communityData,loading:communityLoading,error:communityError,reload:reloadCommunity}=useCommunity()
const kind = ref('favorites'), type = ref('food')
const markedFoods = computed(() => foods.filter(food => session.progress[kind.value].includes('food:' + food.id)))
const markedPosts = computed(() => [...session.progress.posts, ...(communityData.value?.posts||[])].filter(post => session.progress[kind.value].includes('post:' + post.id)))
const keepsakes = computed(() => Object.values(session.progress.stories).filter(story => story.collected).length)
const commentCount = computed(() => Object.values(session.progress.comments).reduce((count, comments) => count + comments.length, 0))
const breakfastNote = getStory('breakfast-note').memento
function exportRecords() {
  const blob = new Blob([JSON.stringify(session.progress, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob), link = document.createElement('a')
  link.href = url; link.download = '巷食记本地记录.json'; link.click(); setTimeout(() => URL.revokeObjectURL(url), 1000)
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
        <button class="text-link" @click="exportRecords">导出本地记录</button>
      </div>
      <details class="me-messages">
        <summary>本机消息</summary>
        <p>已保存 {{ commentCount }} 条留言。</p>
        <p>这里暂未接入私信与站内通知。</p>
      </details>
      <p class="local-note">本机手记 · 记录保存在当前浏览器</p>
    </div>

    <section class="me-shelf" aria-label="我的收藏与喜欢">
      <h2>收进手记的好味道</h2>
      <div class="me-filters">
        <div class="tabs" role="group" aria-label="记录类型">
          <button :class="{ active: kind === 'favorites' }" :aria-pressed="kind === 'favorites'" @click="kind = 'favorites'">我的收藏</button>
          <button :class="{ active: kind === 'likes' }" :aria-pressed="kind === 'likes'" @click="kind = 'likes'">我的喜欢</button>
        </div>
        <div class="tabs" role="group" aria-label="内容类型">
          <button :class="{ active: type === 'food' }" :aria-pressed="type === 'food'" @click="type = 'food'">美食</button>
          <button :class="{ active: type === 'post' }" :aria-pressed="type === 'post'" @click="type = 'post'">帖子</button>
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
        <p>{{ record.region }} · 待审核（本地流程演示，未真实提交）</p>
      </article>
      <p v-if="!session.progress.submissions.length">还没有投稿。正式投稿与广场普通发帖分别保存。</p>
    </section>
    <section class="my-section" aria-labelledby="me-samples-title">
      <h2 id="me-samples-title">手记展示示例</h2>
      <div class="me-samples">
        <article class="archive-paper">
          <span class="friend-stamp">展示示例 · 小记</span>
          <h3>巷口的热干面，趁热拌才香</h3>
          <p>刚端上来的面还冒着热气，从碗底往上一挑，芝麻香一下就散开了。吃到最后，最舍不得那几粒脆萝卜丁。</p>
        </article>
        <article class="archive-paper">
          <span class="friend-stamp">展示示例 · 美食投稿</span>
          <h3>武汉三鲜豆皮</h3>
          <p class="sample-review">投稿示例 · 待审核</p>
          <p>金黄外皮裹着糯米和鲜香馅料，切成小块趁热吃。</p>
        </article>
        <article class="archive-paper collected-ticket">
          <span class="friend-stamp">展示示例 · 故事纪念物</span>
          <MementoArt :memento="breakfastNote" decorative/>
          <h3>{{ breakfastNote.name }}</h3>
          <p>{{ breakfastNote.line }}</p>
        </article>
      </div>
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
