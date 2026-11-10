<script setup>
import {ref,computed,watchEffect,nextTick} from 'vue'
import {asset} from '../../data/foods.js'
import {insideEllipse,useOperationCleanup} from '../../composables/cookingInteraction.js'
const emit=defineEmits(['state'])
const step=ref(0),selected=ref(''),error=ref(''),doughPlaced=ref(false),rolled=ref(0),filled=ref(false),folds=ref(0)
const rolling=ref(false),dragging=ref(false),bunSelected=ref(false),steam=ref('board')
const rollTip=ref({x:50,y:50}),offset=ref({x:0,y:0}),drop=ref(null),workspace=ref(null)
const pinches=[
 {label:'捏起一边', position:{left:'27%',top:'45%'}},
 {label:'收拢另一边', position:{left:'69%',top:'47%'}},
 {label:'捏紧收口', position:{left:'54%',top:'26%'}},
]
const currentPinch=computed(()=>pinches[folds.value])
const ready=computed(()=>step.value===0?rolled.value>=1:step.value===1?folds.value===pinches.length:steam.value==='opened')
const bunArt=computed(()=>['','pleat-half','pleat-late','raw'][folds.value])
const dialogue=computed(()=>{
 if(error.value)return error.value
 if(ready.value)return step.value===0?'面皮摊圆啦！点击“下一步”，咱们包馅。':step.value===1?'收好口啦！点击“下一步”，送它进蒸笼吧。':'揭开啦，香香的！点击“出笼啦”。'
 if(step.value===0){
  if(!doughPlaced.value)return '点一下面团，把它放到案板上。'
  return selected.value==='擀面杖'?'在面团上按住来回拖动，把面皮摊圆。':'点击擀面杖，咱们把面皮擀开。'
 }
 if(step.value===1)return filled.value?`点击小圈，${currentPinch.value.label}。`:'点击馅料碗，给面皮添个鲜香的肚子。'
 return {board:bunSelected.value?'选好啦，用键盘聚焦蒸笼落点，按 Enter 放进去。':'按住包子拖进蒸笼的小圈，松开放好。','in-basket':'放稳啦！点击旁边的笼盖，把它盖好。',steaming:'热气上来啦，稍等一小会儿；也可以点击“跳过蒸制演示”。',paused:'热气演示先停一停，点击笼盖就能重新开始。','ready-open':'热气香香的，点击笼盖，揭开看看！'}[steam.value]
})
const help=computed(()=>[
 '先点击面团，再选择擀面杖。在面团上按住来回拖动，松开或移出区域会停下。键盘用 Tab 聚焦“擀皮操作区”，按方向键来回推擀。',
 '点击馅料碗后，依次捏起一边、收拢另一边、捏紧收口。键盘用 Tab 聚焦当前小圈，按 Enter 或空格，焦点会转到下一处。',
 '按住包子拖到蒸笼内虚线圈，松开放入。拖错位置会回到案板。键盘先聚焦包子按 Enter 或空格选择，再 Tab 到蒸笼落点按 Enter 或空格确认。放好后点击笼盖开始演示，可点击跳过；准备好后再次点击笼盖揭开。失焦或离页会停止操作。'
][step.value])
watchEffect(()=>emit('state',{
 step:step.value,ready:ready.value,selected:selected.value,busy:false,dialogue:dialogue.value,
 phase:ready.value?'已完成':rolling.value||dragging.value||steam.value==='steaming'?'操作中':selected.value||step.value===2?'待操作':'待选择',
 summary:step.value===0?rolled.value>=1?'面皮已擀好':rolled.value>0?'面皮正在摊开 · 继续来回推擀':doughPlaced.value?'面团待擀':'等待放面团':step.value===1?filled.value?`捏合 ${folds.value}/${pinches.length}`:'等待加馅':{board:'等待入笼','in-basket':'等待盖盖',steaming:'简化蒸制演示',paused:'蒸制演示已暂停','ready-open':'等待揭盖',opened:'已揭盖 · 可以出笼'}[steam.value],help:help.value
}))
function choose(name){
 if(ready.value)return
 if(step.value===0){
  if(!doughPlaced.value){
   if(name!=='面团'){error.value='先点一下面团，把它放到案板上。';return}
   doughPlaced.value=true;selected.value=name;error.value='';return
  }
  if(name==='面团'){error.value='';return}
  if(name!=='擀面杖'){error.value='这个先歇会儿，咱们先用擀面杖。';return}
  selected.value=name;error.value=''
 }else if(step.value===1){
  if(name!=='馅料碗'){error.value='这步点击馅料碗，给面皮添点鲜香。';return}
  if(filled.value){error.value='馅儿已经够啦，沿着小圈接着捏就好。';return}
  selected.value=name;filled.value=true;error.value=''
 }else error.value='工具先歇会儿，照着眼下这一步操作就好。'
}
function advance(){if(!ready.value)return;cancelPointer();step.value++;selected.value='';error.value=''}
let capture=null,previous=null,origin=null,timer=0
function local(e){const r=e.currentTarget.getBoundingClientRect();return {x:(e.clientX-r.x)/r.width,y:(e.clientY-r.y)/r.height}}
function valid(p){return insideEllipse(p.x,p.y,.5,.5,.18+rolled.value*.22,.24+rolled.value*.1)}
function capturePointer(e){capture={node:e.currentTarget,id:e.pointerId};capture.node.setPointerCapture(e.pointerId)}
function cancelPointer(){
 const held=capture;capture=null;previous=null;origin=null
 rolling.value=false;dragging.value=false;offset.value={x:0,y:0}
 if(held?.node.hasPointerCapture(held.id))held.node.releasePointerCapture(held.id)
}
function addRoll(distance){if(ready.value)return;rolled.value=Math.min(1,rolled.value+distance/2.8);error.value=''}
function rollStart(e){
 if(capture||e.button!==0||selected.value!=='擀面杖'||ready.value)return
 const p=local(e);if(!valid(p))return
 e.preventDefault();capturePointer(e);previous=p;rolling.value=true
 rollTip.value={x:p.x*100,y:p.y*100}
}
function rollMove(e){
 if(!rolling.value||e.pointerId!==capture?.id)return
 const p=local(e)
 if(!(e.buttons&1)){cancelPointer();return}
 if(!valid(p)){cancelPointer();error.value='拖出面团啦，再按住面团接着擀。';return}
 const distance=Math.hypot(p.x-previous.x,p.y-previous.y)
 if(distance>.002){addRoll(Math.min(distance,.12));rollTip.value={x:p.x*100,y:p.y*100}}
 previous=p
 if(ready.value)cancelPointer()
}
function rollKey(e){
 if(!['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(e.key))return
 e.preventDefault()
 if(selected.value!=='擀面杖'||ready.value)return
 addRoll(.12)
 rollTip.value={x:['ArrowLeft','ArrowUp'].includes(e.key)?35:65,y:50}
}
async function pinch(i){
 if(!filled.value||step.value!==1||i!==folds.value||ready.value)return
 folds.value++;error.value=''
 await nextTick()
 // 当前按钮消失后，把键盘焦点交给下一处捏合点。
 if(document.activeElement===document.body)workspace.value?.querySelector('[aria-current="step"]')?.focus()
}
function bunStart(e){
 if(capture||e.button!==0||steam.value!=='board')return
 e.preventDefault();capturePointer(e);origin={x:e.clientX,y:e.clientY};dragging.value=true;bunSelected.value=false;error.value=''
}
function bunMove(e){
 if(!dragging.value||e.pointerId!==capture?.id)return
 if(!(e.buttons&1)){cancelPointer();return}
 const r=workspace.value.getBoundingClientRect()
 if(e.clientX<r.x||e.clientX>r.right||e.clientY<r.y||e.clientY>r.bottom){cancelPointer();error.value='包子还在案板上，重新按住拖进蒸笼就好。';return}
 offset.value={x:e.clientX-origin.x,y:e.clientY-origin.y}
}
function bunEnd(e){
 if(!dragging.value||e.pointerId!==capture?.id)return
 const r=drop.value.getBoundingClientRect(),p={x:(e.clientX-r.x)/r.width,y:(e.clientY-r.y)/r.height}
 const landed=Math.hypot(e.clientX-origin.x,e.clientY-origin.y)>10&&insideEllipse(p.x,p.y,.5,.48,.42,.35)
 cancelPointer()
 if(landed){steam.value='in-basket';error.value=''}
 else error.value='还没到笼里呢，包子回案板啦。按住拖到蒸笼的小圈里试试。'
}
function selectBun(e){if(e.detail===0&&steam.value==='board'){bunSelected.value=true;error.value=''}}
function keyboardPlace(e){
 if(e.detail!==0||!bunSelected.value){error.value='用鼠标时，把包子按住拖到这个小圈里再松开。';return}
 if(steam.value==='board'){steam.value='in-basket';bunSelected.value=false;error.value=''}
}
function finishSteam(){if(steam.value!=='steaming')return;clearTimeout(timer);steam.value='ready-open';error.value=''}
function lid(){
 if(['in-basket','paused'].includes(steam.value)){
  steam.value='steaming';error.value='';clearTimeout(timer)
  timer=setTimeout(finishSteam,window.matchMedia('(prefers-reduced-motion: reduce)').matches?350:1800)
 }else if(steam.value==='ready-open'){steam.value='opened';error.value=''}
}
function stop(){
 cancelPointer();bunSelected.value=false;clearTimeout(timer)
 if(steam.value==='steaming'){steam.value='paused';error.value='热气演示先停一停，再点击笼盖就能接着看。'}
}
useOperationCleanup(stop)
defineExpose({choose,advance})
</script>
<template>
<div ref="workspace" class="bun-workspace" :class="{'bun-is-dragging':dragging}">
 <div v-if="step===0" class="bun-board-area" role="group" :tabindex="selected==='擀面杖'&&!ready?0:-1" aria-label="擀皮操作区" :class="{'bun-active-area':selected==='擀面杖'&&!ready}" @pointerdown="rollStart" @pointermove="rollMove" @pointerup="cancelPointer" @pointercancel="cancelPointer" @lostpointercapture="cancelPointer" @keydown="rollKey">
  <template v-if="doughPlaced">
   <img class="bun-dough" :src="asset('cook-bun-dough.webp')" alt="正在擀开的面团" draggable="false" :style="{width:(45+rolled*20)+'%',opacity:Math.max(0,1-rolled*2)}">
   <img class="bun-wrapper" :src="asset('cook-bun-wrapper.webp')" alt="中间稍厚、边缘薄的面皮" draggable="false" :style="{width:(45+rolled*45)+'%',opacity:Math.min(1,rolled*2)}">
   <img v-if="selected==='擀面杖'" class="bun-rolling-pin" :src="asset('cook-bun-rolling.webp')" alt="随操作移动的擀面杖" draggable="false" :style="{left:rollTip.x+'%',top:rollTip.y+'%'}">
  </template>
 </div>
 <div v-else-if="step===1" class="bun-board-area bun-pleat-area">
  <template v-if="folds===0"><img class="bun-wrapper" :src="asset('cook-bun-wrapper.webp')" alt="等待捏合的面皮" draggable="false"><img v-if="filled" class="bun-filling-portion" :src="asset('cook-bun-filling.webp')" alt="已加一份肉馅与皮冻" draggable="false"></template>
  <img v-else class="bun-forming" :key="bunArt" :src="asset('cook-bun-'+bunArt+'.webp')" :alt="ready?'已收口的生小笼包':'正在逐步收口的小笼包'" draggable="false" :style="{width:(90-folds*6)+'%'}">
  <div v-if="filled&&currentPinch" class="bun-pinch-points">
   <button :key="folds" :value="folds" :style="currentPinch.position" aria-current="step" :aria-label="currentPinch.label" @click="pinch(Number($event.currentTarget.value))"></button>
  </div>
 </div>
 <button v-if="step===2&&steam==='board'" class="bun-to-steamer" :class="{'bun-picked':bunSelected}" aria-label="按住拖动小笼包入笼，键盘按Enter选择" :aria-pressed="bunSelected" :style="{translate:offset.x+'px '+offset.y+'px'}" @pointerdown="bunStart" @pointermove="bunMove" @pointerup="bunEnd" @pointercancel="cancelPointer" @lostpointercapture="cancelPointer" @click="selectBun"><img :src="asset('cook-bun-raw.webp')" alt="" draggable="false"></button>
 <div class="bun-steamer-area" :class="{'bun-steaming':steam==='steaming','bun-lid-closed':['steaming','paused','ready-open'].includes(steam)}">
  <img class="bun-steamer-base" :src="asset('cook-bun-steamer.webp')" alt="空竹蒸笼" draggable="false">
  <button v-if="step===2&&steam==='board'" ref="drop" class="bun-drop-zone" aria-label="蒸笼落点，确认放入小笼包" @click="keyboardPlace"><span>放这里</span></button>
  <img v-if="step===2&&steam!=='board'" class="bun-in-basket" :src="asset(steam==='opened'?'cook-bun-cooked.webp':'cook-bun-raw.webp')" :alt="steam==='opened'?'揭盖后的小笼包':'已经放入蒸笼的生包子'" draggable="false">
  <img class="bun-steamer-front" :src="asset('cook-bun-steamer.webp')" alt="" aria-hidden="true" draggable="false">
  <button class="bun-lid" :class="{'bun-lid-side':!['steaming','paused','ready-open'].includes(steam)}" :aria-label="steam==='ready-open'?'揭开笼盖':steam==='paused'?'点击笼盖重新开始蒸制':'盖上笼盖'" :disabled="step!==2||!['in-basket','paused','ready-open'].includes(steam)" @click="lid"><img :src="asset('cook-bun-lid.webp')" alt="" draggable="false"></button>
  <div v-if="steam==='steaming'" class="bun-steam" aria-hidden="true"><i></i><i></i><i></i></div>
 </div>
 <button v-if="steam==='steaming'" class="bun-skip text-link" @click="finishSteam">跳过蒸制演示</button>
 <span class="equipment-caption bun-board-caption">{{step===0?'擀皮面案':step===1?'包馅面案':'入笼 · 蒸制演示'}}</span>
</div>
</template>
<style scoped>
.bun-workspace{position:absolute;inset:0;pointer-events:none}.bun-board-area{position:absolute;left:9%;top:55%;width:43%;height:34%;pointer-events:auto;touch-action:none;outline-offset:1px;border-radius:45%;cursor:grab}.bun-active-area{outline:2px dashed #fff0cd}.bun-board-area:focus-visible{outline:3px dashed #953329}.bun-board-area img{position:absolute;left:50%;top:50%;translate:-50% -50%;object-fit:contain;pointer-events:none;max-height:100%}.bun-dough{height:100%}.bun-wrapper{width:90%;height:100%;transition:width .12s linear}.bun-board-area .bun-rolling-pin{width:64%;height:48%;z-index:3;filter:drop-shadow(0 3px 2px #54382033)}.bun-filling-portion{width:38%;height:45%;z-index:1}.bun-forming{height:100%;transition:width .2s ease}
.bun-pinch-points{position:absolute;inset:0;z-index:4;pointer-events:none}
.bun-pinch-points button{position:absolute;translate:-50% -50%;display:grid;place-items:center;width:44px;height:44px;padding:0;border:0;border-radius:50%;background:transparent;pointer-events:auto}
.bun-pinch-points button::before{content:"";width:23px;height:23px;border:2px dashed #7f4932;border-radius:50%;background:#fff1d8b3;box-shadow:0 0 0 1px #fff6d8}
.bun-pinch-points button:hover::before,.bun-pinch-points button:focus-visible::before{background:#fff6db;outline:2px solid #953329;outline-offset:2px}
.bun-steamer-area{position:absolute;left:54%;top:57%;width:23%;height:34%;pointer-events:none}.bun-steamer-base,.bun-steamer-front{position:absolute;inset:0;width:100%;height:100%;object-fit:contain}.bun-steamer-front{clip-path:inset(65% 0 0);z-index:3}.bun-in-basket{position:absolute;left:30%;top:26%;width:42%;height:43%;object-fit:contain;z-index:2}.bun-drop-zone{position:absolute;left:27%;top:24%;width:48%;height:43%;border:2px dashed #75472b;border-radius:50%;background:#fff3cf66;pointer-events:auto;z-index:4;font:16px var(--serif);color:#653d23}.bun-drop-zone:hover,.bun-drop-zone:focus-visible{outline:3px dashed #953329;outline-offset:3px;background:#fff3cfa6}.bun-to-steamer{position:absolute;left:24%;top:60%;width:17%;height:27%;background:transparent;touch-action:none;pointer-events:auto;cursor:grab;padding:0;z-index:4;border:2px dashed #eee1bd;border-radius:35%}.bun-to-steamer img{width:100%;height:100%;object-fit:contain;pointer-events:none}.bun-to-steamer:focus-visible,.bun-picked{outline:3px dashed #953329;outline-offset:3px}.bun-is-dragging .bun-to-steamer{z-index:8;cursor:grabbing}.bun-lid{position:absolute;inset:-10% -3% 24%;z-index:5;pointer-events:auto;padding:0;background:transparent;border-radius:40%;min-width:44px;min-height:44px;transition:translate .3s ease}.bun-lid img{width:100%;height:100%;object-fit:contain;pointer-events:none}.bun-lid-side{translate:-20% -53%;scale:.62;rotate:-12deg}.bun-lid:disabled{opacity:1;cursor:default}.bun-lid:enabled{outline:2px dashed #fff2d2}.bun-lid:enabled:focus-visible,.bun-lid:enabled:hover{outline:3px dashed #953329;outline-offset:3px}.bun-steam{position:absolute;inset:-25% 15% 50%;z-index:6;pointer-events:none}.bun-steam i{position:absolute;bottom:0;left:15%;height:100%;width:15%;background:linear-gradient(transparent,#fff7e2c9);border-radius:50%;filter:blur(6px);animation:bun-vapor 1.2s ease-in-out infinite}.bun-steam i:nth-child(2){left:45%;animation-delay:.3s}.bun-steam i:nth-child(3){left:70%;animation-delay:.6s}.bun-skip{position:absolute;left:55%;top:91%;background:#fff1d5;pointer-events:auto;min-height:44px;padding:6px 10px;z-index:7}.bun-board-caption{left:13%;bottom:2%}@keyframes bun-vapor{from{opacity:.2;translate:0 10%}to{opacity:.9;translate:0 -20%}}@media(prefers-reduced-motion:reduce){.bun-workspace *{animation:none!important;transition:none!important}}
</style>
