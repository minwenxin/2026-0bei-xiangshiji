<script setup>
import FoodArt from './FoodArt.vue'
defineProps({ food: { type: Object, required: true } })
</script>
<template><article class="food-entry"><RouterLink :to="'/food/' + food.id"><FoodArt :food="food"/><h3>{{ food.name }}</h3><div class="place">{{ food.region }}</div><p>{{ food.description }}</p><div class="food-bottom"><span>{{ food.cookingId ? '可体验制作' : '地方风味' }}</span><span>去尝一口 ↗</span></div></RouterLink></article></template>
