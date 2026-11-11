<script setup>
import { asset } from '../data/foods.js'
defineProps({ food: { type: Object, required: true }, eager: Boolean })
const responsivePhotos = {
  'catalog/noodles-photo.webp': ['catalog/noodles-photo-480.webp', 1200],
  'catalog/zongzi-photo-v2.webp': ['catalog/zongzi-photo-v2-480.webp', 1024],
}
const sources = food => responsivePhotos[food.image]
  ? asset(responsivePhotos[food.image][0]) + ' 480w, ' + asset(food.image) + ' ' + responsivePhotos[food.image][1] + 'w'
  : undefined
</script>
<template><div class="food-art" :class="{ 'food-photo': food.imageKind === 'photo' }"><img :style="{objectFit: food.photoCredit?.fit, filter: food.photoCredit?.displayFilter}" :src="asset(food.image)" :srcset="sources(food)" sizes="(max-width:700px) 50vw, 30vw" :alt="food.name + (food.imageKind === 'photo' ? '的照片配图' : '的手绘插画')" :loading="eager ? 'eager' : 'lazy'" decoding="async"></div></template>
