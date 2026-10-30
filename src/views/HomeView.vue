<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { foods, featuredFoods, asset } from '../data/foods.js'
import { session } from '../stores/session.js'
import FoodCard from '../components/FoodCard.vue'
import MementoArt from '../components/MementoArt.vue'
import { stories } from '../data/stories.js'
const router = useRouter()
const storyProgress = computed(() => session.progress.stories['breakfast-note'])
function randomFood() { router.push('/food/' + foods[Math.floor(Math.random() * foods.length)].id) }
function scrollTastes() { document.querySelector('#tastes')?.scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' }) }
</script>
<template>
  <section class="hero">
    <img class="hero-landscape" :src="asset('hero-alley.jpg')" alt="水彩老街里，早餐摊升起蒸汽，行人走进晨光" fetchpriority="high">
    <div class="hero-center"><div class="hero-wordmark" aria-hidden="true">巷食记<span class="little-seal">人间<br>有味</span></div><h1>循着烟火，寻味中国</h1><p>走进一条巷，记住一座城的味道。</p><div class="actions"><RouterLink class="button brush-button" to="/map">开始寻味 <span>→</span></RouterLink><button class="text-link" @click="randomFood">随缘遇见一味 ↗</button></div></div>
    <button class="hero-scroll" @click="scrollTastes">往巷子深处走 <span>↓</span></button><span class="hero-margin-note">街巷有声 · 三餐有味</span>
  </section>
  <section id="tastes" class="section taste-section"><div class="section-heading"><div><h2>人间风味，慢慢尝。</h2><p>本期巷食手选 · 精选三味 · 更多风味见地图</p></div><RouterLink class="text-link" to="/map">展开美食地图 ↗</RouterLink></div><div class="food-spread"><FoodCard v-for="food in featuredFoods" :key="food.id" :food="food"/></div></section>
  <section class="story-band"><div><span class="paper-mark" aria-hidden="true">拾</span><h2>有些故事，<br>藏在不起眼的地方。</h2><p>一张旧纸片，一句手写的叮嘱。<br>留意食物旁的细节，把偶遇的故事带回家。</p><RouterLink class="text-link" :to="storyProgress?.found ? '/story/breakfast-note' : '/collection'">{{ storyProgress?.found ? '回看已发现的巷口故事' : '翻开我的纪念物手册' }} ↗</RouterLink></div><RouterLink class="memento-preview compact-memento" :to="storyProgress?.collected ? '/story/breakfast-note' : '/collection'"><MementoArt :memento="stories[0].memento" :unknown="!storyProgress?.collected" decorative /><p>{{ storyProgress?.collected ? '阿云的早餐笺' : '一份待发现的念想' }}</p></RouterLink></section>
  <section class="section"><div class="square-preview"><img :src="asset('alley.jpg')" loading="lazy" alt="巷口早餐摊的手绘场景"><div><h2>坐一会儿，<br>聊聊今天吃了什么。</h2><p>餐馆里的一餐，路边摊的一碗，<br>都是值得记下的日常。</p><div class="actions"><RouterLink class="button" to="/square">去烟火广场 →</RouterLink><RouterLink class="text-link" to="/publish">写一篇推荐 ↗</RouterLink></div></div></div></section>
</template>
