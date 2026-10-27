<script setup>
defineProps({ title: { type: String, required: true }, message: String, heading: { type: String, default: 'h2' }, to: { type: String, default: '/map' }, action: { type: String, default: '继续寻味 →' } })
</script>
<template><div class="empty"><component :is="heading">{{ title }}</component><p v-if="message">{{ message }}</p><RouterLink class="text-link" :to="to">{{ action }}</RouterLink><slot/></div></template>
