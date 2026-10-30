<script setup>
import { computed, ref } from 'vue'
import { useRoute } from 'vue-router'
import { foods, foodCategories } from '../data/foods.js'
import FoodCard from '../components/FoodCard.vue'
import EmptyState from '../components/EmptyState.vue'
const route = useRoute(), city = ref('全部城市'), category = ref('全部类别')
const all = computed(() => foods.filter(food => food.province === route.params.name))
const cities = computed(() => ['全部城市', ...new Set(all.value.map(food => food.city))])
const list = computed(() => all.value.filter(food => (city.value === '全部城市' || food.city === city.value) && (category.value === '全部类别' || food.category === category.value)))
function reset() { city.value = '全部城市'; category.value = '全部类别' }
</script>
<template><section class="page province-page"><RouterLink class="back" to="/map">← 回到美食地图</RouterLink><h1>{{ route.params.name }}，有滋有味</h1><p class="page-intro">{{ route.params.name === '湖北' ? '江湖相逢，先过个早。' : '循着蒸汽与饭香，认识这里的日常。' }} 菜品依据团队素材文档整理。</p><div class="filter-bar"><label>城市<select id="city-filter" v-model="city"><option v-for="item in cities" :key="item">{{ item }}</option></select></label><label>类别<select id="type-filter" v-model="category"><option v-for="item in ['全部类别', ...foodCategories]" :key="item">{{ item }}</option></select></label><span>共 {{ list.length }} 道风味</span></div><div class="food-spread province-food-grid"><FoodCard v-for="food in list" :key="food.id" :food="food"/><EmptyState v-if="!list.length" title="这一页，还没有收录" message="换个城市或类别，看看其他风味。"><button class="text-link" @click="reset">清除筛选 →</button></EmptyState></div></section></template>
