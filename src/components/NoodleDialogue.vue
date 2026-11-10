<script setup>
import {computed,ref,watch,onBeforeUnmount} from 'vue'
import MementoArrival from './MementoArrival.vue'
import {useRouter} from 'vue-router'
import {asset} from '../data/foods.js'
import {noodleDialogue as lines} from '../data/noodle-dialogue.js'
import {session,saveDialogue,takeMemento} from '../stores/session.js'
import {enterCookingFromDialogue} from '../domain/dialogue-entry.js'
const props=defineProps({story:Object}),router=useRouter()
const record=computed(()=>session.progress.stories[props.story.id])
const index=ref(record.value?.dialogueVersion===1?record.value.dialogueIndex:0)
const resume=ref(index.value>0),typing=ref(true),revealed=ref(0),busy=ref(false),error=ref(''),retry=ref(null)
const line=computed(()=>lines[index.value]),full=computed(()=>revealed.value>=line.value.text.length)
const ending=computed(()=>index.value===lines.length-1&&full.value&&!resume.value)
const reduced=window.matchMedia('(prefers-reduced-motion: reduce)')
const motion=ref(reduced.matches),background=`url(${new URL(asset('breakfast-stall-dialogue.webp'),document.baseURI).href})`
const celebrating=ref(false)
let rewardTimer=0
let timer=0,alive=true,lastAction=-Infinity
function clear() { clearInterval(timer) }
function play() {
 clear()
 revealed.value=0
 if(resume.value) return
 if(!typing.value||motion.value) { revealed.value=line.value.text.length; return }
 timer=setInterval(()=>{
  revealed.value++
  if(full.value) clear()
 },45)
}
function motionChange(e) { motion.value=e.matches }
reduced.addEventListener('change',motionChange)
watch([index,typing,motion,resume],play,{immediate:true})
onBeforeUnmount(()=>{
 alive=false
 clearTimeout(rewardTimer)
 clear()
 reduced.removeEventListener('change',motionChange)
})
async function persist(target,complete,again) {
 busy.value=true
 error.value=''
 const ok=await saveDialogue(target,complete)
 if(!alive) return false
 busy.value=false
 if(!ok) {
  error.value=session.storageError||'没有保存成功，请重试。'
  retry.value=()=>{lastAction=-Infinity;again()}
 }
 return ok
}
async function advance() {
 if(busy.value||resume.value||performance.now()-lastAction<180) return
 lastAction=performance.now()
 if(!full.value) { clear(); revealed.value=line.value.text.length; return }
 if(index.value===lines.length-1) return
 const target=index.value+1
 if(await persist(target,false,advance)) index.value=target
}
function blank(e) {
 if(!e.target.closest('button,a,input,label')) advance()
}
function key(e) {
 if(e.target===e.currentTarget&&['Enter',' '].includes(e.key)) {
  e.preventDefault()
  if(!e.repeat) advance()
 }
}
async function restart() {
 if(busy.value) return
 if(await persist(0,false,restart)) {
  index.value=0
  resume.value=false
  play()
 }
}
async function finish(action) {
 if(busy.value||!ending.value) return
 clearTimeout(rewardTimer)
 if(!record.value?.collected) {
  if(!(await persist(lines.length-1,true,()=>finish(action)))) return
  busy.value=true
  const ok=await takeMemento(props.story.id,lines.length-1)
  if(!alive) return
  busy.value=false
  if(!ok) { error.value=session.storageError||'没有保存成功，请重试。'; retry.value=()=>finish(action); return }
  celebrating.value=true
 }
 if(action==='cook') { enterCookingFromDialogue(); router.push('/cook/sesame-noodles') }
 else if(action==='back') router.push('/food/noodles')
}
watch(ending,ready=>{
 clearTimeout(rewardTimer)
 if(ready&&!record.value?.collected) rewardTimer=setTimeout(()=>finish('collect'),900)
},{immediate:true})

