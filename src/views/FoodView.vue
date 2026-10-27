<script setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { foods, getFood, asset } from '../data/foods.js'
import { getStory } from '../data/stories.js'
import { session, findStory } from '../stores/session.js'
import FoodArt from '../components/FoodArt.vue'
import InteractionButtons from '../components/InteractionButtons.vue'
import EmptyState from '../components/EmptyState.vue'
const route = useRoute(), router = useRouter(), food = computed(() => getFood(route.params.id))
const related = computed(() => foods.filter(item => item.id !== food.value?.id))
async function openClue() { if (await findStory(food.value.storyId)) router.push('/story/' + food.value.storyId) }
</script>
<template>
  <section v-if="food" class="page detail-page"><div class="detail-top"><RouterLink class="back" :to="'/province/' + food.province">← 美食地图 / {{ food.region }}</RouterLink><span>巷食风味手记</span></div>
    <div class="scrapbook"><figure class="dish-portrait"><FoodArt :food="food" eager/><figcaption><span class="dish-label">{{ food.name }}</span><p>{{ food.subtitle }}</p><span class="handwritten">一方水土，一味人间</span></figcaption></figure>
      <article class="recipe-sheet"><div class="sheet-title"><span class="region-stamp">{{ food.province }}</span><h1>{{ food.name }}</h1></div><p class="detail-intro">{{ food.intro }}</p><div class="flavor-line">{{ food.flavor }}</div><h2>风味从这里开始</h2><div class="ingredient-list"><span v-for="item in food.ingredients" :key="item">{{ item }}</span></div><p>{{ food.method }}</p><div class="method-flow"><template v-for="(verb, index) in food.verbs" :key="verb"><b v-if="index" aria-hidden="true">→</b><span><small>{{ ['一', '二', '三'][index] }}</small>{{ verb }}</span></template></div><div class="actions"><RouterLink v-if="food.cookingId" class="button" :to="'/cook/' + food.cookingId">跟着师傅做一道 →</RouterLink><InteractionButtons type="food" :id="food.id"/></div></article>
      <aside class="alley-notes"><div class="note-photo"><img :src="asset('alley.jpg')" alt="巷口的早餐摊插画"><span>巷口一隅</span></div><h2>好味小记</h2><p>{{ food.tips }}</p><button v-if="getStory(food.storyId)" id="clue" class="clue" :aria-label="getStory(food.storyId).clue.label" :disabled="session.saving" @click="openClue"><span>老样子。</span><small>—— 碗边的一张旧纸条</small></button><p v-else class="handwritten">把这一口，记进日常。</p></aside>
    </div>
    <p class="local-note">演示内容与 AI 辅助插画，食品资料待正式核验。</p>
    <section class="related-food"><div><h2>下一口，往哪里走？</h2><p>还有这些地方风味，等你慢慢认识。</p></div><div class="related-links"><RouterLink v-for="item in related" :key="item.id" :to="'/food/' + item.id"><FoodArt :food="item"/><span>{{ item.name }}<small>{{ item.region }}</small></span><b>↗</b></RouterLink></div></section>
  </section>
  <section v-else class="page"><EmptyState heading="h1" title="这道风味暂时找不到了" message="可能是链接有误，回地图重新选一道吧。"/></section>
</template>
