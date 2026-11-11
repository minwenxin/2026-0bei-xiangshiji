<script setup>
import PostPhoto from '../components/PostPhoto.vue'
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { session, updateProgress, notify } from '../stores/session.js'
import { useCommunity } from '../composables/useCommunity.js'
import { getFood } from '../data/foods.js'
import InteractionButtons from '../components/InteractionButtons.vue'

const props = defineProps({ modal: Boolean })
defineEmits(['dismiss'])
const route = useRoute(), text = ref(''), reader = ref(null)
const content = ref(null), readingPane = ref(null), indexExpanded = ref(false)
const imageFailed = ref(false)
const { data: communityData, loading, error, reload } = useCommunity()
const post = computed(() => [...session.progress.posts, ...(communityData.value?.posts || [])].find(item => item.id === route.params.id))
const comments = computed(() => session.progress.comments[route.params.id] || [])
const food = computed(() => getFood(post.value?.foodId))
const editorial = computed(() => post.value?.contentKind === 'editorial')
const indexTitle = computed(() => editorial.value ? '小编的选题簿' : '这位饭友的小记')
const author = computed(() => communityData.value?.people.find(person => person.id === post.value?.authorId))
const indexPosts = computed(() => {
  if (!post.value?.example) return []
  return (communityData.value?.posts || []).filter(item => editorial.value
    ? item.contentKind === 'editorial'
    : item.authorId === post.value.authorId)
})
watch(() => route.params.id, async () => {
  text.value = ''
  indexExpanded.value = false
  await nextTick()
  content.value?.scrollTo(0, 0)
  readingPane.value?.scrollTo(0, 0)
})
watch(() => post.value?.image, () => { imageFailed.value = false })
onMounted(() => { if (props.modal) reader.value.showModal() })
onBeforeUnmount(() => { if (props.modal) reader.value.close() })

async function comment() {
  if (!text.value.trim()) { notify('先写下你的想法再保存。'); return }
  const record = { id: crypto.randomUUID(), body: text.value.trim(), createdAt: new Date().toISOString() }
  if (await updateProgress(progress => { (progress.comments[post.value.id] ??= []).push(record) })) {
    text.value = ''
    notify('留言已保存')
  }
}
</script>

