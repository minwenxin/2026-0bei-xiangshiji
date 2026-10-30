<script setup>
import { asset } from '../data/foods.js'
defineProps({ food: { type: Object, required: true }, eager: Boolean })
</script>
<template><div class="food-art" :class="{ 'food-photo': food.imageKind === 'photo' }"><img :src="asset(food.image)" :alt="food.name + (food.imageKind === 'photo' ? '的文档参考配图' : '的手绘插画')" :loading="eager ? 'eager' : 'lazy'"></div></template>
