<script setup>
import InteractionButtons from './InteractionButtons.vue'
defineProps({ post: { type: Object, required: true } })
</script>
<template><article class="post"><div class="place">食客分享 · 本机记录 · {{ post.region }}</div><RouterLink :to="'/post/' + post.id"><img v-if="post.image" class="post-image" :src="post.image" :alt="post.title + '的推荐照片'" loading="lazy"><h3>{{ post.title }}</h3><p>{{ post.body.slice(0, 120) }}{{ post.body.length > 120 ? '…' : '' }}</p></RouterLink><div class="actions"><RouterLink class="text-link" :to="'/post/' + post.id">读完整小记 ↗</RouterLink><InteractionButtons type="post" :id="post.id"/></div></article></template>
