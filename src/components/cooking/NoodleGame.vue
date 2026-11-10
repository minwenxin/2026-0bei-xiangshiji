<script setup>
import { computed, ref, watchEffect, onBeforeUnmount } from 'vue'
import { asset } from '../../data/foods.js'
import { useBlanching } from '../../composables/useBlanching.js'
import { insideEllipse, useOperationCleanup } from '../../composables/cookingInteraction.js'
const emit=defineEmits(['state'])
const step=ref(0), selected=ref(''), error=ref(''), mix=ref(0), garnish=ref([]), stirring=ref(false)
const tip=ref({x:50,y:43}), movement=ref({x:0,y:0})
const heat=useBlanching()
const expected=computed(()=>['漏勺','芝麻酱','萝卜丁与葱花'][step.value])
const ready=computed(()=>step.value===0?heat.done.value:step.value===1?mix.value>=100:garnish.value.length===3)
const dialogue=computed(()=>{
  if(error.value)return error.value
  if(ready.value)return step.value===2?'香啦！点击“盛出这一碗”，准备开吃！':'这一手做好啦！点击“下一步”，咱们接着做。'
  if(!selected.value)return ['先点击漏勺，把已经煮熟的面烫热！','点击芝麻酱，再把酱香拌开！','点击“萝卜丁与葱花”，添上最后一口脆！'][step.value]
  if(step.value===0){if(heat.holding.value)return heat.elapsed.value>=1800?'面热乎啦，松开漏勺，沥沥水！':'按住漏勺，让熟面在热水里暖一暖。';if(heat.draining.value)return '提起来啦，等面汤滴一滴。';return heat.note.value||'按住锅边装面的漏勺烫面，松开就会提起哦！'}
  if(step.value===1)return stirring.value?'就是这样，按住来回拖动，把酱香拌开～':'在碗口里按住鼠标左键来回拖动，筷子帮你拌香！'
  return '点一点碗里的三个小圈，撒上最后一口脆！'
})
watchEffect(()=>emit('state',{step:step.value,ready:ready.value,selected:selected.value,dialogue:dialogue.value,phase:ready.value?'已完成':heat.holding.value||heat.draining.value||stirring.value?'操作中':selected.value?'待操作':'待选择',summary:step.value===0?(heat.done.value?'烫面、沥水完成':heat.draining.value?'提起沥水中':heat.holding.value?'熟面回温中':'熟面回温 · 松开后提起'):step.value===1?`拌匀 ${Math.round(mix.value)}%`:`撒料 ${garnish.value.length}/3`,help:['点击漏勺，再在锅边漏勺上按住鼠标左键，松开提起；键盘聚焦漏勺后按住空格，松开提起。短按保留回温时间，移出、取消或失焦立即停下。本体验只给熟面回温，不代表生面烹煮时间。','在碗口内按住左键来回拖动；松开或移出碗口立即停止。键盘聚焦“面碗搅拌区”，用方向键模拟筷子拌面。','点击碗里的三个小圈；键盘 Tab 到各落点，按 Enter 或空格。'][step.value]}))
function choose(name){if(name!==expected.value){error.value=`这个先歇会儿，咱们这步用${expected.value}。`;return}selected.value=name;error.value=''}
let capture=null,previous=null,keyboard=false
function releaseCapture(){const c=capture;capture=null;if(c?.el.hasPointerCapture(c.id))c.el.releasePointerCapture(c.id)}
function endMix(){stirring.value=false;previous=null;movement.value={x:0,y:0};releaseCapture()}
function heatStart(e){if(e.button!==0||!e.isPrimary||ready.value)return;error.value='';capture={el:e.currentTarget,id:e.pointerId};e.currentTarget.setPointerCapture(e.pointerId);heat.start()}
function heatEnd(cancel=false){keyboard=false;heat.stop(cancel);releaseCapture()}
function location(e){const r=e.currentTarget.getBoundingClientRect();return {x:(e.clientX-r.left)/r.width,y:(e.clientY-r.top)/r.height}}
function mixStart(e){if(e.button!==0||!e.isPrimary||step.value!==1||!selected.value||ready.value)return;const p=location(e);if(!insideEllipse(p.x,p.y))return;error.value='';previous=p;capture={el:e.currentTarget,id:e.pointerId};e.currentTarget.setPointerCapture(e.pointerId);stirring.value=true;tip.value={x:p.x*100,y:p.y*100}}
function mixMove(e){if(!stirring.value||!previous)return;const p=location(e);if(!insideEllipse(p.x,p.y)){endMix();return}const dx=p.x-previous.x,dy=p.y-previous.y,distance=Math.hypot(dx,dy);if(distance>0.003){mix.value=Math.min(100,mix.value+Math.min(distance,.18)*48);tip.value={x:p.x*100,y:p.y*100};movement.value={x:Math.max(-4,Math.min(4,dx*100)),y:Math.max(-3,Math.min(3,dy*100))};previous=p}if(ready.value)endMix()}
function mixKey(e){if(!['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(e.key)||step.value!==1||!selected.value||ready.value)return;e.preventDefault();error.value='';mix.value=Math.min(100,mix.value+8);tip.value={x:50+(e.key==='ArrowLeft'?-12:e.key==='ArrowRight'?12:0),y:43+(e.key==='ArrowUp'?-8:e.key==='ArrowDown'?8:0)};movement.value={x:e.key==='ArrowLeft'?-3:3,y:e.key==='ArrowUp'?-2:2}}
function stopKey(){movement.value={x:0,y:0}}
function heatKey(e){if(e.code!=='Space')return;e.preventDefault();if(!e.repeat&&!ready.value){keyboard=true;error.value='';heat.start()}}
function heatKeyUp(e){if(e.code==='Space'){e.preventDefault();if(keyboard)heatEnd()}}
function sprinkle(i){if(step.value===2&&selected.value&&!garnish.value.includes(i)){error.value='';garnish.value.push(i)}}
function cancel(){heat.cancel();keyboard=false;endMix()}
function advance(){if(!ready.value)return;cancel();step.value++;selected.value='';error.value=''}
useOperationCleanup(cancel)
onBeforeUnmount(cancel)
defineExpose({choose,advance})
</script>
<template>
  <template v-if="step===0 && selected">
    <button class="blanch-skimmer" :class="{immersed:heat.holding.value,draining:heat.draining.value,heated:heat.elapsed.value>=1800}" aria-label="按住漏勺烫面，松开提起" :aria-pressed="heat.holding.value" :disabled="ready" @pointerdown.prevent="heatStart" @pointerup="heatEnd(false)" @pointerleave="heatEnd(false)" @pointercancel="heatEnd(true)" @lostpointercapture="heatEnd(true)" @keydown="heatKey" @keyup="heatKeyUp" @blur="heatEnd(true)">
      <img class="skimmer-art" :src="asset('cook-skimmer.webp')" alt="" draggable="false"><img class="skimmer-noodles" :src="asset('cook-noodle-layer.webp')" alt="" draggable="false"><span v-if="heat.draining.value" class="water-drops" aria-hidden="true">·<br>·<br>·</span>
    </button>
    <div v-if="heat.holding.value" class="heat-ripples" aria-hidden="true"><i></i><i></i><i></i></div>
  </template>
  <span class="equipment-caption stove-one-caption">熟面回温 · 提起沥水</span>
  <div v-if="step>0" class="bowl-workspace layered-bowl" :class="{'can-mix':step===1&&selected&&!ready,'mix-complete':mix>=100}" tabindex="0" role="group" aria-label="面碗搅拌区" @pointerdown="mixStart" @pointermove="mixMove" @pointerup="endMix" @pointercancel="endMix" @lostpointercapture="endMix" @keydown="mixKey" @keyup="stopKey" @blur="endMix">
    <img class="fixed-bowl" :src="asset('cook-empty-bowl.webp')" alt="固定的青花面碗" draggable="false">
    <div class="noodle-mouth" aria-hidden="true">
      <img class="noodle-base" :src="asset('cook-noodle-layer.webp')" alt="" draggable="false">
      <img v-for="i in 3" :key="i" class="noodle-fold" :class="'fold-'+i" :src="asset('cook-noodle-layer.webp')" alt="" draggable="false" :style="{transform:`translate(${movement.x*(i%2?1:-1)}px,${movement.y*(i===2?-1:1)}px)`}">
    </div>
    <img v-if="step===1&&selected" class="mix-chopsticks" :src="asset('cook-stir-sticks.webp')" alt="" draggable="false" :style="{left:tip.x+'%',top:tip.y+'%',transform:`translate(-50%,-90%) rotate(${(tip.x-50)*.25}deg)`}">
    <img v-if="step===1&&selected" class="noodle-tip-veil" :src="asset('cook-noodle-layer.webp')" alt="" aria-hidden="true" draggable="false" :style="{clipPath:'ellipse(6% 5% at '+((tip.x-10)/.86)+'% '+((tip.y-10)/.63)+'%)'}">
    <img class="bowl-front" :src="asset('cook-empty-bowl.webp')" alt="" aria-hidden="true" draggable="false">
    <span v-if="step===1&&ready" class="mixed-seal">✓ 拌匀啦</span>
    <div v-if="step===2&&selected" class="garnish-targets"><button v-for="(place,i) in ['左侧','中间','右侧']" :key="place" :aria-label="'在面碗'+place+'撒料'" :aria-pressed="garnish.includes(i)" :class="{sprinkled:garnish.includes(i)}" @click="sprinkle(i)"><span v-if="!garnish.includes(i)" class="garnish-ring" aria-hidden="true"></span><img v-else class="garnish-morsels" :src="asset('cook-garnish.webp')" alt="" draggable="false"></button></div>
  </div>
  <span class="equipment-caption board-caption">{{ step===1?'筷子拌香':'备餐案板' }}</span>
</template>
