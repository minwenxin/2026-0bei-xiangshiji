<script setup>
import { computed } from 'vue'
import { asset } from '../../data/foods.js'
const props=defineProps({ recipe:Object, state:Object, finished:Boolean, servingImage:String, servingFilter:String, guidePortrait:String, guideName:String })
defineEmits(['choose'])
const kitchenImage=computed(()=>new URL(asset(props.recipe.kitchenImage||'kitchen-stations.webp'),document.baseURI).href)
</script>
<template>
  <div class="workstation-scroll" tabindex="0" aria-label="备餐操作台，窄屏可横向滚动">
    <div class="cooking-scene workstation-canvas" :class="recipe.kind + '-kitchen'" :style="{'--kitchen-scene':`url(${kitchenImage})`}">
      <template v-if="recipe.kind==='zongzi'"><svg class="zongzi-table" viewBox="1420 500 240 400" preserveAspectRatio="none" aria-hidden="true"><image :href="asset('kitchen-stations.webp')" width="1672" height="941"/></svg><svg class="zongzi-board" viewBox="688 543 370 315" preserveAspectRatio="none" aria-hidden="true"><image :href="asset('kitchen-stations.webp')" width="1672" height="941"/></svg></template>
      <h2 class="station-label ingredients-label">食材与工具</h2>
      <div class="ingredient-drawer" aria-label="食材与工具格位">
        <button v-for="item in recipe.items" :key="item.label" class="ingredient-slot" :class="{picked:state.selected===item.label}" :aria-label="item.label" :aria-pressed="state.selected===item.label" :disabled="finished || state.busy" @click="$emit('choose',item.label)">
          <svg v-if="item.art" class="ingredient-row-icon" :viewBox="item.art" aria-hidden="true"><image :href="asset('recipe-noodle-ingredients.webp')" width="2172" height="724"/></svg>
          <img v-else class="ingredient-object" :src="asset(item.image)" alt="" draggable="false"><span class="slot-caption">{{ item.label }}</span>
        </button>
      </div>
      <h2 v-if="recipe.seasonings.length" class="station-label seasoning-label">调味罐</h2>
      <div v-if="recipe.seasonings.length" class="seasoning-shelf" aria-label="调味罐"><button v-for="name in recipe.seasonings" :key="name" :aria-label="name" :class="{picked:state.selected===name}" :aria-pressed="state.selected===name" :disabled="finished || state.busy" @click="$emit('choose',name)"><span>{{ name }}</span></button></div>
      <slot v-if="!finished"/>
      <div v-else class="recipe-serving"><img :src="asset(servingImage)" :style="{filter:servingFilter}" :alt="'已完成的' + recipe.name"><span class="equipment-caption">{{recipe.servingNote||recipe.name}}</span></div>
      <aside id="cook-dialogue" class="station-speech station-speech-secondary" :aria-label="guideName + '的提示'" role="status" aria-live="polite" aria-atomic="true"><span class="speech-speaker">{{guideName}}</span><p><template v-for="(part,index) in state.dialogue.split(/(按住|松开|拖动|点击|空格|面团)/)" :key="index"><strong v-if="/^(按住|松开|拖动|点击|空格|面团)$/.test(part)">{{ part }}</strong><template v-else>{{ part }}</template></template></p></aside>
      <img class="workstation-guide" :src="asset(guidePortrait)" :alt="guideName"><p class="workstation-guide-name">{{guideName}}</p>
    </div>
  </div>
</template>
