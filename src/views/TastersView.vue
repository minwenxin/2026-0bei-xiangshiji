<script setup>
import {useCommunity} from '../composables/useCommunity.js'
import TasterList from '../components/TasterList.vue'
import RankingRules from '../components/RankingRules.vue'
import EmptyState from '../components/EmptyState.vue'
const {data,loading,error,reload}=useCommunity()
</script>
<template><section class="page community-directory"><RouterLink class="back" to="/square">← 回到烟火广场</RouterLink><h1>本周美食达人榜</h1><p class="page-intro">把好味道记下来，也把好去处分享给大家。</p><p class="demo-disclosure">虚构人物与演示数据 · 本机互动不改变排行</p>
 <p v-if="loading" role="status">正在翻开本周手记……</p>
 <section v-else-if="error" class="archive-paper community-error" role="alert"><h2>榜单暂时没取回来</h2><p>{{error}}</p><button class="button" @click="reload">重新试试</button><RouterLink to="/map">先去美食地图逛逛 →</RouterLink></section>
 <template v-else><p class="week-period">统计周期：{{data.week.label}} · 最多展示前20位饭友</p><TasterList v-if="data.rows.length" :rows="data.rows.slice(0,20)"/><EmptyState v-else title="这周还没有饭友上榜" message="先记下一份好味道，让这页手记慢慢热闹起来。" to="/publish" action="我也写一篇 →"/><p v-if="data.rows.length" class="local-note">当前有 {{data.rows.length}} 位演示饭友，按实际样例数量展示。</p></template>
 <RankingRules/><div class="actions"><RouterLink class="button" to="/publish">我也写一篇 →</RouterLink><RouterLink to="/square">回广场读小记 →</RouterLink></div><p class="local-note">当前未连接真实账号，不生成“我的名次”。你写下的小记保存在本机。</p>
</section></template>
