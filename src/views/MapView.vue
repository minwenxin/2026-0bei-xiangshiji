<script setup>
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import atlas from '../data/china-map.json'
import { foods, foodRegions, asset } from '../data/foods.js'
import { notify } from '../stores/session.js'
const router = useRouter(), hovered = ref(null), focused = ref(null), selected = ref('')
const highlighted = computed(() => hovered.value ?? focused.value)
const active = computed(() => atlas.regions.find(region => region.id === highlighted.value))
const callouts = { '810000': [580, 563], '820000': [560, 618] }
// 主图原始边界 x=35..712.64，移到940宽画布正中；命中区、文字、浮层同组平移。
const mainlandTransform = 'translate(96.18 0)'
const open = region => foods.some(food => food.province === region.short)
const openCount = foodRegions.filter(name => name !== '跨地域').length
function enter(region) {
  if (!region) return
  if (open(region)) router.push('/province/' + region.short)
  else notify(`${region.short}的风味还在整理中，先逛逛已开放地区吧。`)
}
function selectRegion() { enter(atlas.regions.find(region => region.id === selected.value)) }
</script>
<template>
  <section class="page atlas-page">
    <RouterLink class="back atlas-back" to="/">← 回到首页</RouterLink>
    <div class="atlas-layout held-atlas">
      <img class="held-map-art" :src="asset('held-map-paper.webp')" alt="" aria-hidden="true">
      <div class="atlas-paper">
        <div class="atlas-paper-top">
          <div class="atlas-heading">
            <span>中国 · 风味舆图</span>
            <h1>山河有味，循香而行。</h1>
            <p>在地图上停一停，遇见一方风味。</p>
          </div>
          <div class="atlas-navigation">
            <label class="atlas-select-label">想去哪里
              <select id="atlas-select" v-model="selected" @change="selectRegion">
                <option value="">选择省份 / 地区</option>
                <option v-for="region in atlas.regions" :key="region.id" :value="region.id">{{ region.short }}{{ open(region) ? ' · 已开放' : '' }}</option>
              </select>
            </label>
            <div class="atlas-legend"><span><i class="open-dot"></i>已收录风味</span><span><i></i>待寻味</span></div>
          </div>
        </div>
        <div class="atlas-canvas">
      <svg class="china-atlas" viewBox="0 0 940 680" aria-label="中国省级美食探索地图" aria-describedby="atlas-description"><desc id="atlas-description">可通过键盘或地区选择框探索，待寻味的地区暂未开放。</desc><defs><filter id="province-lift-shadow" x="-50%" y="-50%" width="200%" height="220%"><feDropShadow dx="0" dy="9" stdDeviation="4" flood-color="#59412a" flood-opacity=".28"/></filter><clipPath id="south-sea-clip"><rect x="764" y="475" width="123" height="151"/></clipPath></defs>
        <g class="mainland-map" :transform="mainlandTransform">
          <g class="province-layer">
            <g v-for="region in atlas.regions" :key="region.id" class="province-target" :class="{ 'is-open': open(region), 'is-hovered': highlighted === region.id }" :data-map-code="region.id" tabindex="0" role="button" :aria-label="region.name + (open(region) ? '，已开放' : '，风味整理中')"
              @pointerenter="event => { if (event.pointerType !== 'touch') hovered = region.id }" @pointerleave="hovered = null"
              @focus="focused = region.id; hovered = null" @blur="focused = null"
              @click="hovered = region.id; enter(region)" @keydown.enter.prevent="enter(region)" @keydown.space.prevent="enter(region)" @keydown.esc="hovered = focused = null">
              <path class="province-shape" :d="region.d" fill-rule="evenodd"/>
              <rect v-if="callouts[region.id]" class="province-callout-hit" :x="callouts[region.id][0]-42" :y="callouts[region.id][1]-23" width="84" height="46" rx="7"/>
            </g>
          </g>
          <path class="maritime-boundary" :d="atlas.boundary"/>
          <g class="province-hover-layer" :class="{ visible: active, open: active && open(active) }" aria-hidden="true" pointer-events="none"><path id="hover-province" :d="active?.d || ''" fill-rule="evenodd"/></g>
          <!-- 文字最后统一绘制，避免被相邻省份或抬升色块遮住；不接收指针事件。 -->
          <g class="province-label-layer" aria-hidden="true" pointer-events="none">
            <g v-for="region in atlas.regions" :key="region.id" class="province-label" :class="{ 'is-open': open(region), 'is-raised': highlighted === region.id, 'province-callout': callouts[region.id] }" :data-label-code="region.id">
              <path v-if="region.leader" class="province-leader" :d="`M${region.anchor}L${callouts[region.id] || region.label}`"/>
              <rect v-if="callouts[region.id]" class="province-callout-paper" :x="callouts[region.id][0]-32" :y="callouts[region.id][1]-16" width="64" height="32" rx="6"/>
              <text :id="highlighted === region.id && !callouts[region.id] ? 'hover-province-label' : undefined" class="province-name" :x="(callouts[region.id] || region.label)[0]" :y="(callouts[region.id] || region.label)[1]">{{ region.short }}</text>
            </g>
          </g>
        </g>
        <g class="south-sea-inset" transform="translate(25 0)" aria-label="南海诸岛附图"><rect x="752" y="453" width="148" height="200" rx="2"/><g clip-path="url(#south-sea-clip)"><path v-for="(region, index) in atlas.inset" :key="index" :class="region.id === '100000_JD' ? 'maritime-boundary' : 'inset-land'" :d="region.d" fill-rule="evenodd"/></g><text x="826" y="644">南海诸岛</text></g>
      </svg>
    </div><div class="atlas-paper-bottom"><span>悬停看一看 · 点击去寻味</span><span>{{ openCount }} 处地区 · {{ foods.length }} 道风味</span></div></div></div>
    <div class="atlas-special-food"><span>南北家常</span><RouterLink to="/food/jiaozi">一盘饺子，包住家的味道 →</RouterLink></div>
    <details class="atlas-source"><summary>地图来源与使用说明</summary><p>省级边界来自 <a href="https://datav.aliyun.com/portal/school/atlas/area_selector" target="_blank" rel="noopener">DataV GeoAtlas</a>，下载于2026年10月27日。本页用于本地开发演示，不是已审定的官方标准地图。正式公开使用前须核对数据授权、完整表达与地图审核要求，说明详见项目文档。</p></details>
  </section>
</template>
