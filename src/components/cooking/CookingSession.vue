<script setup>
import { ref, computed, onBeforeUnmount } from 'vue'
import { getStory } from '../../data/stories.js'
import { getFood } from '../../data/foods.js'
import { session, completeRecipe } from '../../stores/session.js'
import {consumeDialogueEntry} from '../../domain/dialogue-entry.js'
import KitchenScene from './KitchenScene.vue'
import NoodleGame from './NoodleGame.vue'
import ZongziGame from './ZongziGame.vue'
import XiaolongbaoGame from './XiaolongbaoGame.vue'
const games={noodles:NoodleGame,zongzi:ZongziGame,xiaolongbao:XiaolongbaoGame}
const props=defineProps({recipe:Object})
const food=computed(()=>getFood(props.recipe.foodId))
const guide=computed(()=>getStory(food.value.storyId))
const game=ref(null), state=ref({step:0,ready:false,dialogue:'',phase:'待选择',summary:'',help:'',selected:''}), finished=ref(false), epoch=ref(0), saving=ref(false), saveError=ref('')
let alive=true
onBeforeUnmount(()=>{alive=false})
const entryIntro=ref(props.recipe.id==='sesame-noodles'&&consumeDialogueEntry())
const sceneState=computed(()=>entryIntro.value&&!state.value.selected&&state.value.step===0?{...state.value,dialogue:'来，咱们亲手拌一碗，把这口熟悉的味道找回来！'}:finished.value?{...state.value,dialogue:props.recipe.completion,busy:false}:saveError.value?{...state.value,dialogue:'这次没记住，别急，'+saveError.value+' 点击出餐按钮可以再试一次。',busy:saving.value||state.value.busy}:{...state.value,busy:saving.value||state.value.busy})
async function next(){
  if(!state.value.ready||saving.value||finished.value)return
  if(state.value.step<props.recipe.steps.length-1){game.value.advance();return}
  saving.value=true;saveError.value=''
  const saved=await completeRecipe(props.recipe.id)
  if(!alive)return
  saving.value=false
  if(saved)finished.value=true
  else saveError.value=session.storageError||'保存失败，请重试。'
}
function choose(name){entryIntro.value=false;if(!saving.value&&!finished.value){saveError.value='';game.value?.choose(name)}}
function restart(){entryIntro.value=false;if(saving.value)return;finished.value=false;saveError.value='';epoch.value++;state.value={step:0,ready:false,dialogue:'',phase:'待选择',summary:'',help:'',selected:''}}
</script>
<template>
<section class="page cook-page interactive-kitchen workstation-page">
  <div class="scene-top"><RouterLink class="back" :to="'/food/'+food.id">← 回到{{food.name}}</RouterLink><span>巷口小厨房 · 精选制作体验</span></div>
  <div class="station-steps-row"><section class="station-steps-board paper-panel" aria-label="做菜步骤">
    <div class="step-board-title"><h1>{{finished?recipe.completionTitle:recipe.steps[state.step]?.title}}</h1><span>{{food.name}} · {{finished?'制作已完成':`第 ${state.step+1} 步 / 共 ${recipe.steps.length} 步`}}</span></div>
    <ol class="cook-steps"><li v-for="(item,index) in recipe.steps" :key="item.title" :class="{done:finished||index<state.step,current:!finished&&index===state.step}" :aria-current="!finished&&index===state.step?'step':undefined"><span>{{finished||index<state.step?'✓':index+1}}</span>{{item.title}}</li></ol>
  </section></div>
  <p class="station-pan-note">操作台可左右滑动查看。</p>
  <KitchenScene :recipe="recipe" :guide-portrait="guide?.portrait || 'food-companion.webp'" :guide-name="guide?.character || '寻味伙伴'" :state="sceneState" :finished="finished" :serving-image="food.image" :serving-filter="food.photoCredit?.displayFilter" @choose="choose">
    <component :is="games[recipe.kind]" v-if="!finished" :key="epoch" ref="game" @state="state=$event"/>
  </KitchenScene>
  <section class="cook-controls paper-panel" aria-label="制作进度与操作">
    <div v-if="!finished" class="station-task-row"><div class="cooking-action"><p class="cook-phase">{{state.phase}} · {{state.summary}}</p><details class="cook-help" :key="state.step"><summary>操作帮助</summary><p>{{state.help}}</p></details></div><button class="button cook-next" aria-describedby="cook-dialogue" :disabled="!state.ready||saving" @click="next">{{saving?'正在保存…':state.step===recipe.steps.length-1?recipe.serveLabel:'下一步 →'}}</button></div>
    <div v-else class="actions"><RouterLink class="button" :to="'/food/'+food.id">{{recipe.returnLabel||'回到风味手记'}} →</RouterLink><button id="retry" class="text-link" @click="restart">{{recipe.retryLabel}}</button></div>
  </section>
  <p class="local-note">{{recipe.experienceNote||'轻量游戏化制作演示，不是完整食谱；熟面回温与煮制时长不代表真实烹饪时间。'}}制作完成不解锁故事。</p>
</section>
</template>
