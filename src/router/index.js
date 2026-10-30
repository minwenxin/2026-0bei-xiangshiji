import { createRouter, createWebHashHistory } from 'vue-router'

const routes = [
  { path: '/', name: 'home', component: () => import('../views/HomeView.vue'), meta: { title: '循着烟火，寻味中国' } },
  { path: '/map', name: 'map', component: () => import('../views/MapView.vue'), meta: { title: '美食地图' } },
  { path: '/province/:name', name: 'province', component: () => import('../views/ProvinceView.vue'), meta: { title: '地方风味' } },
  { path: '/food/:id', name: 'food', component: () => import('../views/FoodView.vue'), meta: { title: '风味手记' } },
  { path: '/cook/:id', name: 'cook', component: () => import('../views/CookView.vue'), meta: { title: '巷口小厨房' } },
  { path: '/story/:id', name: 'story', component: () => import('../views/StoryView.vue'), meta: { title: '巷口故事' } },
  { path: '/collection', name: 'collection', component: () => import('../views/CollectionView.vue'), meta: { title: '时光手记' } },
  { path: '/square', name: 'square', component: () => import('../views/SquareView.vue'), meta: { title: '烟火广场' } },
  { path: '/post/:id', name: 'post', component: () => import('../views/PostView.vue'), meta: { title: '食客分享' } },
  { path: '/publish', name: 'publish', component: () => import('../views/PublishView.vue'), meta: { title: '发布推荐' } },
  { path: '/submission', name: 'submission', component: () => import('../views/PublishView.vue'), meta: { title: '正式美食投稿' } },
  { path: '/me', name: 'me', component: () => import('../views/MeView.vue'), meta: { title: '我的手记' } },
  { path: '/:pathMatch(.*)*', name: 'not-found', component: () => import('../views/NotFoundView.vue'), meta: { title: '未找到页面' } },
]
export const router = createRouter({ history: createWebHashHistory(), routes, scrollBehavior: () => ({ top: 0 }) })
router.afterEach(to => { document.title = `${to.meta.title} · 巷食记`; document.body.dataset.page = to.name })