<template>
  <component :is="modal ? 'dialog' : 'section'" ref="reader"
    class="post-reader" :class="[modal ? 'post-reader-dialog' : 'post-reader-page page', { 'post-reader-split': post?.example }]"
    :aria-labelledby="modal ? 'post-reader-label' : undefined"
    @cancel.prevent="$emit('dismiss')">
    <div v-if="modal" class="post-reader-toolbar">
      <span id="post-reader-label" class="sr-only">广场手记</span>
      <button type="button" class="post-reader-close" aria-label="关闭小记" autofocus @click="$emit('dismiss')">×</button>
    </div>
    <p v-if="modal && session.notice" class="post-reader-feedback" role="status">{{ session.notice }}</p>
    <div ref="content" class="post-reader-content">
      <aside v-if="post?.example" class="post-reader-index">
        <div class="post-index-heading">
          <h2>{{ indexTitle }}</h2>
        </div>
        <button class="post-index-toggle" type="button" :aria-expanded="indexExpanded" aria-controls="post-index-list"
          @click="indexExpanded = !indexExpanded">{{ indexTitle }} <span aria-hidden="true">{{ indexExpanded ? '−' : '+' }}</span></button>
        <div id="post-index-list" :class="{ 'post-index-expanded': indexExpanded }">
          <div v-if="!editorial && author" class="post-index-author">
            <RouterLink :to="'/taster/' + author.id" class="paper-avatar" :style="{ background: author.color }"
              :aria-label="'查看' + author.name + '的主页'">{{ author.name.slice(0, 1) }}</RouterLink>
            <div>
              <span class="friend-stamp">巷口饭友</span>
              <RouterLink class="post-index-name" :to="'/taster/' + author.id">{{ author.name }}</RouterLink>
              <p>{{ author.bio }}</p>
            </div>
          </div>
          <p class="post-index-count">{{ indexPosts.length }} 篇小记</p>
          <nav :aria-label="indexTitle">
            <RouterLink v-for="item in indexPosts" :key="item.id" :to="'/post/' + item.id" :replace="modal">
              <img v-if="item.image" :src="item.image" alt="" loading="lazy" width="40" height="40">
              <span v-else class="post-index-number" aria-hidden="true">{{ item.imageLabel || '记' }}</span>
              <span class="post-index-entry"><span class="post-index-region" aria-hidden="true">{{ item.imageLabel }} {{ item.region }}</span>{{ item.title }}</span>
              <span class="post-index-arrow" aria-hidden="true">›</span>
            </RouterLink>
          </nav>
        </div>
      </aside>
      <div ref="readingPane" class="post-reader-main">
        <RouterLink v-if="!modal" class="back" to="/square">回到烟火广场</RouterLink>
        <article v-if="post">
          <div class="post-reader-author">
            <RouterLink v-if="post.authorId" :to="'/taster/' + post.authorId">{{ post.author }}</RouterLink>
            <span v-else>{{ post.author || '巷口饭友' }}</span>
          </div>
          <div class="place">{{ post.region }}</div>
          <h1>{{ post.title }}</h1>
          <RouterLink v-if="editorial && food" class="post-map-link" :to="'/food/' + food.id">
            <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true">
              <path d="M12 22s7-6.1 7-13A7 7 0 1 0 5 9c0 6.9 7 13 7 13Z"/><circle cx="12" cy="9" r="2.5"/>
            </svg>
            <span><small>已收录于美食地图</small><strong>查看{{ food.name }}的详情</strong></span>
            <span class="post-map-arrow" aria-hidden="true">↗</span>
          </RouterLink>
          <figure v-if="post.image && !imageFailed" class="post-reader-figure">
            <figcaption v-if="post.imageLabel">{{ post.imageLabel }}</figcaption>
            <PostPhoto class="post-detail-image" :post="post" :alt="post.foodName ? post.foodName + '的配图' : post.title + '的配图'" @error="imageFailed = true"/>
          </figure>
          <p v-else-if="imageFailed" class="post-reader-image-note" role="status">配图暂时无法显示，正文仍可阅读。</p>
          <p class="post-body">{{ post.body }}</p>
          <RouterLink v-if="food && !editorial" class="text-link post-reader-related" :to="'/food/' + food.id">相关美食 · {{ food.name }} ↗</RouterLink>
          <div class="actions"><InteractionButtons type="post" :id="post.id"/></div>
          <h2>聊聊这一口</h2>

          <div id="comments">
            <div v-for="item in comments" :key="item.id" class="post"><span>巷口饭友</span><p>{{ item.body }}</p></div>
            <p v-if="!comments.length">还没有留言，来说说你的想法。</p>
          </div>
          <form class="form" @submit.prevent="comment">
            <label>留言<textarea v-model="text" name="comment" required maxlength="300" placeholder="写下你的想法"></textarea></label>
            <button class="button" :disabled="session.saving">{{ session.saving ? '正在保存…' : '保存留言' }}</button>
          </form>
        </article>
        <p v-else-if="loading" role="status">正在翻开这篇小记……</p>
        <div v-else-if="error" role="alert">
          <h1>这篇小记暂时没取回来</h1>
          <p>{{ error }}</p>
          <button class="button" @click="reload">重新试试</button>
        </div>
        <div v-else class="empty">
          <h1>这篇小记暂时找不到了</h1>
          <p>小记可能已删除或移除。</p>
        </div>
      </div>
    </div>
  </component>
</template>

