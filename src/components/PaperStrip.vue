<script setup>
defineProps({ count: { type: Number, default: 48 } })
</script>
<template>
  <div v-for="(_, index) in count" :key="index" class="paper-strip" :class="{ 'is-tip': index === count - 1 }" :data-strip="index" :style="{ '--strip-count': count, '--strip-index': index }">
    <div class="turn-sheet-front"><span class="paper-shade"></span></div>
    <div class="turn-sheet-back"><span class="paper-shade"></span></div>
  </div>
</template>
