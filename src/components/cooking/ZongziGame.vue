<script setup>
import {ref,computed,watchEffect,onBeforeUnmount} from 'vue'
import {asset} from '../../data/foods.js'
import {useOperationCleanup} from '../../composables/cookingInteraction.js'
import ThreadPath from './ThreadPath.vue'
const emit=defineEmits(['state'])
const step=ref(0),selected=ref(''),folds=ref(0),fill=ref(0),closed=ref(0),knots=ref(0),boiling=ref(false),threading=ref(false),cooked=ref(false),error=ref('')
const expected=computed(()=>step.value===0?'粽叶':step.value===1?['糯米','肉馅','糯米'][Math.min(fill.value,2)]:closed.value<2?'粽叶':knots.value<5?'棉线':'桌上的锅')
const ready=computed(()=>step.value===0?folds.value===3:step.value===1?fill.value===3:cooked.value)
const dialogue=computed(()=>{
 if(error.value)return error.value
 if(ready.value)return step.value===2?'叶香来啦！点击“端出这只粽子”，慢慢尝。':'这一步稳稳当当！点击“下一步”，咱们接着包。'
 if(step.value===0)return selected.value?`点击粽叶上的第${folds.value+1}个折叠点，把叶子折成小漏斗。`:'先点击粽叶，咱们折个小漏斗！'
 if(step.value===1)return ['点击糯米，先铺一层米。','点击肉馅，给中间添点咸香。','再点击一次糯米，把肉馅轻轻盖好。'][fill.value]
 if(boiling.value)return '入锅啦，借这一阵热气，看看煮制的简化过程。'
 if(closed.value<2)return selected.value==='粽叶'?`点击第${closed.value+1}处包合点，把馅儿裹住。`:'点击粽叶，再把两边包合起来。'
 if(knots.value<5)return selected.value==='棉线'?'按住路径起点，沿虚线拖动棉线；中途松开也能接着扎。':'点击棉线，咱们把粽子扎牢。'
 return '扎牢啦！点击桌上的锅，让粽子下锅慢慢煮。'
})
watchEffect(()=>emit('state',{step:step.value,ready:ready.value,selected:selected.value,busy:boiling.value,dialogue:dialogue.value,phase:ready.value?'已完成':boiling.value||threading.value?'操作中':selected.value?'待操作':'待选择',summary:step.value===0?`折叶 ${folds.value}/3`:step.value===1?`装馅 ${fill.value}/3`:boiling.value?'简化煮制中':cooked.value?'包扎、煮制完成':`包合 ${closed.value}/2 · 包扎 ${knots.value}/5`,help:step.value===0?'先点击粽叶，再按编号依次点击三个折叠点；键盘可 Tab 聚焦当前点并按 Enter 或空格。':step.value===1?'依次点击糯米、肉馅，再点击同一个糯米格覆盖。已经放好的一层不会重复加入。键盘用 Tab、Enter 或空格选择。':'点击粽叶后，依次点击两处包合点；选择棉线，在路径起点按住左键，沿虚线拖动至各编号点。中途松开保留已经过的点，重新从最后完成的点接着拖。键盘可用 Tab 到当前编号点，按 Enter 或空格依次绕线。完成后直接点击桌上的锅，自动入锅煮制。失焦会暂停煮制，需重新点击锅；本演示不代表真实煮熟时长。'}))
function choose(name){
 if(boiling.value||ready.value)return
 if(step.value===1 && fill.value>0 && name===['糯米','肉馅','糯米'][fill.value-1]){error.value='这一层已经放好啦，接着添下一层就行。';return}
 if(name!==expected.value){error.value=`这个先歇会儿，咱们现在用${expected.value}。`;return}
 selected.value=name;error.value=''
 if(step.value===1)fill.value++
}
function fold(i){if(step.value===0&&selected.value==='粽叶'&&i===folds.value){error.value='';folds.value++}}
function close(i){if(step.value===2&&selected.value==='粽叶'&&i===closed.value){error.value='';closed.value++}}
let timer=0
function boil(){if(step.value!==2||boiling.value||cooked.value||knots.value<5)return;error.value='';boiling.value=true;timer=window.setTimeout(()=>{boiling.value=false;cooked.value=true},1800)}
function cancel(){if(boiling.value){clearTimeout(timer);boiling.value=false;error.value='火候演示先停一停，再点击桌上的锅就能重新开始。'}}
function advance(){if(!ready.value)return;step.value++;selected.value='';error.value=''}
useOperationCleanup(cancel);onBeforeUnmount(()=>clearTimeout(timer))
defineExpose({choose,advance})
</script>
<template>
<div class="zongzi-workspace" :class="{'is-boiling':boiling,'is-cooked':cooked}" aria-label="粽子制作案板">
 <template v-if="step===0 && folds<3">
  <img v-if="selected==='粽叶'" class="folding-leaf leaf-left" :class="'leaf-fold-'+folds" :src="asset('cook-leaf.webp')" alt="正在折叠的粽叶" draggable="false">
  <img v-if="folds>0" class="folding-leaf leaf-right" :class="'leaf-fold-'+folds" :src="asset('cook-leaf.webp')" alt="" draggable="false">
  <div v-if="selected==='粽叶'" class="leaf-fold-points"><button v-for="(p,i) in [[25,65],[65,60],[50,25]]" :key="i" :style="{left:p[0]+'%',top:p[1]+'%'}" :disabled="i!==folds" :aria-label="'折叶第'+(i+1)+'处'" @click="fold(i)">{{i<folds?'✓':i+1}}</button></div>
 </template>
 <template v-else-if="closed<2">
  <img class="leaf-cone" :src="asset('cook-leaf-cone.webp')" alt="折成漏斗的粽叶" draggable="false">
  <div class="leaf-filling" aria-label="装馅状态"><img v-if="fill>0" class="rice-base" :src="asset('cook-rice-bed.webp')" alt="已铺底层糯米" draggable="false"><img v-if="fill>1" class="pork-fill" :src="asset('cook-pork.webp')" alt="已加入肉馅" draggable="false"><img v-if="fill>2" class="rice-cover" :src="asset('cook-rice.webp')" alt="已覆盖上层糯米" draggable="false"></div>
  <img class="leaf-cone-front" :src="asset('cook-leaf-cone.webp')" alt="" aria-hidden="true" draggable="false">
  <img v-if="closed>0" class="closing-flap" :src="asset('cook-leaf.webp')" alt="已折合一侧粽叶" draggable="false">
  <div v-if="step===2&&selected==='粽叶'" class="leaf-fold-points"><button v-for="(p,i) in [[24,40],[70,45]]" :key="i" :style="{left:p[0]+'%',top:p[1]+'%'}" :disabled="i!==closed" :aria-label="'包合第'+(i+1)+'处'" @click="close(i)">{{i<closed?'✓':i+1}}</button></div>
 </template>
 <template v-else>
  <img class="closed-parcel" :src="asset(knots===5?'cook-tied-zongzi.webp':'cook-leaf-parcel.webp')" :alt="cooked?'经过简化煮制的粽子':'已包合的粽子'" draggable="false">
  <ThreadPath v-show="!boiling&&!cooked&&knots<5" :points="[[32,43],[65,36],[73,49],[30,57],[44,50]]" :enabled="selected==='棉线'&&knots<5" @active="threading=$event" @progress="knots=$event;error=''" @cancel="error='棉线先停在这儿，从最后一个点接着拖就好。'"/>
 </template>
</div>
<div class="zongzi-pot-area" :class="{boiling,cooked}"><button class="zongzi-pot-action" aria-label="点击桌上的锅煮粽子" :class="{'pot-ready':step===2&&knots===5&&!cooked}" :disabled="step!==2||knots<5||boiling||cooked" @click="boil"><img :src="asset('cook-zongzi-pot.webp')" alt="" draggable="false"></button><img v-if="boiling||cooked" class="pot-parcel" :src="asset('cook-tied-zongzi.webp')" alt="锅中已包扎的粽子" draggable="false"><div v-if="boiling" class="pot-steam" aria-hidden="true"><i></i><i></i><i></i></div></div>
<span class="equipment-caption zongzi-board-caption">{{step===0?'折叶案板':step===1?'装馅案板':'包扎案板'}}</span>
</template>
