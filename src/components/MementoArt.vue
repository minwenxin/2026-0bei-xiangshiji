<script setup>
import { asset } from '../data/foods.js'
const imageStyle = name => `url("${new URL(asset(name), document.baseURI).href}")`
defineProps({ memento: { type: Object, required: true }, unknown: Boolean, decorative: Boolean })
</script>

<template>
  <span
    class="memento-art"
    :class="{ 'is-unknown': unknown }"
    :style="{ '--memento-image': imageStyle(memento.image) }"
    :role="decorative ? undefined : 'img'"
    :aria-label="decorative ? undefined : unknown ? '尚未发现的纪念物轮廓' : memento.name"
    :aria-hidden="decorative ? 'true' : undefined"
  >
    <span v-if="unknown" class="memento-silhouette"></span>
    <img v-else :src="asset(memento.image === 'memento-breakfast-note.webp' ? 'memento-breakfast-note-400.webp' : memento.image)" alt="" loading="lazy" decoding="async" width="400" height="300">
    <span v-if="unknown" class="memento-question" aria-hidden="true">?</span>
  </span>
</template>