<style scoped>
.post-reader {
  width: min(780px, calc(100% - 32px));
  color: #493327;
  background: #fffaf0;
  border: 1px solid #8a6548;
  border-radius: 5px 9px 5px 8px;
  box-shadow: inset 0 0 0 3px #f3e6cf, 0 16px 46px #4c32292e;
}
.post-reader-page { margin: 28px auto 44px; padding: 0; }
.post-reader-dialog {
  padding: 0;
  max-height: 85dvh;
  overflow: hidden;
}
.post-reader-dialog[open] { display: flex; flex-direction: column; }
.post-reader-dialog::backdrop { background: #61462e62; }
:global(html:has(.post-reader-dialog[open])) { overflow: hidden; scrollbar-gutter: stable; }
.post-reader-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex: none;
  padding: 5px 14px 5px 24px;
  background: #f4e8d3;
  border-bottom: 1px dashed #bca486;
  font: 18px var(--serif);
}
.post-reader-close {
  min-width: 44px;
  min-height: 44px;
  border: 1px solid #b59777;
  border-radius: 50%;
  background: #fff8e8;
  color: #65452e;
  font: 27px/1 sans-serif;
}
.post-reader-content { padding: 24px clamp(18px, 5vw, 48px) 36px; }
.post-reader-dialog .post-reader-content { overflow-y: auto; overscroll-behavior: contain; }
.post-reader-author { font: 20px var(--serif); }
.post-reader h1 { font-size: clamp(27px, 4vw, 40px); margin: 14px 0 22px; overflow-wrap: anywhere; }
.post-reader .post-detail-image {
  display: block;
  width: auto;
  max-width: 100%;
  max-height: min(340px, 42dvh);
  margin: 0 auto 24px;
}
.post-reader .post-body { max-width: none; line-height: 1.95; }
.post-reader-related { display: inline-block; margin-top: 12px; }
.post-reader .actions { margin: 24px 0; }
.post-reader-image-note, .post-reader-feedback { padding: 10px 14px; background: #f2e7d4; }
.post-reader-feedback { flex: none; margin: 0; max-width: none; }
.post-reader #comments { margin: 18px 0; }
.post-reader-split { width: min(1120px, calc(100% - 32px)); max-width: none; }
.post-reader-split .post-reader-content { padding: 0; min-height: 0; }
.post-reader-split .post-reader-main { padding: 24px clamp(18px, 4vw, 44px) 36px; min-width: 0; }
.post-reader-index {
  padding: 24px clamp(14px, 2vw, 26px);
  background: repeating-linear-gradient(0deg, transparent 0 27px, #9d784c10 27px 28px), #f6ead6;
  border-right: 1px dashed #bca486;
}
.post-index-heading {
  padding: 0 0 14px;
  margin-bottom: 16px;
  border-bottom: 3px double #b99a74;
}
.post-index-heading > span, .post-index-count {
  font-size: 15px;
  color: #795940;
  letter-spacing: .08em;
}
.post-index-heading h2 { margin: 4px 0 0; font: 26px var(--serif); }
.post-index-count { margin: 0 0 8px; }
.post-reader-index nav { display: grid; gap: 6px; }
.post-reader-index nav a {
  display: grid;
  grid-template-columns: 40px minmax(0, 1fr) auto;
  align-items: center;
  gap: 9px;
  padding: 8px;
  border: 1px solid #d8c3a3;
  border-left: 3px solid transparent;
  border-radius: 2px 5px 5px 2px;
  background: #fff9ee;
  line-height: 1.45;
}
.post-reader-index nav a::after { display: none; }
.post-reader-index nav a:hover { background: #f0dfc4; }
.post-reader-index nav a[aria-current="page"] { border-left-color: #953329; background: #ecd9bb; font-weight: bold; }
.post-reader-index nav img, .post-index-number {
  width: 40px; height: 40px; object-fit: cover;
  border: 2px solid #fff9ed; box-shadow: 0 1px 3px #62422930;
}
.post-index-number { display: grid; place-items: center; }
.post-index-entry { overflow-wrap: anywhere; }
.post-index-region { display: block; font-size: 15px; font-weight: normal; color: #795940; }
.post-index-arrow { color: #953329; }
.post-index-author {
  display: flex; align-items: flex-start; gap: 12px;
  padding: 14px; margin-bottom: 16px; background: #fff9ee;
  border: 1px solid #d8c3a3; border-radius: 4px;
}
.post-index-name { display: block; margin-top: 5px; font: 22px var(--serif); }
.post-index-author p { margin: 4px 0 0; font-size: 14px; }
.post-map-link {
  display: flex; align-items: center; gap: 12px;
  width: fit-content; max-width: 100%; min-height: 52px;
  margin: 0 0 22px; padding: 8px 14px;
  border: 1px solid #a4ad92; border-radius: 4px;
  background: #edf0e4; color: #334d3d;
}
.post-map-link:hover { background: #dfe7d7; }
.post-map-link svg, .post-map-arrow { flex: none; }
.post-map-link small, .post-map-link strong { display: block; }
.post-map-link small { font-size: 15px; }
.post-index-toggle { display: none; }
.post-reader-figure { margin: 0; }
.post-reader-figure figcaption { color: #795941; margin-bottom: 6px; }
@media (min-width: 721px) {
  .post-reader-split .post-reader-content { display: grid; grid-template-columns: 35fr minmax(0, 65fr); }
  .post-reader-dialog.post-reader-split .post-reader-content { grid-template-rows: minmax(0, 1fr); overflow: hidden; }
  .post-reader-dialog .post-reader-index,
  .post-reader-dialog.post-reader-split .post-reader-main { overflow-y: auto; overscroll-behavior: contain; }
}
@media (max-width: 720px) {
  .post-reader-index { padding: 0 18px; border-right: 0; border-bottom: 1px dashed #bca486; }
  .post-index-heading { display: none; }
  .post-index-toggle {
    display: flex; justify-content: space-between; align-items: center;
    width: 100%; min-height: 44px; padding: 8px 0;
    border: 0; background: transparent; color: #65452e; font: 19px var(--serif);
  }
  #post-index-list:not(.post-index-expanded) { display: none; }
  #post-index-list { padding-bottom: 12px; }
}
@media (max-width: 600px) {
  .post-reader-dialog {
    width: 100%;
    max-width: none;
    max-height: 90dvh;
    margin: auto 0 0;
    border-radius: 16px 16px 0 0;
  }
  .post-reader-content, .post-reader-split .post-reader-main { padding-bottom: calc(28px + env(safe-area-inset-bottom)); }
}
</style>
