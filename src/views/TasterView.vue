<script setup>
import {computed} from 'vue'
import {useRoute} from 'vue-router'
import {useCommunity} from '../composables/useCommunity.js'
import PostCard from '../components/PostCard.vue'
import EmptyState from '../components/EmptyState.vue'
const route=useRoute(),{data,loading,error,reload}=useCommunity()
const person=computed(()=>data.value?.people.find(p=>p.id===route.params.id))
const posts=computed(()=>data.value?.posts.filter(p=>p.authorId===person.value?.id)||[])
const regions=computed(()=>[...new Set(posts.value.map(p=>p.region).filter(Boolean))])
const row=computed(()=>data.value?.rows.find(p=>p.id===person.value?.id))
</script>
<template><section class="page taster-journal"><RouterLink class="back" to="/tasters">← 看看全部饭友</RouterLink>
 <p v-if="loading" role="status">正在翻开饭友的手记……</p><section v-else-if="error" class="archive-paper community-error" role="alert"><h1>这本手记暂时没取回来</h1><p>{{error}}</p><button class="button" @click="reload">重新试试</button><RouterLink to="/square">回广场继续浏览 →</RouterLink></section>
 <template v-else-if="person">
  <section class="archive-paper taster-profile" aria-labelledby="taster-name">
   <span class="paper-avatar" :style="{background:person.color}" aria-hidden="true">{{person.name.slice(0,1)}}</span>
   <div class="taster-profile-info">
    <span v-if="!person.editorial" class="friend-stamp">巷口饭友</span>
    <h1 id="taster-name">{{person.name}}的寻味手记</h1>
    <p>{{person.bio}}</p>
    <p class="taster-regions">写过的地区：<span v-for="region in regions" :key="region" class="taster-region">{{region}}</span><span v-if="!regions.length">还没有公开小记</span></p>
   </div>
  </section>
  <p class="demo-disclosure">虚构人物与演示数据 · 此页是公开手记样式演示，不是真实账号主页</p><section class="archive-paper contribution-breakdown"><h2>这一周，记下的好味道</h2><p>{{data.week.label}}</p><p class="contribution-total">本周贡献值：<b>{{row?.score||0}}</b></p><dl><div><dt>有效小记</dt><dd>{{row?.breakdown.published||0}} 分</dd></div><div><dt>他人点赞</dt><dd>{{row?.breakdown.likes||0}} 分</dd></div><div><dt>他人收藏</dt><dd>{{row?.breakdown.favorites||0}} 分</dd></div></dl></section><h2>公开小记 <small>（虚构演示）</small></h2><PostCard v-for="post in posts" :key="post.id" :post="post"/><EmptyState v-if="!posts.length" title="这本手记还空着" message="小记可能已移除，也可以先读读其他饭友的见闻。" to="/tasters" action="看看其他饭友 →"/>
 </template>
 <EmptyState v-else heading="h1" title="这位饭友的手记暂时找不到了" message="人物可能已移除，回广场还可以继续寻找值得读的小记。" to="/square" action="回烟火广场 →"/>
</section></template>

<style scoped>
.taster-profile { align-items: flex-start; }
.taster-profile > .paper-avatar { flex-shrink: 0; }
.taster-profile-info { min-width: 0; overflow-wrap: anywhere; }
.taster-regions { display: flex; flex-wrap: wrap; align-items: baseline; gap: 6px; }
.taster-region { padding: 0 9px; border: 1px solid #c8b797; border-radius: 2px; background: #f5ead5; }
@media (max-width: 540px) {
 .taster-profile { flex-direction: column; }
 .taster-profile > .paper-avatar { flex-basis: auto; }
}
</style>
