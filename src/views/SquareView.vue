<script setup>
import {computed,ref,watch} from 'vue'
import {foods,foodRegions,asset,getFood} from '../data/foods.js'
import {session} from '../stores/session.js'
import {useCommunity} from '../composables/useCommunity.js'
import CommunityCardHead from '../components/CommunityCardHead.vue'
import FoodArt from '../components/FoodArt.vue'
import PostCard from '../components/PostCard.vue'
import TasterList from '../components/TasterList.vue'
import EmptyState from '../components/EmptyState.vue'
const {data,loading,error,reload}=useCommunity()
// Keep source and keyboard order while packing cards by their rendered height.
const cardSizes = new ResizeObserver(entries => {
  for (const { target, borderBoxSize } of entries) {
    target.style.setProperty('--card-rows', Math.ceil((borderBoxSize[0].blockSize + 16) / 8))
  }
})
const vMasonryCard = {
  mounted: el => cardSizes.observe(el, { box: 'border-box' }),
  unmounted: el => cardSizes.unobserve(el),
}
const type=ref('all'),region=ref('全部地区'),query=ref(''),recommendIndex=ref(0),visibleCount=ref(12)
const paperTexture=`url("${new URL(asset('held-map-paper.webp'),document.baseURI).href}")`
const regions=computed(()=>['全部地区',...new Set([...foodRegions,...(data.value?.posts||[]).map(post=>post.region).filter(Boolean)])])
const ownPosts=computed(()=>session.progress.posts.slice().reverse())
const matches=item=>(region.value==='全部地区'||[item.region,item.province].join(' ').includes(region.value))&&(!query.value.trim()||[item.name,item.foodName,getFood(item.foodId)?.name,item.title,item.body,item.description,item.region,item.province,item.author].join(' ').toLowerCase().includes(query.value.trim().toLowerCase()))
const matchKind=post=>type.value==='all'||(type.value==='editorial'?post.contentKind==='editorial':post.contentKind!=='editorial')
const posts=computed(()=>[...ownPosts.value,...(data.value?.posts||[])].filter(p=>matches(p)&&matchKind(p)))
const picks=computed(()=>{
  if(type.value==='share')return []
  // 同道菜已有小记时，保留小记，省去重复的资料卡。
  const coveredFoods=new Set((data.value?.posts||[]).map(post=>post.foodId).filter(Boolean))
  return foods.filter(food=>!coveredFoods.has(food.id)&&matches(food))
})
// Vary the order of each group while keeping pagination and back navigation stable.
const mixedOrders = [
  [0, 1, 2], [2, 0, 1], [1, 0, 2],
  [1, 2, 0], [0, 2, 1], [2, 1, 0],
]
const entries = computed(() => {
  const editorial = posts.value.filter(post => post.contentKind === 'editorial')
  const shares = posts.value.filter(post => post.contentKind !== 'editorial')
  const mapFoods = picks.value
  const result = []
  for (let i = 0; i < Math.max(editorial.length, shares.length, mapFoods.length); i++) {
    const batch = [
      { kind: 'post', item: editorial[i] },
      { kind: 'post', item: shares[i] },
      { kind: 'food', item: mapFoods[i] },
    ]
    const order = type.value === 'all' ? mixedOrders[i % mixedOrders.length] : mixedOrders[0]
    for (const index of order) {
      if (batch[index].item) result.push(batch[index])
    }
  }
  return result
})
const recommendations=computed(()=>(data.value?.recommended||[]).filter(p=>matches(p)&&matchKind(p)).slice(0,5))
const recommendation=computed(()=>recommendations.value[recommendIndex.value])
const caption=computed(()=>type.value==='editorial'?'每个人都有自己记忆中的家乡特色':type.value==='share'?'一段话，一张图，见识五湖四海的滋味':'每个人都有自己记忆中的家乡特色；一段话，一张图，见识五湖四海的滋味。')
watch([type,region,query],()=>{visibleCount.value=12;recommendIndex.value=0})
watch(recommendations,()=>{recommendIndex.value=0})
function turn(direction){recommendIndex.value=(recommendIndex.value+direction+recommendations.value.length)%recommendations.value.length}
</script>
<template><section class="page square-page archive-square community-square" :style="{'--archive-paper-art':paperTexture}"><div class="square-layout">
 <aside class="square-left">
  <div class="square-title-note"><h1>烟火广场</h1><p>把日子，贴成一页好味道。</p></div>
  <section class="archive-paper square-profile">
   <div class="profile-heading"><span class="paper-avatar" aria-hidden="true">我</span><div><h2>我的小饭桌</h2><p>本机手记 · 此刻在寻味</p></div></div>
   <div class="profile-actions">
    <RouterLink class="button" to="/publish">写一篇小记</RouterLink>
    <RouterLink class="text-link" to="/me">查看我的记录</RouterLink>
   </div>
   <h3>我的小记 <small>{{ownPosts.length}} 篇</small></h3>
   <RouterLink v-for="post in ownPosts.slice(0,3)" :key="post.id" class="my-note-link" :to="'/post/'+post.id">{{post.title}}<span>{{post.region}}</span></RouterLink>
   <p class="profile-footnote">只记在当前浏览器里</p>
  </section>
 </aside>
 <div class="square-feed" aria-label="广场内容">
  <section class="archive-paper recommendation-banner" aria-label="今日推荐">
   <div class="recommendation-heading"><h2>今日推荐</h2><span>按本期演示点赞排序</span></div>
   <p v-if="loading" role="status">正在翻开推荐小记……</p>
   <template v-else-if="recommendation">
    <div class="recommendation-story">
      <span class="post-kind">{{recommendation.contentKind==='editorial'?'小编推荐':'食客分享'}} · 虚构示例</span>
      <RouterLink :to="'/post/'+recommendation.id" aria-labelledby="recommendation-title recommendation-open">
       <h3 id="recommendation-title">{{recommendation.title}}</h3>
       <p class="recommendation-excerpt">{{recommendation.body.slice(0,72)}}……</p>
       <div class="recommendation-meta">
        <span id="recommendation-open" class="text-link">翻开这篇小记 →</span>
        <p class="demo-count">演示点赞 {{recommendation.demoStats.likes}} · 演示收藏 {{recommendation.demoStats.favorites}}</p>
       </div>
      </RouterLink>
    </div>
    <nav v-if="recommendations.length>1" class="recommendation-pages" aria-label="切换今日推荐"><button aria-label="上一篇推荐" @click="turn(-1)">←</button><button v-for="(item,index) in recommendations" :key="item.id" :aria-label="'查看第'+(index+1)+'篇推荐'" :aria-pressed="recommendIndex===index" @click="recommendIndex=index">{{index+1}}</button><button aria-label="下一篇推荐" @click="turn(1)">→</button></nav>
   </template>
   <p v-else>{{error?'推荐暂时没取回来，可以先浏览美食资料或重试。':'这个筛选下暂时没有推荐，换个关键词或地区看看。'}}</p>
  </section>
  <div class="feed-toolbar"><div class="tabs" aria-label="内容类型"><button v-for="item in [{id:'all',text:'全部'},{id:'editorial',text:'小编推荐'},{id:'share',text:'食客分享'}]" :key="item.id" :class="{active:type===item.id}" :aria-pressed="type===item.id" @click="type=item.id">{{item.text}}</button></div><label class="square-search"><span class="visually-hidden">找一份好味道</span><input v-model="query" type="search" placeholder="搜美食、地方或小记"></label><label class="square-region"><span>地区</span><select v-model="region" aria-label="筛选地区"><option v-for="item in regions" :key="item">{{item}}</option></select></label></div>
  <div class="feed-caption"><h2>巷口新鲜事</h2><span>{{caption}}</span></div>
  <div class="square-post-list">
  <section v-if="error" class="community-error archive-paper" role="alert"><h3>小记暂时没取回来</h3><p>{{error}} 本机小记和美食资料仍可浏览。</p><button class="text-link" @click="reload">重新试试 →</button></section>
  <div class="square-masonry"><div v-for="entry in entries.slice(0,visibleCount)" :key="entry.kind+entry.item.id" v-masonry-card class="masonry-item"><PostCard v-if="entry.kind==='post'" :post="entry.item"/><article v-else class="archive-paper square-food-note"><CommunityCardHead name="巷食记小编" initials="编" category="小编推荐" :region="entry.item.region" disclosure="公共美食资料"/><RouterLink :to="'/food/'+entry.item.id"><FoodArt :food="entry.item"/><h3>{{entry.item.name}}</h3><p>{{entry.item.description}}</p><span class="food-note-open">翻开风味笔记 →</span></RouterLink><p class="food-note-source">公共美食资料 · 与饭友小记分开收录</p></article></div></div>
  <EmptyState v-if="!entries.length&&!loading&&!error" title="这一页还空着" message="换个关键词或地区，也可以写下自己的见闻。" to="/publish" action="写一篇推荐 →"/><button v-if="entries.length>visibleCount" class="text-link more-notes" @click="visibleCount+=12">再翻一些手记 →</button>
  </div>
 </div>
 <aside class="square-right" aria-labelledby="square-rank-title" tabindex="0"><section class="archive-paper square-rank"><h2 id="square-rank-title">美食达人榜</h2><p class="aside-caption">把好味道记下来，也把好去处分享给大家。</p><p class="demo-disclosure">虚构人物与演示数据 · 本周榜</p><p v-if="loading" role="status">正在翻开本周榜……</p><template v-else-if="error"><p>榜单暂时没取回来。</p><button class="text-link" @click="reload">重新试试 →</button></template><template v-else><p class="week-period">{{data.week.label}}</p><TasterList v-if="data.rows.length" compact :rows="data.rows.slice(0,5)"/><p v-else class="empty-ranking">这周还没有饭友上榜，先记下一份好味道。</p></template><div class="rank-links"><RouterLink to="/tasters">看看全部饭友 →</RouterLink><RouterLink to="/publish">我也写一篇 →</RouterLink></div><p class="rank-boundary">本机互动不改变演示榜。</p></section></aside>
 </div><p class="square-demo-note">本地演示 · 发帖与互动只存于当前浏览器；虚构人物、示例点赞和收藏不代表真实热度。</p></section></template>

<style scoped>
.profile-actions { display: grid; justify-items: start; gap: 4px; margin: 14px 0; }
.profile-actions .button { width: 100%; padding: 7px; font-size: 18px; text-align: center; }
.profile-actions .text-link { display: inline-flex; align-items: center; min-height: 36px; font-size: 16px; }
</style>
