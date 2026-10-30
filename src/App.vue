<script setup>
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { foods } from './data/foods.js'
import { session, initialize } from './stores/session.js'
const route = useRoute(), router = useRouter(), main = ref(null), routeError = ref(false)
const links = [{ to: '/', title: '首页', group: 'home' }, { to: '/map', title: '美食地图', group: 'map' }, { to: '/square', title: '烟火广场', group: 'square' }, { to: '/collection', title: '时光手记', group: 'collection' }, { to: '/me', title: '我的', group: 'me' }]
const group = computed(() => ['province', 'food', 'cook'].includes(route.name) ? 'map' : ['post', 'publish'].includes(route.name) ? 'square' : route.name === 'story' ? 'collection' : route.name === 'submission' ? 'me' : route.name)
function randomFood() { router.push('/food/' + foods[Math.floor(Math.random() * foods.length)].id) }
function handleImageError(event) {
  if (event.target instanceof HTMLImageElement) {
    event.target.classList.add('image-failed')
    event.target.alt = '图片暂时无法显示，请刷新页面重试'
  }
}
const removeErrorHandler = router.onError(() => { routeError.value = true })
watch(() => route.fullPath, async () => { routeError.value = false; await nextTick(); main.value?.focus({ preventScroll: true }) })
onMounted(initialize)
onUnmounted(removeErrorHandler)
</script>
<template>
  <a class="skip-link" href="#main-content" @click.prevent="main?.focus()">跳到页面内容</a>
  <header><RouterLink class="brand" to="/" aria-label="巷食记首页"><span class="seal">巷</span><span>巷食记</span></RouterLink><nav aria-label="主导航"><RouterLink v-for="link in links" :key="link.to" :to="link.to" :aria-current="group === link.group ? 'page' : undefined">{{ link.title }}</RouterLink></nav><button class="nav-discover" @click="randomFood">今天吃点什么 <span>↗</span></button></header>
  <div v-if="session.storageError" class="storage-warning" role="alert">{{ session.storageError }}</div>
  <main id="main-content" ref="main" tabindex="-1" @error.capture="handleImageError">
    <div v-if="routeError" class="page"><h1>这条小巷暂时没能打开</h1><p>页面加载失败，请检查连接后刷新重试。</p><button class="button" @click="router.go(0)">刷新页面</button></div>
    <RouterView v-else-if="session.ready" :key="route.path"/>
    <div v-else class="page" role="status">正在翻开巷食手记……</div>
  </main>
  <footer><RouterLink class="brand" to="/">巷食记</RouterLink><p>一方水土，一味人间。<br>把远方的烟火，记进日常。</p><small>前端本地演示 · 记录仅存本机<br>临时 AI 辅助插画 · 虚构体验故事</small></footer>
  <div id="toast" role="status" :class="{ show: session.notice }">{{ session.notice }}</div>
</template>
