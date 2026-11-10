<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { foods, featuredFoods, asset } from '../data/foods.js'
import { session } from '../stores/session.js'
import FoodCard from '../components/FoodCard.vue'
import MementoArt from '../components/MementoArt.vue'
import { useCommunity } from '../composables/useCommunity.js'
import { stories } from '../data/stories.js'
const router = useRouter()
const { data } = useCommunity()
const recommendation = computed(() => data.value?.recommended[0])
const storyProgress = computed(() => session.progress.stories['breakfast-note'])
function randomFood() { router.push('/food/' + foods[Math.floor(Math.random() * foods.length)].id) }
function scrollTastes() { document.querySelector('#tastes')?.scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' }) }
</script>
<template>
  <section class="hero">
    <img class="hero-landscape" :src="asset('hero-alley.jpg')" alt="水彩老街里，早餐摊升起蒸汽，行人走进晨光" fetchpriority="high">
    <div class="hero-center">
      <svg class="hero-steam" viewBox="0 0 440 160" aria-hidden="true">
        <path d="M62 157C-5 98 160 96 107 44M199 154C139 85 323 69 237 4M313 158C282 106 393 98 405 41"/>
      </svg>
      <div class="hero-wordmark" aria-hidden="true">
        <span class="hero-glyph">巷<svg viewBox="0 0 100 100"><path d="M9 69Q27 56 51 47Q65 54 91 63L88 67Q70 60 51 53Q28 60 14 73M20 72Q33 63 50 57L72 64M48 57V66H57V59"/></svg></span>
        <span class="hero-glyph">食<svg class="hero-basket" viewBox="0 0 100 100"><path d="M30 43Q50 26 71 40L74 65Q71 76 50 78Q31 76 28 66Z"/><ellipse cx="51" cy="43" rx="21" ry="9"/><path d="M30 52Q49 65 72 51M29 61Q52 75 74 60M42 54l-3 4 4 3M41 63l-2 4 5 3M43 72l-2 3"/></svg></span>
        <span class="hero-glyph">记<svg class="hero-notepaper" viewBox="0 0 100 100"><path d="M48 55Q67 57 86 47Q89 53 84 57L89 58Q86 73 75 85Q62 90 45 83Q45 70 48 55Z"/><path d="M56 63Q66 66 77 60M55 69Q65 72 74 67M54 75Q63 78 69 75"/></svg></span>
        <span class="little-seal">人间<br>有味</span>
      </div>
      <div class="actions"><RouterLink class="button brush-button" to="/map">翻翻美食地图</RouterLink><button class="hero-random" @click="randomFood">随机寻味</button></div>
    </div>
    <div class="hero-inscription"><h1>循着烟火，寻味中国</h1><p>走进一条巷，记住一座城的味道。</p></div>
    <button class="hero-scroll" @click="scrollTastes">往巷子深处走走 <span aria-hidden="true">↓</span></button>
  </section>
  <section id="tastes" class="section taste-section"><div class="section-heading"><div><h2>人间风味，慢慢尝。</h2><p>本期巷食手选 · 精选三味 · 更多风味见地图</p></div><RouterLink class="text-link" to="/map">展开美食地图 ↗</RouterLink></div><div class="food-spread"><FoodCard v-for="food in featuredFoods" :key="food.id" :food="food"/></div></section>
  <section class="story-band"><div><span class="paper-mark" aria-hidden="true">拾</span><h2>有些故事，<br>藏在不起眼的地方。</h2><p>一张旧纸片，一句手写的叮嘱。<br>留意食物旁的细节，把偶遇的故事带回家。</p><RouterLink class="text-link" :to="storyProgress?.found ? '/story/breakfast-note' : '/collection'">{{ storyProgress?.found ? '回看已发现的巷口故事' : '翻开我的纪念物手册' }} ↗</RouterLink></div><RouterLink class="memento-preview compact-memento" :to="storyProgress?.collected ? '/story/breakfast-note' : '/collection'"><MementoArt :memento="stories[0].memento" :unknown="!storyProgress?.collected" decorative /><p>{{ storyProgress?.collected ? '阿云的早餐笺' : '一份待发现的念想' }}</p></RouterLink></section>
  <section class="section home-square-section"><div class="square-preview"><figure class="home-note-photo"><img :src="recommendation?.image || asset('alley.jpg')" loading="lazy" :alt="recommendation ? recommendation.title + '的配图' : '巷口早餐摊的手绘场景'"></figure><div><h2>坐一会儿，<br>聊聊今天吃了什么。</h2><p>餐馆里的一餐，路边摊的一碗，<br>都是值得记下的日常。</p><p v-if="recommendation"><RouterLink class="text-link" :to="'/post/' + recommendation.id">{{ recommendation.title }} ↗</RouterLink><br><small>虚构示例 · {{ recommendation.author }}</small></p><div class="actions"><RouterLink class="button brush-button" to="/square">去烟火广场 →</RouterLink><RouterLink class="button brush-button home-write" to="/publish">写一篇推荐 →</RouterLink></div></div></div></section>
</template>
