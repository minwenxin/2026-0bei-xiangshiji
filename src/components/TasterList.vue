<script setup>
defineProps({rows:{type:Array,default:()=>[]},compact:Boolean})
</script>
<template><ol class="taster-list" :class="{compact}"><li v-for="row in rows" :key="row.id" class="taster-row">
 <span class="taster-rank" :class="{stamped:row.rank<=3}" :aria-label="(row.tied?'并列':'')+'第'+row.rank+'名'">{{row.rank}}<small v-if="row.tied">并列</small></span>
 <div class="taster-entry"><div class="taster-heading"><RouterLink class="paper-avatar" :style="{background:row.color}" :to="'/taster/'+row.id" :aria-label="'翻开'+row.name+'的手记'">{{row.name.slice(0,1)}}</RouterLink><div><RouterLink class="taster-name" :to="'/taster/'+row.id">{{row.name}}</RouterLink><p>{{row.tag}}</p></div></div><div class="taster-score">本周贡献 <b>{{row.score}}</b><span>分 · 演示</span></div><RouterLink v-if="row.representative" class="representative-note" :to="'/post/'+row.representative.id">{{row.representative.title}} ↗</RouterLink></div>
</li></ol></template>
