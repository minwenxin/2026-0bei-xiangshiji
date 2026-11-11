<script setup>
import {onMounted,onBeforeUnmount,ref} from 'vue'
const element=ref(null),paused=ref(false)
let observer,visible=true
function update(){paused.value=!visible||document.hidden}
onMounted(()=>{
 observer=new IntersectionObserver(([entry])=>{visible=entry.isIntersecting;update()})
 observer.observe(element.value);document.addEventListener('visibilitychange',update);update()
})
onBeforeUnmount(()=>{observer?.disconnect();document.removeEventListener('visibilitychange',update)})
</script>
<template>
 <svg ref="element" class="hero-logo-steam" :class="{'steam-paused':paused}" viewBox="0 0 887 450" aria-hidden="true" focusable="false">
  <defs><linearGradient id="hero-steam-ink" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#fff4db" stop-opacity="0"/><stop offset=".25" stop-color="#fff7e6" stop-opacity=".85"/><stop offset=".7" stop-color="#fff9ef" stop-opacity=".7"/><stop offset="1" stop-color="#fff9ef" stop-opacity="0"/></linearGradient></defs>
  <g v-for="(path,index) in ['M330 127 C311 111 324 98 343 87 S360 63 340 50 S332 27 344 12','M440 125 C423 110 429 96 449 83 S468 58 448 44 S436 20 449 4','M545 132 C527 117 537 104 555 93 S571 70 552 58 S547 35 559 21']" :key="index" class="steam-rise" :style="{'--steam-delay':[-1.6,-3.9,-.2][index]+'s','--steam-duration':[5.8,6.6,6.1][index]+'s'}">
   <g class="steam-sway"><path class="steam-soft" :d="path"/><path class="steam-vapor" :d="path"/>
    <g class="steam-bloom" :style="{'--bloom-x':[338,446,551][index]+'px'}"><ellipse :cx="[338,446,551][index]-10" cy="48" rx="23" ry="13"/><ellipse :cx="[338,446,551][index]+12" cy="32" rx="28" ry="16"/></g></g>
  </g>
 </svg>
</template>
<style scoped>
.hero-logo-steam{position:absolute;inset:0;width:100%;height:100%;z-index:1;pointer-events:none;overflow:hidden}
.steam-rise{opacity:0;transform-box:fill-box;transform-origin:center bottom;animation:hero-steam-rise var(--steam-duration) var(--steam-delay) linear infinite}
.steam-sway{animation:hero-steam-sway 3.7s var(--steam-delay) ease-in-out infinite alternate;transform-box:fill-box;transform-origin:center bottom}
.steam-soft,.steam-vapor{fill:none;stroke:url(#hero-steam-ink);stroke-linecap:round;stroke-linejoin:round}
.steam-soft{stroke-width:44;opacity:.35;filter:blur(8px)}
.steam-vapor{stroke-width:23;opacity:.64;filter:blur(4px)}
.steam-bloom{fill:#fff9ed;opacity:0;filter:blur(5px);transform-origin:var(--bloom-x) 62px;animation:hero-steam-bloom var(--steam-duration) var(--steam-delay) ease-out infinite}
@keyframes hero-steam-rise{0%{opacity:0;transform:translate(-3px,24px) scale(.65,.78)}18%{opacity:.8;transform:translate(0,10px) scale(.84,.94)}48%{opacity:.72;transform:translate(8px,-13px) scale(1.12,1.04)}75%{opacity:.36;transform:translate(-4px,-35px) scale(1.4,1.1)}100%{opacity:0;transform:translate(10px,-60px) scale(1.7,1.18)}}
@keyframes hero-steam-bloom{0%,15%{opacity:0;transform:translate(0,14px) scale(.5)}42%{opacity:.28;transform:translate(-7px,-1px) scale(.9)}75%{opacity:.18;transform:translate(8px,-14px) scale(1.35)}100%{opacity:0;transform:translate(15px,-26px) scale(1.7)}}
@keyframes hero-steam-sway{from{transform:translateX(-9px) skewX(-6deg)}to{transform:translateX(11px) skewX(7deg)}}
.steam-paused .steam-rise,.steam-paused .steam-sway,.steam-paused .steam-bloom{animation-play-state:paused}
@media(prefers-reduced-motion:reduce){.hero-logo-steam{display:none}.steam-rise,.steam-sway,.steam-bloom{animation:none}}
</style>
