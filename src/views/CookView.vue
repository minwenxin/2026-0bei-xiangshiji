<script setup>
import { computed, ref } from 'vue'
import { useRoute } from 'vue-router'
import { getRecipe } from '../data/cooking.js'
import { getFood, asset } from '../data/foods.js'
import { session, completeRecipe, notify } from '../stores/session.js'
import EmptyState from '../components/EmptyState.vue'
const route = useRoute(), recipe = computed(() => getRecipe(route.params.id)), step = ref(0), feedback = ref('点击本步需要的工具或食材。')
const food = computed(() => getFood(recipe.value?.foodId)), current = computed(() => recipe.value?.steps[step.value])
async function choose(tool) {
  if (tool !== current.value.correct) { feedback.value = '这个暂时用不上，看看阿云的提示再选一次。'; return }
  if (step.value === recipe.value.steps.length - 1 && !(await completeRecipe(recipe.value.id))) return
  const message = current.value.result
  step.value++
  feedback.value = '点击本步需要的工具或食材。'
  notify(message)
}
function restart() { step.value = 0; feedback.value = '点击本步需要的工具或食材。' }
</script>
<template>
  <section v-if="recipe && food" class="page cook-page"><div class="scene-top"><RouterLink class="back" :to="'/food/' + food.id">← 回到{{ food.name }}</RouterLink><span>巷口小厨房 · 精选制作体验</span></div><div class="kitchen-title"><h1>{{ current?.title || '这一碗，拌好了。' }}</h1><p>{{ current ? '慢慢来，跟着阿云学一个关键动作。' : '烫面、拌酱、添香，把清晨拌进这一碗。' }}</p></div>
    <ol class="cook-steps"><li v-for="(item, index) in recipe.steps" :key="item.title" :class="{ done: index < step, current: index === step }" :aria-current="index === step ? 'step' : undefined"><span>{{ index < step ? '✓' : index + 1 }}</span>{{ item.title }}</li></ol>
    <div class="kitchen-stage"><img :src="asset(current ? 'story-1.jpg' : food.image)" :alt="current ? '木台上的漏勺、面条与配料' : '完成的热干面'"><div class="kitchen-dialog"><span class="guide-name">{{ recipe.guide }} · 虚构体验向导</span><h2>{{ current ? '这一幕，试着动手' : '好啦，趁热尝尝' }}</h2><p>{{ current ? current.hint : '制作记录已经保存。制作完成与故事发现分别记录，留意食物旁的细节，另外寻找故事。' }}</p><template v-if="current"><div class="tools"><button v-for="tool in current.tools" :key="tool" :data-tool="tool" :disabled="session.saving" @click="choose(tool)">{{ tool }}</button></div><p id="cook-feedback" class="status" role="status">{{ feedback }}</p></template><div v-else class="actions"><RouterLink class="button" :to="'/food/' + food.id">回到风味手记 →</RouterLink><button id="retry" class="text-link" @click="restart">再做一碗</button></div></div></div>
  </section><section v-else class="page"><EmptyState heading="h1" title="这里没有配置制作体验" message="只有精选美食提供制作，先去认识一道地方风味吧。"/></section>
</template>