</script>
<template><section class="page noodle-dialogue"><RouterLink class="back" to="/food/noodles">← 回到热干面</RouterLink><h1>碗边的一段话</h1>
 <div class="dialogue-stage" :style="{'--dialogue-background':background}"><img class="dialogue-ayun" :src="asset(story.portrait)" alt="阿云，制作游戏中的虚构体验向导">
 <section v-if="resume" class="dialogue-box resume-box"><h2>接着上次聊，还是从头来？</h2><p>上次停在第 {{index+1}} 句，已领取的早餐笺会保留。</p><div class="actions"><button class="button" :disabled="busy" @click="resume=false">继续上次</button><button class="text-link" :disabled="busy" @click="restart">从头聊</button></div></section>
 <section v-else class="dialogue-box" tabindex="0" role="group" aria-label="人物对话，按Enter或空格继续" @click="blank" @keydown="key">
  <span class="dialogue-name">{{line.speaker}}</span><div class="dialogue-avatar" :class="{'avatar-me':line.speaker==='我'}" aria-hidden="true"><img v-if="line.speaker==='阿云'" :src="asset('ayun-watercolor-avatar.webp')" alt=""><span v-else>我</span></div>
  <div class="dialogue-copy"><p class="dialogue-line" aria-hidden="true">{{line.text.slice(0,revealed)}}<span v-if="!full" aria-hidden="true">▏</span></p><p class="visually-hidden" role="status" aria-live="polite" aria-atomic="true">{{line.speaker}}：{{line.text}}</p><p v-if="full&&line.stage" class="dialogue-direction">{{line.stage}}</p><small>第 {{index+1}} / 6 句</small></div>
  <button v-if="!ending" class="text-link dialogue-next" :disabled="busy" @keydown="$event.repeat && $event.preventDefault()" @click.stop="advance">继续 ›</button>
  <div v-if="ending" class="dialogue-ending"><button class="button" :disabled="busy" @click.stop="finish('cook')">动手做一碗 →</button><button class="text-link" :disabled="busy" @click.stop="finish('back')">回到热干面</button><span v-if="record.collected" class="collected-note" role="status">早餐笺已收录</span><button class="text-link" :disabled="busy" @click.stop="restart">再聊一遍</button></div>
 </section></div>
 <MementoArrival v-if="celebrating" :memento="story.memento" @done="celebrating=false"/>
 <p v-if="error" class="dialogue-error" role="alert">{{error}} <button :disabled="busy" class="text-link" @click="retry?.()">重试保存</button></p>
 <label class="dialogue-typing"><input v-model="typing" type="checkbox">逐字显示<span v-if="motion">（已按减少动态效果设置直接显示整句）</span></label><p class="story-disclaimer">阿云为虚构体验角色，对话为创作内容，并非自由聊天、采访或历史资料。</p>
</section></template>
<style scoped>
.visually-hidden{position:absolute!important;width:1px!important;height:1px!important;padding:0!important;margin:-1px!important;overflow:hidden!important;clip-path:inset(50%)!important;white-space:nowrap!important;border:0!important}.noodle-dialogue{max-width:1440px;margin:auto;padding:20px 4vw 35px}.dialogue-stage{position:relative;isolation:isolate;min-height:680px;display:flex;align-items:flex-end;padding:350px 0 0}.dialogue-stage:before{content:'';position:absolute;inset:0;z-index:-2;background:linear-gradient(#f8efdf18,#f8efdf38),var(--dialogue-background) center/cover;filter:saturate(.9);border-radius:4px}.dialogue-ayun{position:absolute;z-index:-1;top:10px;left:43%;height:590px;width:39%;object-fit:contain;object-position:center top;pointer-events:none}.dialogue-box{position:relative;width:100%;background:#fff5dfed;border:2px solid #735339;border-radius:4px 9px 3px 7px;box-shadow:3px 7px 18px #543a2526;padding:38px 30px 22px;display:grid;grid-template-columns:112px minmax(0,1fr) auto;gap:24px;align-items:center;cursor:pointer}.dialogue-name{position:absolute;top:-22px;left:148px;padding:3px 25px;background:#e9d7b5;border:1px solid #a48b64;transform:rotate(-2deg);font:25px var(--serif)}.dialogue-avatar{width:112px;height:120px;display:grid;place-items:center;background:transparent;border:0;position:relative}.dialogue-avatar img{display:block;width:100%;height:100%;object-fit:contain}.avatar-me{display:grid;place-items:center;font:42px var(--serif)}.dialogue-line{font:22px/1.9 var(--sans);min-height:85px;max-width:none;overflow-wrap:anywhere}.dialogue-direction{font-size:15px;color:#8b806f;margin:10px 0}.dialogue-copy small{color:#917959}.dialogue-next{font-size:23px;min-height:44px;white-space:nowrap}.dialogue-ending{grid-column:2/-1;display:flex;align-items:center;gap:12px 24px;flex-wrap:wrap}.dialogue-ending button{min-height:44px}.resume-box{display:block;padding:30px}.resume-box h2{font-size:28px}.resume-box .actions{margin-top:20px}.dialogue-typing{display:flex;align-items:center;flex-wrap:wrap;gap:8px;margin-top:18px;font-size:14px}.dialogue-error{max-width:none;color:#953329;margin-top:16px}.story-disclaimer{text-align:left;font-size:13px;margin-top:12px}.collected-note{color:#52634c;font-size:14px}
@media(max-width:800px){.dialogue-stage{min-height:620px;padding-top:320px}.dialogue-ayun{height:450px;width:60%;left:25%}.dialogue-box{grid-template-columns:78px minmax(0,1fr);gap:15px;padding:30px 20px 20px}.dialogue-avatar{width:78px;height:88px}.dialogue-name{left:100px;font-size:23px}.dialogue-line{font-size:20px;min-height:90px}.dialogue-next{grid-column:2;justify-self:end}.dialogue-ending{grid-column:1/-1}.dialogue-ending .button{font-size:17px}.resume-box{display:block}}
@media(prefers-reduced-motion:reduce){.dialogue-box *{transition:none}}
</style>
