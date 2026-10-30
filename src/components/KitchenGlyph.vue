<script setup>
defineProps({ name: { type: String, required: true } })
</script>
<template>
  <svg class="kitchen-glyph" viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <g v-if="name === 'skimmer'"><circle cx="26" cy="24" r="17"/><path d="m38 37 18 20M43 39l-4 4M12 21h28M14 29h24M22 9v30M30 9v30"/></g>
    <g v-else-if="name === 'chopsticks'"><path d="M21 7 31 57M33 6l8 50M21 7l4-1M33 6l4-1"/></g>
    <g v-else-if="name === 'flour'"><path d="M19 12h27l-2 8 7 33H13l7-33Z M19 20h25M26 34h13M28 41h9M18 8h28"/></g>
    <g v-else-if="name === 'leaf'"><path d="M12 52C9 25 25 9 54 9c-1 29-14 47-42 43Z M12 52 46 17M23 41l-3-13M33 31l13 1"/></g>
  </svg>
</template>
