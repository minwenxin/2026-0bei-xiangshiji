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
const storyLink = computed(() => storyProgress.value?.found ? '/story/breakfast-note' : '/collection')
function randomFood() { router.push('/food/' + foods[Math.floor(Math.random() * foods.length)].id) }
function scrollTastes() { document.querySelector('#tastes')?.scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' }) }
</script>
<template>
  <section class="reference-hero" aria-labelledby="home-title">
    <!-- The supplied artwork preserves the custom lettering and painted sign edges.
         Separate semantic controls cover each painted sign; no entire-page screenshot. -->
    <svg class="home-sr" aria-hidden="true" focusable="false">
      <filter id="home-hero-sharpen" color-interpolation-filters="sRGB">
        <feConvolveMatrix order="3" kernelMatrix="0 -.16 0 -.16 1.64 -.16 0 -.16 0" edgeMode="duplicate" preserveAlpha="true"/>
      </filter>
    </svg>
    <img class="reference-hero-art" :src="asset('home-hero-hd.webp')" alt="" width="1761" height="893" fetchpriority="high">
    <h1 id="home-title" class="home-sr">巷食记：循着烟火，寻味中国</h1>
    <p class="home-sr">走进一条巷，记住一座城的味道。</p>
    <RouterLink class="painted-hit painted-map" to="/map"><span class="home-sr">翻翻美食地图</span></RouterLink>
    <button class="painted-hit painted-random" @click="randomFood"><span class="home-sr">随机寻味</span></button>
    <button class="painted-hit painted-scroll" @click="scrollTastes"><span class="home-sr">往巷子深处走</span></button>
  </section>
  <section id="tastes" class="section taste-section"><div class="section-heading"><div><h2>人间风味，慢慢尝。</h2><p>本期巷食手选：精选三味，更多风味见地图</p></div></div><div class="food-spread"><FoodCard v-for="food in featuredFoods" :key="food.id" :food="food"/></div></section>
  <section class="story-band home-story"><div><h2>有些故事，<br>藏在不起眼的地方。</h2><p>一张旧照片，一句手写的叮嘱。<br>留着食物旁的细节，把邂逅的故事带回来。</p><RouterLink class="text-link" :to="storyLink">{{ storyProgress?.found ? '回看已发现的巷口故事' : '翻看待发现的纪念物' }} 〉</RouterLink></div><RouterLink class="home-keepsake" :to="storyLink" aria-label="阿云的早餐笺，查看时光手记"><MementoArt :memento="stories[0].memento" decorative/><p>阿云的早餐笺</p></RouterLink></section>
  <section class="section home-square-section"><div class="square-preview"><figure class="home-breakfast"><span class="home-photo-label">来自巷口的味</span><img :src="asset('home-breakfast-photo.webp')" loading="lazy" width="424" height="400" alt="武汉人的早餐：手账纸框中的一碗热干面"></figure><div><h2>坐一会儿，<br>聊聊今天吃了什么。</h2><p>餐馆里的一餐，路边摊的一碗，<br>都是值得记下的日常。</p><p class="home-small-note">武汉的早晨，从一碗热干面开始！<br>地方故事，巷食记小铺。</p><div class="actions"><RouterLink class="button brush-button" to="/square">去烟火广场 →</RouterLink><RouterLink class="button brush-button home-write" to="/publish">写一篇推荐 →</RouterLink></div></div></div></section>
</template>
