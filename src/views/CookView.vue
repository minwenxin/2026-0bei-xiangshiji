<script setup>
import { computed, ref } from 'vue'
import { useRoute } from 'vue-router'
import { getRecipe } from '../data/cooking.js'
import { getFood, asset } from '../data/foods.js'
import { session, completeRecipe } from '../stores/session.js'
import EmptyState from '../components/EmptyState.vue'
import KitchenGlyph from '../components/KitchenGlyph.vue'
const route = useRoute(), recipe = computed(() => getRecipe(route.params.id))
const step = ref(0), selected = ref(false), lift = ref(0), mix = ref(0), garnish = ref([])
const feedback = ref('从食材盒或调味罐里，选出本步要用的东西。')
const food = computed(() => getFood(recipe.value?.foodId)), current = computed(() => recipe.value?.steps[step.value])
const kitchenScene = `url("${new URL(asset('kitchen-stations.webp'), document.baseURI).href}")`
const ingredientArt = `url("${new URL(asset('recipe-noodle-ingredients.webp'), document.baseURI).href}")`
const slots = [
  { label:'碱水面', art:0, prepared:true }, { label:'萝卜丁与葱花', art:2 },
  { label:'葱花', art:3 }, { label:'面粉', glyph:'flour' },
  { label:'漏勺', glyph:'skimmer' }, { label:'筷子', glyph:'chopsticks', prepared:true },
  { label:'粽叶', glyph:'leaf' }, { label:'空食材格', empty:true },
]
const seasonings = ['芝麻酱','酱油','香醋','香油','盐','辣椒油']
const ready = computed(() => selected.value && (step.value === 0 ? lift.value >= 100 : step.value === 1 ? mix.value >= 100 : garnish.value.length === 3))
const progress = computed(() => step.value === 0 ? lift.value : step.value === 1 ? mix.value : garnish.value.length / 3 * 100)
const guideLines = ['先选漏勺，把热面沥一沥。','芝麻酱拌开，香味才均匀。','三处撒匀，再盛出这一碗。']
let pointer = null
function choose(tool) {
  if (!current.value) return
  if (tool !== current.value.correct) { feedback.value = '这个暂时用不上，看看阿云的提示再选一次。'; return }
  selected.value = true
  feedback.value = ['漏勺准备好了，慢慢提起，把面汤沥干。','芝麻酱入碗了，在案板的面碗里来回拖动，拌开酱香。','配料准备好了，分别点面碗上的三处，把香味撒匀。'][step.value]
}
function pickIngredient(item) {
  if (item.prepared) {
    feedback.value = item.label === '碱水面' ? '碱水面已经备好，先选漏勺，把面烫热、沥干。' : '筷子放在手边，选好芝麻酱后，到案板的面碗里拖动拌匀。'
    return
  }
  choose(item.label)
}
function dragStart(event) { if (!selected.value || step.value !== 1) return; pointer = { x:event.clientX, y:event.clientY }; event.currentTarget.setPointerCapture(event.pointerId) }
function dragMove(event) {
  if (!pointer) return
  mix.value = Math.min(100, mix.value + Math.hypot(event.clientX - pointer.x, event.clientY - pointer.y) / 5)
  pointer = { x:event.clientX, y:event.clientY }
}
function sprinkle(index) { if (selected.value && !garnish.value.includes(index)) garnish.value.push(index) }
async function next() {
  if (!ready.value) return
  if (step.value === 2 && !(await completeRecipe(recipe.value.id))) return
  step.value++; selected.value = false; pointer = null
  feedback.value = '从食材盒或调味罐里，选出本步要用的东西。'
}
function restart() { step.value = 0; selected.value = false; lift.value = 0; mix.value = 0; garnish.value = []; feedback.value = '从食材盒或调味罐里，选出本步要用的东西。' }
</script>
<template>
  <section v-if="recipe && food" class="page cook-page interactive-kitchen workstation-page">
    <div class="scene-top"><RouterLink class="back" :to="'/food/' + food.id">← 回到{{ food.name }}</RouterLink><span>巷口小厨房 · 精选制作体验</span></div>
    <div class="station-steps-row">
      <section class="station-steps-board paper-panel" aria-label="做菜步骤">
        <div class="step-board-title"><h1>{{ current?.title || '这一碗，拌好了。' }}</h1><span>{{ food.name }} · {{ current ? `第 ${step + 1} 步 / 共 3 步` : '制作已完成' }}</span></div>
        <ol class="cook-steps"><li v-for="(item,index) in recipe.steps" :key="item.title" :class="{done:index<step,current:index===step}" :aria-current="index===step ? 'step' : undefined"><span>{{ index < step ? '✓' : index + 1 }}</span>{{ item.title }}</li></ol>
        <template v-if="current">
          <p id="cook-feedback" class="status" role="status">{{ ready ? current.result : feedback }}</p>
          <div class="station-task-row"><div class="cooking-action">
            <label v-if="step === 0">在灶台一沥水 · 慢慢提起漏勺<input v-model.number="lift" aria-label="提起漏勺" type="range" min="0" max="100" :disabled="!selected"></label>
            <label v-else-if="step === 1">到案板的面碗里拖拌，也可用方向键调整<input v-model.number="mix" aria-label="拌匀进度" type="range" min="0" max="100" :disabled="!selected"></label>
            <p v-else>到案板的面碗上分处撒料 · 已完成 {{ garnish.length }} / 3</p>
            <progress :value="progress" max="100" aria-label="本步完成进度">{{ Math.round(progress) }}%</progress>
          </div><button class="button cook-next" :disabled="!ready || session.saving" @click="next">{{ step === 2 ? (session.saving ? '正在保存…' : '盛出这一碗') : '下一步 →' }}</button></div>
        </template>
        <div v-else class="actions"><RouterLink class="button" :to="'/food/' + food.id">回到风味手记 →</RouterLink><button id="retry" class="text-link" @click="restart">再做一碗</button></div>
      </section>
      <aside class="station-speech station-speech-main"><p>{{ current ? guideLines[step] : '做好啦，趁热尝一口。' }}</p></aside>
    </div>
    <p class="station-pan-note">操作台可左右滑动查看。</p>
    <div class="workstation-scroll" tabindex="0" aria-label="备餐操作台，窄屏可横向滚动">
      <div class="cooking-scene workstation-canvas" :style="{ '--kitchen-scene':kitchenScene, '--ingredient-art':ingredientArt, '--lift':lift / 3 + 'px', '--stir':mix * 1.8 + 'deg' }">
        <h2 class="station-label ingredients-label">食材盒</h2>
        <div class="ingredient-drawer" aria-label="食材盒，八个格位">
          <template v-for="item in slots" :key="item.label">
            <div v-if="item.empty" class="ingredient-slot empty-slot"><span>空格</span></div>
            <button v-else class="ingredient-slot" :class="{picked:selected && current?.correct===item.label}" :aria-label="item.label" :aria-pressed="selected && current?.correct===item.label" :disabled="session.saving || !current" @click="pickIngredient(item)">
              <span v-if="item.art !== undefined" class="ingredient-row-icon" :style="{backgroundPosition:(item.art / 3 * 100) + '% center'}" aria-hidden="true"></span>
              <KitchenGlyph v-else :name="item.glyph"/><span class="slot-caption">{{ item.label }}</span>
            </button>
          </template>
        </div>
        <h2 class="station-label seasoning-label">调味罐</h2>
        <div class="seasoning-shelf" aria-label="调味罐"><button v-for="name in seasonings" :key="name" :aria-label="name" :class="{picked:selected && current?.correct===name}" :aria-pressed="selected && current?.correct===name" :disabled="session.saving || !current" @click="choose(name)"><span>{{ name }}</span></button></div>
        <div v-if="step === 0 && selected" class="lifted-skimmer" :style="{transform:'translateY(-' + lift / 3 + 'px) rotate(-18deg)'}" aria-hidden="true"><KitchenGlyph name="skimmer"/></div>
        <span class="equipment-caption stove-one-caption">灶台一 · 烫面沥水</span><span class="equipment-caption stove-two-caption">灶台二 · 备用</span>
        <div class="bowl-workspace" :class="{'can-mix':selected && step===1,'is-finished':!current}" @pointerdown="dragStart" @pointermove="dragMove" @pointerup="pointer = null" @pointercancel="pointer = null">
          <img v-if="step > 0 && current" class="working-bowl" :class="{stirring:step===1 && selected}" :src="asset(food.image)" alt="案板上正在拌制的热干面" draggable="false">
          <p v-else class="board-note">{{ current ? '先烫热，再来拌香。' : '这一碗，已经出餐。' }}</p>
          <span v-if="selected && step===1" class="stir-label">{{ mix >= 100 ? '拌匀了！' : '来回拖动拌匀' }}</span>
          <div v-if="step===2 && selected" class="garnish-targets"><button v-for="(place,index) in ['左侧','中间','右侧']" :key="place" :aria-label="'在面碗' + place + '撒料'" :aria-pressed="garnish.includes(index)" :class="{sprinkled:garnish.includes(index)}" @click="sprinkle(index)">{{ garnish.includes(index) ? '已撒好' : '撒料' }}<i v-if="garnish.includes(index)" aria-hidden="true"></i></button></div>
        </div>
        <span class="equipment-caption board-caption">拌面案板</span>
        <div class="serving-area" aria-live="polite"><img v-if="!current" :src="asset(food.image)" alt="已出餐的武汉热干面"><span class="equipment-caption">{{ current ? '出餐区' : '已出餐 · 本机记录' }}</span></div>
        <aside class="station-speech station-speech-secondary"><p>{{ current ? '不着急，跟着步骤慢慢来。' : '制作已记下，巷口的故事还要另外寻找。' }}</p></aside>
        <img class="workstation-guide" :src="asset('book-guide.webp')" :alt="recipe.guide + '，绿色围裙的虚构体验向导'"><p class="workstation-guide-name">{{ recipe.guide }} · 虚构体验向导</p>
      </div>
    </div>
    <p class="local-note">简化制作的本地演示，记录仅保存在当前浏览器。插画为本项目原创的 AI 辅助素材。</p>
  </section><section v-else class="page"><EmptyState heading="h1" title="这里没有配置制作体验" message="只有精选美食提供制作，先去认识一道地方风味吧。"/></section>
</template>
