<script setup>
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getStory } from '../data/stories.js'
import { asset } from '../data/foods.js'
import { session, readStoryPage, takeMemento, notify } from '../stores/session.js'
import EmptyState from '../components/EmptyState.vue'
const route = useRoute(), router = useRouter(), story = computed(() => getStory(route.params.id))
const progress = computed(() => session.progress.stories[story.value?.id])
const page = ref(Math.min(progress.value?.page || 0, (story.value?.scenes.length || 1) - 1))
const scene = computed(() => story.value?.scenes[page.value])
async function next() {
  if (page.value < story.value.scenes.length - 1) {
    const target = page.value + 1
    if (await readStoryPage(story.value.id, target)) page.value = target
  } else if (await takeMemento(story.value.id, story.value.scenes.length - 1)) {
    notify('早餐笺已收入彩蛋收藏')
    router.push('/collection')
  }
}
</script>
<template>
  <section v-if="story && progress?.found" class="page story-page"><div class="scene-top"><RouterLink class="back" :to="'/food/' + story.foodId">← 放下纸条，回到原处</RouterLink><span>{{ story.title }} · 创作故事</span></div><div class="story-cinema"><img :key="page" class="story-image" :src="asset(scene.image)" :alt="scene.alt"><div class="scene-caption"><div><span class="scene-count">第{{ ['一', '二', '三'][page] }}幕 / 共{{ story.scenes.length }}幕</span><h1>{{ scene.title }}</h1></div><p>{{ scene.text }}</p></div></div><div class="scene-controls"><button id="story-prev" class="text-link" :disabled="page === 0 || session.saving" @click="page--">← 上一幕</button><div class="scene-dots" aria-label="阅读进度"><span v-for="(item, index) in story.scenes" :key="item.title" :class="{ active: index === page }" :aria-label="`第${index + 1}幕${index === page ? '，当前' : ''}`"></span></div><button id="story-next" class="button" :disabled="session.saving" @click="next">{{ page === story.scenes.length - 1 ? '收下早餐笺 →' : '下一幕 →' }}</button></div><p class="story-disclaimer">阿云为虚构体验角色，本故事为创作内容，并非采访或历史资料。</p></section>
  <section v-else class="page"><EmptyState heading="h1" title="故事还藏在巷子里" message="从食物旁的一件旧物开始，慢慢寻找。" :to="story ? '/food/' + story.foodId : '/map'" action="继续找找 →"/></section>
</template>
