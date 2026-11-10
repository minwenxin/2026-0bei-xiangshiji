<script setup>
defineProps({
  name: String,
  initials: String,
  category: String,
  region: String,
  disclosure: String,
  to: String,
  color: String,
})
</script>

<template>
  <div class="community-card-head">
    <RouterLink v-if="to" class="paper-avatar" :style="{ background: color }" :to="to"
      :aria-label="'翻开' + name + '的手记'">{{ initials }}</RouterLink>
    <span v-else class="paper-avatar" :style="{ background: color }" aria-hidden="true">{{ initials }}</span>
    <div class="card-head-copy">
      <RouterLink v-if="to" class="card-head-name" :to="to">{{ name }}</RouterLink>
      <strong v-else class="card-head-name">{{ name }}</strong>
      <div class="card-head-meta">
        <span>{{ category }}</span>
        <span v-if="region">{{ region }}</span>
      </div>
      <small class="card-head-disclosure">{{ disclosure }}</small>
    </div>
  </div>
</template>

<style scoped>
.community-card-head {
  display: grid;
  grid-template-columns: 37px minmax(0, 1fr);
  align-items: start;
  gap: 10px;
  min-height: 88px;
  padding-bottom: 12px;
  margin-bottom: 14px;
  border-bottom: 1px solid #d8c5a6;
}
.paper-avatar { width: 37px; height: 37px; font-size: 19px; }
.card-head-name { display: block; font: 19px/1.25 var(--serif); overflow-wrap: anywhere; }
.card-head-meta { display: flex; flex-wrap: wrap; gap: 4px 8px; margin-top: 5px; font-size: 12px; color: #6b5140; }
.card-head-meta span:first-child { border-radius: 2px; padding: 0 4px; background: #ecdec6; }
.card-head-disclosure { display: block; margin-top: 3px; font-size: 11px; color: #6f5946; }
</style>
