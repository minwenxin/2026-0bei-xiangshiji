<script setup>
import {onBeforeUnmount} from 'vue'
import {asset} from '../data/foods.js'
defineProps({memento:Object})
const emit=defineEmits(['done'])
const timer=setTimeout(()=>emit('done'),4600)
onBeforeUnmount(()=>clearTimeout(timer))
</script>
<template><aside class="memento-arrival" role="status" aria-live="polite">
 <div class="arrival-scene" aria-hidden="true"><div class="arrival-journal"><i class="journal-ribbon"></i><span class="journal-title">时光手记</span><svg class="journal-sprig" viewBox="0 0 40 46"><path d="M14 41Q29 26 24 6M20 31Q7 30 10 19Q23 19 20 31M24 21Q35 20 33 10Q22 11 24 21M25 12Q15 9 19 2Q28 5 25 12" fill="none" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/></svg><i class="journal-corner"></i></div><img :src="asset(memento.image)" alt=""></div>
 <p>已收入时光手记</p><small>{{memento.name}}</small>
</aside></template>
<style scoped>
.memento-arrival{position:fixed;z-index:30;right:28px;bottom:28px;width:240px;padding:10px 18px 18px;background:#fff6e7;border:1px solid #c5a77d;box-shadow:3px 9px 24px #553a292e;border-radius:3px;pointer-events:none;text-align:center;animation:arrival-panel .35s both,arrival-dismiss .65s 3.9s forwards}
.arrival-scene{height:160px;position:relative;perspective:600px}.arrival-journal{position:absolute;left:58px;bottom:5px;width:100px;height:122px;border:1px solid #4b5b45;border-radius:3px 8px 8px 3px;transform:rotate(7deg);background:repeating-linear-gradient(0deg,#f9eac007 0 1px,transparent 1px 3px),repeating-linear-gradient(90deg,#1d351809 0 1px,transparent 1px 3px),#75816a;box-shadow:inset 5px 0 5px #35482a40,inset -2px 0 3px #e2e3c12e,3px 2px 0 #ece1c4,5px 4px 0 #c8b796,6px 8px 9px #593e292b;animation:journal-settle 2s both}
.arrival-journal:before{content:'';position:absolute;inset:6px 5px 7px 11px;border:1px solid #c9c69788;border-radius:1px 4px 4px 1px;pointer-events:none}.arrival-journal:after{content:'';position:absolute;left:5px;top:0;bottom:0;width:3px;border-left:1px solid #a4ac8f70;border-right:1px solid #3f533d70}.journal-title{position:absolute;inset:16px 9px auto 16px;background:#f5e6c9;color:#5c452d;border:1px solid #d0b995;padding:6px 0;font:14px var(--serif);box-shadow:1px 2px 3px #33462b25;transform:rotate(-2deg)}.journal-ribbon{position:absolute;top:-6px;right:15px;width:9px;height:17px;background:#9e5140;clip-path:polygon(0 0,100% 0,100% 100%,50% 75%,0 100%)}.journal-sprig{position:absolute;left:37px;top:56px;width:30px;height:36px;color:#d8d5ad}.journal-corner{position:absolute;right:3px;bottom:3px;width:12px;height:12px;border-right:2px solid #b9a36e;border-bottom:2px solid #b9a36e;border-radius:0 0 4px 0}
.arrival-scene img{position:absolute;width:115px;height:115px;object-fit:contain;left:43px;top:0;filter:drop-shadow(2px 5px 3px #65452925);animation:sticker-arrival 2s cubic-bezier(.25,.65,.3,1) both}.memento-arrival p{font:21px var(--serif);color:#744731;margin:3px 0 5px}.memento-arrival small{color:#52634c;font-size:14px}
@keyframes arrival-panel{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:none}}
@keyframes arrival-dismiss{from{opacity:1;transform:translateY(0)}to{opacity:0;transform:translateY(8px)}}
@keyframes sticker-arrival{0%{opacity:0;transform:translateY(18px) rotate(-9deg) scale(.8)}25%{opacity:1;transform:translateY(-9px) rotate(-6deg) scale(1)}48%{opacity:1;transform:translateY(-15px) rotate(-3deg) scale(1)}85%,100%{opacity:1;transform:translate(18px,70px) rotate(7deg) scale(.38)}}
@keyframes journal-settle{0%,70%{transform:rotate(7deg)}85%{transform:translateY(3px) rotate(10deg)}100%{transform:rotate(7deg)}}
@media(max-width:520px){.memento-arrival{right:12px;bottom:16px;width:210px;padding:8px 12px 14px}.arrival-scene{height:150px}.arrival-journal{left:48px}.arrival-scene img{left:33px}}
@keyframes arrival-dismiss-still{from{opacity:1}to{opacity:0}}
@media(prefers-reduced-motion:reduce){.arrival-journal,.arrival-scene img{animation:none}.memento-arrival{animation:arrival-dismiss-still .65s 3.9s forwards}.arrival-scene img{transform:translate(18px,70px) rotate(7deg) scale(.38)}}
</style>
