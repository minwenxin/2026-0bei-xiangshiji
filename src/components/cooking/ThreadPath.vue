<script setup>
import { computed,ref } from 'vue'
import { useOperationCleanup } from '../../composables/cookingInteraction.js'
const props=defineProps({points:{type:Array,required:true},enabled:Boolean})
const emit=defineEmits(['progress','complete','cancel','active'])
const count=ref(0),active=ref(false)
let capture=null
const polyline=computed(()=>props.points.map(p=>p.join(',')).join(' '))
const traced=computed(()=>props.points.slice(0,count.value).map(p=>p.join(',')).join(' '))
function stop(){if(active.value)emit('active',false);active.value=false;const c=capture;capture=null;if(c?.el.hasPointerCapture(c.id))c.el.releasePointerCapture(c.id)}
function visit(i){if(!props.enabled||i!==count.value)return;count.value++;emit('progress',count.value);if(count.value===props.points.length){stop();emit('complete')}}
function point(e){const r=e.currentTarget.getBoundingClientRect();return [(e.clientX-r.left)/r.width*100,(e.clientY-r.top)/r.height*100]}
const distance=(a,b)=>Math.hypot(a[0]-b[0],a[1]-b[1])
function start(e){if(!props.enabled||count.value>=props.points.length||e.button!==0||!e.isPrimary)return;const p=point(e),anchor=props.points[Math.max(0,count.value-1)];if(distance(p,anchor)>13)return;active.value=true;emit('active',true);capture={el:e.currentTarget,id:e.pointerId};e.currentTarget.setPointerCapture(e.pointerId);if(count.value===0)visit(0)}
function move(e){if(!active.value)return;const p=point(e),a=props.points[Math.max(0,count.value-1)],b=props.points[count.value];if(!b)return;const vx=b[0]-a[0],vy=b[1]-a[1],t=Math.max(0,Math.min(1,((p[0]-a[0])*vx+(p[1]-a[1])*vy)/(vx*vx+vy*vy)));if(distance(p,[a[0]+t*vx,a[1]+t*vy])>13){stop();emit('cancel');return}if(distance(p,b)<10)visit(count.value)}
useOperationCleanup(stop)
</script>
<template>
<div class="thread-path" :class="{enabled,threading:active}" aria-label="棉线包扎路径" @pointerdown.prevent="start" @pointermove="move" @pointerup="stop" @pointercancel="stop" @lostpointercapture="stop">
  <svg viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true"><polyline :points="polyline" class="thread-guide"/><polyline :points="traced" class="thread-traced"/></svg>
  <button v-for="(p,i) in points" :key="i" :style="{left:p[0]+'%',top:p[1]+'%'}" :disabled="!enabled || i!==count" :aria-label="'包扎路径第'+(i+1)+'点'" :aria-pressed="i<count" @keydown.enter.prevent="visit(i)" @keydown.space.prevent="visit(i)" @click="e=>{if(e.detail===0)visit(i)}">{{i<count?'✓':i+1}}</button>
</div>
</template>
