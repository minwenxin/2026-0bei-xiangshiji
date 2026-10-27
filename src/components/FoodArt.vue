<script setup>
import { asset } from '../data/foods.js'
defineProps({ food: { type: Object, required: true }, eager: Boolean })
</script>
<template><div class="food-art"><img :src="asset(food.image)" :alt="food.name + '的手绘插画'" :loading="eager ? 'eager' : 'lazy'"></div></template>
