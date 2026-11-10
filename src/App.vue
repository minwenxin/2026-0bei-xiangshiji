<script setup>
import { computed, nextTick, onMounted, onUnmounted, ref, shallowRef, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { foods } from './data/foods.js'
import { session, initialize } from './stores/session.js'
const route = useRoute(), router = useRouter(), main = ref(null), routeError = ref(false)
const squareBackground = shallowRef(null)
const backgroundRoute = computed(() => squareBackground.value || route)
let clickedPostLink, postOpener
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
function rememberPostLink(event) {
  if (route.name !== 'square') return
  clickedPostLink = !event.button && !event.ctrlKey && !event.metaKey && !event.shiftKey && !event.altKey
    ? event.target.closest('a:not([target="_blank"])')
    : null
}
watch(router.currentRoute, async (to, from) => {
  routeError.value = false
  if (squareBackground.value && to.name === 'post') {
    to.meta.squarePost = true
    return
  }
  if (from.name === 'square' && to.name === 'post' && clickedPostLink?.getAttribute('href') === router.resolve(to).href) {
    to.meta.squarePost = true
    postOpener = clickedPostLink
    clickedPostLink = null
    squareBackground.value = from
    return
  }
  const returnFocus = squareBackground.value && to.name === 'square' ? postOpener : null
  squareBackground.value = null
  postOpener = null
  clickedPostLink = null
  await nextTick()
  if (router.currentRoute.value === to) {
    const target = returnFocus?.isConnected ? returnFocus : main.value
    target?.focus({ preventScroll: true })
  }
})
onMounted(initialize)
onUnmounted(removeErrorHandler)
</script>
<template>
  <a class="skip-link" href="#main-content" @click.prevent="main?.focus()">跳到页面内容</a>
  <header><RouterLink class="brand" to="/" aria-label="巷食记首页"><span class="seal">巷</span><span>巷食记</span></RouterLink><nav aria-label="主导航"><RouterLink v-for="link in links" :key="link.to" :to="link.to" :aria-current="group === link.group ? 'page' : undefined">{{ link.title }}</RouterLink></nav><button class="nav-discover" @click="randomFood">今天吃点什么 <span>↗</span></button></header>
  <div v-if="session.storageError" class="storage-warning" role="alert">{{ session.storageError }}</div>
  <main id="main-content" ref="main" :class="'view-' + backgroundRoute.name" tabindex="-1" @error.capture="handleImageError" @click.capture="rememberPostLink">
    <div v-if="routeError" class="page"><h1>这条小巷暂时没能打开</h1><p>页面加载失败，请检查连接后刷新重试。</p><button class="button" @click="router.go(0)">刷新页面</button></div>
    <template v-else-if="session.ready">
      <RouterView :route="backgroundRoute" :key="backgroundRoute.name === 'post' ? 'post-reader' : backgroundRoute.path"/>
      <RouterView v-if="squareBackground" key="square-post-reader" modal @dismiss="router.back()"/>
    </template>
    <div v-else class="page" role="status">正在翻开巷食手记……</div>
  </main>
  <footer><RouterLink class="brand" to="/">巷食记</RouterLink><p>一方水土，一味人间。<br>把远方的烟火，记进日常。</p><small>街巷风味 · 日常故事</small></footer>
  <div id="toast" role="status" :class="{ show: session.notice }">{{ session.notice }}</div>
</template>
