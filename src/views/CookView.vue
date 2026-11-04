<script setup>
import { computed, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { getRecipe } from '../data/cooking.js'
import { getFood, asset } from '../data/foods.js'
import { session, completeRecipe } from '../stores/session.js'
import EmptyState from '../components/EmptyState.vue'
const route = useRoute(), recipe = computed(() => getRecipe(route.params.id))
const step = ref(0), selected = ref(false), lift = ref(0), mix = ref(0), garnish = ref([])
const feedback = ref('')
const food = computed(() => getFood(recipe.value?.foodId)), current = computed(() => recipe.value?.steps[step.value])
const kitchenScene = `url("${new URL(asset('kitchen-stations.webp'), document.baseURI).href}")`
const slots = [
  { label:'碱水面', art:'15 155 640 430', prepared:true }, { label:'萝卜丁与葱花', art:'1170 225 420 345' },
  { label:'葱花', art:'1660 205 500 375' }, { label:'面粉', image:'cook-flour.webp' },
  { label:'漏勺', image:'cook-skimmer.webp' }, { label:'筷子', image:'cook-chopsticks.webp', prepared:true },
  { label:'粽叶', image:'cook-leaf.webp' }, { label:'空食材格', empty:true },
]
const seasonings = ['芝麻酱','酱油','香醋','香油','盐','辣椒油']
const ready = computed(() => selected.value && (step.value === 0 ? lift.value >= 100 : step.value === 1 ? mix.value >= 100 : garnish.value.length === 3))
const progress = computed(() => step.value === 0 ? lift.value : step.value === 1 ? mix.value : garnish.value.length / 3 * 100)
const phase = computed(() => ready.value ? '已完成' : selected.value ? '待操作' : '待选择')
const dialogue = computed(() => {
  if (!current.value) return '香喷喷的一碗，做好啦！再做一碗也行，巷口的故事还等着你另外去找。'
  if (feedback.value) return feedback.value
  if (ready.value) return step.value === 2 ? '香啦！点击“盛出这一碗”，准备开吃！' : '香啦！点击“下一步”，咱们接着做。'
  if (!selected.value) return ['先点一下漏勺，咱们把面烫热！','点一下芝麻酱，给面条添点香！','点一下“萝卜丁与葱花”，添上最后一口脆！'][step.value]
  return ['按住滑块往右拖到底，让面条沥沥水。滑块就在制作台下方哦！','在案板面碗里按住鼠标左键来回拖动，把酱香拌开～','点一点碗里的三个小圈，撒上最后一口脆！'][step.value]
})
const dialogueParts = computed(() => dialogue.value.split(/(按住鼠标左键来回拖动|按住滑块往右拖|点击|点一下|点一点|芝麻酱|漏勺|萝卜丁与葱花)/).filter(Boolean).map(text => ({ text, action:/^(按住|点击|点一下|点一点)/.test(text) })))
watch(ready, () => { feedback.value = '' })
let pointer = null
function choose(tool) {
  if (!current.value || session.saving) return
  if (tool !== current.value.correct) { feedback.value = '这个先歇会儿，咱们这步用' + current.value.correct + '。' + (selected.value ? '已经选好啦，接着做就行。' : '点一下它就好！'); return }
  if (selected.value) { feedback.value = ''; return }
  selected.value = true
  feedback.value = ''
}
function pickIngredient(item) {
  choose(item.label)
}
function dragStart(event) { if (!selected.value || step.value !== 1 || ready.value || event.button !== 0 || !event.isPrimary) return; feedback.value = ''; pointer = { x:event.clientX, y:event.clientY }; event.currentTarget.setPointerCapture(event.pointerId) }
function dragMove(event) {
  if (!pointer) return
  mix.value = Math.min(100, mix.value + Math.hypot(event.clientX - pointer.x, event.clientY - pointer.y) / 5)
  pointer = { x:event.clientX, y:event.clientY }
}
function sprinkle(index) { if (selected.value && step.value === 2 && !session.saving) { feedback.value = ''; if (!garnish.value.includes(index)) garnish.value.push(index) } }
async function next() {
  if (!ready.value || session.saving) return
  if (step.value === 2 && !(await completeRecipe(recipe.value.id))) return
  step.value++; selected.value = false; pointer = null
  feedback.value = ''
}
function restart() { step.value = 0; selected.value = false; lift.value = 0; mix.value = 0; garnish.value = []; pointer = null; feedback.value = '' }
</script>
<template>
  <section v-if="recipe && food" class="page cook-page interactive-kitchen workstation-page">
    <div class="scene-top"><RouterLink class="back" :to="'/food/' + food.id">← 回到{{ food.name }}</RouterLink><span>巷口小厨房 · 精选制作体验</span></div>
    <div class="station-steps-row">
      <section class="station-steps-board paper-panel" aria-label="做菜步骤">
        <div class="step-board-title"><h1>{{ current?.title || '这一碗，拌好了。' }}</h1><span>{{ food.name }} · {{ current ? `第 ${step + 1} 步 / 共 3 步` : '制作已完成' }}</span></div>
        <ol class="cook-steps"><li v-for="(item,index) in recipe.steps" :key="item.title" :class="{done:index<step,current:index===step}" :aria-current="index===step ? 'step' : undefined"><span>{{ index < step ? '✓' : index + 1 }}</span>{{ item.title }}</li></ol>
      </section>
    </div>
    <p class="station-pan-note">操作台可左右滑动查看。</p>
    <div class="workstation-scroll" tabindex="0" aria-label="备餐操作台，窄屏可横向滚动">
      <div class="cooking-scene workstation-canvas" :style="{ '--kitchen-scene':kitchenScene, '--lift':lift / 3 + 'px', '--stir':mix * 1.8 + 'deg' }">
        <h2 class="station-label ingredients-label">食材盒</h2>
        <div class="ingredient-drawer" aria-label="食材盒，八个格位">
          <template v-for="item in slots" :key="item.label">
            <div v-if="item.empty" class="ingredient-slot empty-slot"><span>空格</span></div>
            <button v-else class="ingredient-slot" :class="{picked:selected && current?.correct===item.label}" :aria-label="item.label" :aria-pressed="selected && current?.correct===item.label" :disabled="session.saving || !current" @click="pickIngredient(item)">
              <svg v-if="item.art !== undefined" class="ingredient-row-icon" :viewBox="item.art" aria-hidden="true"><image :href="asset('recipe-noodle-ingredients.webp')" width="2172" height="724"/></svg>
              <img v-else class="ingredient-object" :src="asset(item.image)" alt="" draggable="false"><span class="slot-caption">{{ item.label }}</span>
            </button>
          </template>
        </div>
        <h2 class="station-label seasoning-label">调味罐</h2>
        <div class="seasoning-shelf" aria-label="调味罐"><button v-for="name in seasonings" :key="name" :aria-label="name" :class="{picked:selected && current?.correct===name}" :aria-pressed="selected && current?.correct===name" :disabled="session.saving || !current" @click="choose(name)"><span>{{ name }}</span></button></div>
        <div v-if="step === 0 && selected" class="lifted-skimmer" :style="{transform:'translateY(-' + lift / 3 + 'px) rotate(-18deg)'}" aria-hidden="true"><img :src="asset('cook-skimmer.webp')" alt=""></div>
        <span class="equipment-caption stove-one-caption">灶台一 · 烫面沥水</span><span class="equipment-caption stove-two-caption">灶台二 · 备用</span>
        <div class="bowl-workspace" :class="{'operation-target':selected && !ready && step===1,'can-mix':selected && step===1 && !ready,'is-finished':!current}" @pointerdown="dragStart" @pointermove="dragMove" @pointerup="pointer = null" @pointercancel="pointer = null" @lostpointercapture="pointer = null">
          <img v-if="step > 0 && current" class="working-bowl" :class="{stirring:step===1 && selected}" :src="asset('cook-plain-bowl.webp')" alt="案板上尚未撒料的芝麻酱面碗" draggable="false">
          <p v-else class="board-note">{{ current ? '先烫热，再来拌香。' : '这一碗，已经出餐。' }}</p>
          <div v-if="step===2 && selected" class="garnish-targets"><button v-for="(place,index) in ['左侧','中间','右侧']" :key="place" :aria-label="'在面碗' + place + '撒料'" :aria-pressed="garnish.includes(index)" :class="{sprinkled:garnish.includes(index)}" @click="sprinkle(index)"><span v-if="!garnish.includes(index)" class="garnish-ring" aria-hidden="true"></span><img v-else class="garnish-morsels" :src="asset('cook-garnish.webp')" alt="" draggable="false" aria-hidden="true"></button></div>
        </div>
        <span class="equipment-caption board-caption">拌面案板</span>
        <div class="serving-area"><img v-if="!current" :src="asset(food.image)" alt="已出餐的武汉热干面"><span class="equipment-caption">{{ current ? '出餐区' : '已出餐 · 本机记录' }}</span></div>
        <aside id="cook-dialogue" class="station-speech station-speech-secondary" aria-label="阿云的指引" role="status" aria-live="polite" aria-atomic="true"><span class="speech-speaker">阿云</span><p><template v-for="(part,index) in dialogueParts" :key="index"><strong v-if="part.action">{{ part.text }}</strong><span v-else :class="{'speech-word':['芝麻酱','漏勺','萝卜丁与葱花'].includes(part.text)}">{{ part.text }}</span></template></p></aside>
        <img class="workstation-guide" :src="asset('book-guide.webp')" :alt="recipe.guide + '，绿色围裙的虚构体验向导'"><p class="workstation-guide-name">{{ recipe.guide }} · 虚构体验向导</p>
      </div>
    </div>
    <section class="cook-controls paper-panel" aria-label="制作进度与操作">
      <template v-if="current">
        <div class="station-task-row">
          <div class="cooking-action">
            <p class="cook-phase">{{ phase }} · {{ step === 2 ? '撒料 ' + garnish.length + ' / 3' : Math.round(progress) + '%' }}</p>
            <label v-if="step === 0">沥水滑块 · 按住向右拖动
              <input v-model.number="lift" aria-label="提起漏勺" type="range" min="0" max="100" :disabled="!selected || ready" :class="{'operation-target':selected && !ready}" @input="feedback = ''">
            </label>
            <progress v-if="step === 1" :value="progress" max="100" aria-label="拌面完成进度">{{ Math.round(progress) }}%</progress>
            <details class="cook-help">
              <summary>操作帮助</summary>
              <p v-if="step === 0">先点击食材盒里的漏勺，再按住这里的滑块向右拖到底。键盘可聚焦滑块后按方向键或 End；锅里的漏勺不用拖。</p>
              <template v-else-if="step === 1"><p>点击芝麻酱选好后，在案板面碗内按住鼠标左键来回拖动。键盘可使用下面的辅助滑块，按方向键或 End。</p><label>键盘辅助拌匀<input v-model.number="mix" aria-label="拌匀进度" type="range" min="0" max="100" :disabled="!selected || ready" @input="feedback = ''"></label></template>
              <p v-else>先点击“萝卜丁与葱花”，再点击面碗左、中、右三处标记。也可用 Tab 聚焦标记，按 Enter 或空格撒料。</p>
            </details>
          </div>
          <button class="button cook-next" aria-describedby="cook-dialogue" :disabled="!ready || session.saving" @click="next">{{ step === 2 ? (session.saving ? '正在保存…' : '盛出这一碗') : '下一步 →' }}</button>
        </div>
      </template>
      <div v-else class="actions"><RouterLink class="button" :to="'/food/' + food.id">回到风味手记 →</RouterLink><button id="retry" class="text-link" @click="restart">再做一碗</button></div>
    </section>
    <p class="local-note">简化制作的本地演示，记录仅保存在当前浏览器。插画为本项目原创的 AI 辅助素材。</p>
  </section><section v-else class="page"><EmptyState heading="h1" title="这里没有配置制作体验" message="只有精选美食提供制作，先去认识一道地方风味吧。"/></section>
</template>
