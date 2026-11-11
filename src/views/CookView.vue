<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { getRecipe } from '../data/cooking.js'
import { getFood } from '../data/foods.js'
import CookingSession from '../components/cooking/CookingSession.vue'
import EmptyState from '../components/EmptyState.vue'
const route=useRoute(),recipe=computed(()=>getRecipe(route.params.id))
</script>
<template>
  <CookingSession v-if="recipe&&getFood(recipe.foodId)" :key="recipe.id" :recipe="recipe"/>
  <section v-else class="page"><EmptyState heading="h1" title="这里没有配置制作体验" message="只有精选美食提供制作，先去认识一道地方风味吧。"/></section>
</template>
