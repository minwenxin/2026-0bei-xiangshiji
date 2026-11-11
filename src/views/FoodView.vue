<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { foods, getFood, asset } from '../data/foods.js'
import { foodReferences } from '../data/food-references.js'
import { getStory } from '../data/stories.js'
import { session, findStory } from '../stores/session.js'
import FoodArt from '../components/FoodArt.vue'
import InteractionButtons from '../components/InteractionButtons.vue'
import EmptyState from '../components/EmptyState.vue'
import MementoArt from '../components/MementoArt.vue'
import PaperStrip from '../components/PaperStrip.vue'
import { BOOK_MOTION, queueBookReveal, consumeBookReveal, clearBookReveal } from '../services/book-motion.js'
const route = useRoute(), router = useRouter(), food = computed(() => getFood(route.params.id))
const provinceFoods = computed(() => food.value ? foods.filter(item => item.province === food.value.province) : [])
const pageIndex = computed(() => provinceFoods.value.findIndex(item => item.id === food.value?.id))
const previousFood = computed(() => provinceFoods.value[pageIndex.value - 1])
const nextFood = computed(() => provinceFoods.value[pageIndex.value + 1])
const story = computed(() => getStory(food.value?.storyId))
const phase = ref(consumeBookReveal(route.params.id) ? 'revealing' : 'idle')
const turning = computed(() => phase.value !== 'idle'), turnSheet = ref(null), bookContent = ref(null), pageShadow = ref(null)
const paperBackground = `url("${new URL(asset('book-spread-watercolor.webp'), document.baseURI).href}")`
const clipboardArt = `url("${new URL(asset('recipe-clipboard-watercolor.webp'), document.baseURI).href}")`
const speeches = computed(() => ({ noodles: ['先拌，再吃！', '趁热才香呢。'], dumplings: ['轻轻提，慢慢移。', '先开小口，再尝鲜。'], zongzi: ['粽叶一折，日子飘香。', '解开棉线，慢慢尝。'] }[food.value?.id] || ['把这一口，记进日常。']))
const animations = new Set()
let mounted = true
onBeforeUnmount(() => { mounted = false; for (const animation of animations) animation.cancel() })
async function play(element, frames, options) {
  if (!element?.animate) return mounted
  const animation = element.animate(frames, { fill: 'forwards', ...options })
  animations.add(animation)
  try { await animation.finished; return mounted } catch { return false }
}
onMounted(async () => {
  if (phase.value !== 'revealing') return
  if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    await play(bookContent.value, [{ opacity: 0, transform: 'translateY(10px)' }, { opacity: 1, transform: 'translateY(0)' }], { duration: BOOK_MOTION.reveal, easing: 'cubic-bezier(.16,1,.3,1)' })
  }
  if (mounted) phase.value = 'idle'
})
async function openNext(event) {
  if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return
  event.preventDefault()
  if (turning.value || !nextFood.value) return
  const target = nextFood.value.id
  const upcomingImage = new Image()
  upcomingImage.src = asset(nextFood.value.image)
  if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    phase.value = 'fading-out'
    if (!(await play(bookContent.value, [{ opacity: 1 }, { opacity: 0 }], { duration: BOOK_MOTION.fade, easing: 'ease-out' }))) return
    phase.value = 'turning'
    await nextTick()
    if (!mounted) return
    if (!(await turnPaper())) return
    queueBookReveal(target)
  }
  if (mounted) {
    try { await router.push('/food/' + target) }
    finally {
      if (mounted) {
        clearBookReveal()
        for (const animation of animations) animation.cancel()
        phase.value = 'idle'
      }
    }
  }
}
async function turnPaper() {
  // 背景在窄屏按高度缩放并裁切，不能用容器百分比推算书脊。
  const book = turnSheet.value.closest('.open-food-book')
  const { width, height } = book.getBoundingClientRect()
  const narrow = window.matchMedia('(max-width:800px)').matches
  const backgroundWidth = narrow ? height * 1672 / 941 : width
  const backgroundOffset = (width - backgroundWidth) * (width <= 520 ? .49 : .5)
  const paperLeft = backgroundOffset + backgroundWidth * .505
  const paperWidth = backgroundWidth * .365
  const hingeSkew = Math.atan(backgroundWidth * .01 / (height * .8)) * 180 / Math.PI
  for (const layer of [turnSheet.value, pageShadow.value]) {
    Object.assign(layer.style, { left: paperLeft + 'px', width: paperWidth + 'px', right: 'auto', top: '10%', bottom: '10%' })
  }
  // 长页使用近似正交投影，避免靠近镜头的纸边被放大到书本以外。
  book.style.perspective = Math.max(backgroundWidth, height) * 12 + 'px'
  turnSheet.value.style.setProperty('--paper-width', turnSheet.value.getBoundingClientRect().width)
  const timing = { duration: BOOK_MOTION.turn, easing: 'linear' }
  // 参考视频约52秒：起页先弯外缘，越脊时保留弧度，落页时自然展平。
  // 连续采样使角速度平滑，不在少数关键帧之间反复减速。
  const poses = Array.from({ length: 61 }, (_, i) => {
    const offset = i / 60
    const travel = offset * offset * (3 - 2 * offset)
    const envelope = Math.sin(Math.PI * offset) ** 1.25
    return { offset, angle: -180 * travel, bend: 42 * envelope * Math.tanh((offset - .24) * 7) }
  })
  const jobs = [play(turnSheet.value, poses.map(({offset, angle}) => ({
    offset, transform: 'skewX(' + hingeSkew + 'deg) rotateY(' + angle + 'deg)', easing: 'linear',
  })), timing)]
  const strips = [...(turnSheet.value?.querySelectorAll('.paper-strip') || [])]
  const stripWidth = paperWidth / strips.length
  const curves = poses.map(pose => {
    let x = 0, z = 0, angle = 0
    return strips.map((_, index) => {
      const reach = index / (strips.length - 1)
      angle += pose.bend * (0.25 + 1.5 * reach) / strips.length
      const result = { offset: pose.offset, transform: 'translate3d(' + x + 'px,0,' + z + 'px) rotateY(' + angle + 'deg)' }
      x += stripWidth * Math.cos(angle * Math.PI / 180)
      z -= stripWidth * Math.sin(angle * Math.PI / 180)
      return result
    })
  })
  for (const [index, strip] of strips.entries()) {
    const reach = index / (strips.length - 1)
    jobs.push(play(strip, curves.map(frame => frame[index]), timing))
    for (const shade of strip.querySelectorAll(':scope > div > .paper-shade')) {
      const back = shade.parentElement.classList.contains('turn-sheet-back')
      jobs.push(play(shade, poses.map(({offset, angle, bend}) => {
        const normal = (angle + bend * (.25 * reach + .75 * reach * reach)) * Math.PI / 180
        const grazing = 1 - Math.abs(Math.cos(normal))
        return { offset, opacity: .015 + grazing * .16 + (back ? .025 : 0), easing: 'linear' }
      }), timing))
    }
  }
  jobs.push(play(pageShadow.value, [
    { opacity: 0, transform: 'translateX(0%) scaleX(.2)', offset: 0 },
    { opacity: .17, transform: 'translateX(-8%) scaleX(.65)', offset: .24 },
    { opacity: .23, transform: 'translateX(-40%) scaleX(.55)', offset: .52 },
    { opacity: .11, transform: 'translateX(-95%) scaleX(.6)', offset: .8 },
    { opacity: 0, transform: 'translateX(-100%) scaleX(.2)', offset: 1 },
  ], timing))
  return (await Promise.all(jobs)).every(Boolean)
}
async function openClue() { if (await findStory(food.value.storyId)) router.push('/story/' + food.value.storyId) }
const notes = {
  noodles: ['把面烫热，提起漏勺，沥去面汤。', '加入芝麻酱与调味料，趁热拌匀。', '撒上萝卜丁与葱花，添一口爽脆。'],
  dumplings: ['面团擀成薄皮，边缘稍薄。', '包入肉馅与皮冻，收拢褶口。', '上笼蒸熟，汤汁留在薄皮里。'],
  zongzi: ['粽叶洗净浸软，折成漏斗状。', '填入调味糯米与馅料，裹紧扎牢。', '加水充分煮熟，让米香慢慢融入。'],
}
</script>
<template>
  <section v-if="food" class="page detail-page book-detail">
    <div class="detail-top"><RouterLink class="back" :to="'/province/' + food.province">← 美食地图 / {{ food.region }}</RouterLink><span>巷食风味手记</span></div>
    <div class="open-food-book" :class="{ 'is-turning': turning }" :data-phase="phase" :aria-busy="turning" :style="{ '--book-background': paperBackground }">
      <div class="book-leaves" aria-hidden="true"><span></span><span></span></div>
      <div class="book-spine" aria-hidden="true"></div>
      <div ref="bookContent" class="book-content" :inert="turning || undefined">
        <div class="food-sticker-column">
          <figure class="dish-portrait current-food-sticker"><FoodArt :food="food" eager/><figcaption><span class="dish-label">{{ food.name }}</span><p>{{ food.subtitle }}</p><span class="dish-flavor">{{ food.flavor }}</span></figcaption></figure>
          <nav v-if="previousFood || !nextFood" class="book-pagination" aria-label="本省美食翻页">
            <RouterLink v-if="previousFood" :to="'/food/' + previousFood.id" :aria-label="'上一页：' + previousFood.name">← 上一页</RouterLink>
            <RouterLink v-if="!nextFood" to="/map">返回美食地图 ↗</RouterLink>
          </nav>
          <a v-if="nextFood" class="next-food-sticker" :href="router.resolve('/food/' + nextFood.id).href" :aria-label="'下一页：' + nextFood.name" :aria-disabled="turning" @click="openNext"><FoodArt :food="nextFood" eager/><span class="next-food-name">{{ nextFood.name }}</span><span class="next-page-label">下一页 <span aria-hidden="true">→</span></span></a>
        </div>
        <article class="recipe-sheet book-recipe">
          <div class="recipe-clipboard-art" :style="{ '--clipboard-art': clipboardArt }" aria-hidden="true"></div>
          <div class="sheet-title"><h1>{{ food.name }}</h1></div>
          <p class="recipe-region"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 22S4 13.8 4 9a8 8 0 1 1 16 0c0 4.8-8 13-8 13Z"/><circle cx="12" cy="9" r="2.5"/></svg>{{ food.region }}</p>
          <h2><span>巷口简介</span></h2>
          <p class="detail-intro">{{ food.catalogSource ? food.intro : food.description }}</p>
          <div class="recipe-ingredients">
            <div class="ingredient-list"><span v-for="item in food.ingredients" :key="item">{{ item }}</span></div>
          </div>
          <h2><span>制作方法</span></h2>
          <ol class="book-method"><li v-for="(verb, index) in food.verbs" :key="verb">
            <span class="method-stamp" aria-hidden="true">{{ ['一', '二', '三'][index] }}</span>
            <div><h3>{{ verb }}</h3><p>{{ food.steps?.[index]?.text || notes[food.id]?.[index] || food.method }}</p></div>
          </li></ol>
          <div class="actions">
            <RouterLink v-if="food.cookingId" class="button book-cook-tab" :to="'/cook/' + food.cookingId" aria-label="跟着师傅做一道">去制作 →</RouterLink>
            <InteractionButtons type="food" :id="food.id"/>
          </div>
        </article>
        <aside class="alley-notes book-guide"><div v-for="(speech, index) in speeches" :key="speech" class="guide-speech" :class="'guide-speech-' + index"><p>{{ speech }}</p></div><img class="guide-sticker" :src="asset(story?.portrait || 'book-guide.webp')" :alt="(story?.character || '巷口向导') + '的虚构人物贴纸'"><p class="guide-credit">{{ story ? story.character : '巷口向导' }} · 虚构体验角色</p><button v-if="story" id="clue" class="clue memento-clue" :class="{'noodle-clue':true}" :aria-label="story.clue.label" :disabled="session.saving" @click="openClue"><MementoArt :memento="story.memento" decorative/><span class="clue-caption">{{ story.lines ? '页角的小物似乎藏着一段话……' : '碗边留着一张纸条……' }}</span></button><p v-else class="handwritten book-margin-note">把这一口，记进日常。</p></aside>
      </div>
      <template v-if="phase === 'turning'">
        <div ref="pageShadow" class="paper-cast-shadow" aria-hidden="true"></div>
        <div ref="turnSheet" class="book-turn-sheet" aria-hidden="true"><PaperStrip/></div>
      </template>
      <span class="book-page-number" aria-hidden="true">{{ String(pageIndex + 1).padStart(2, '0') }}</span>
    </div>
    <p class="sr-only" role="status">{{ turning ? '正在翻到' + nextFood.name : '' }}</p>
    <section class="food-reading-note"><div><h2>尝这一口</h2><p>{{ food.tips }}</p></div><details class="food-source-note"><summary>资料与配图说明</summary><p>{{ food.sourceStatus }}。本页为风味与工艺介绍。</p><p v-if="food.catalogSource">菜品清单及基础资料来自团队整理的《网页素材.doc》。{{ food.imageKind === 'photo' ? '照片来自该文档，原作者及公开使用授权仍待核对。' : '本页配图为本项目的 AI 辅助临时插画。' }}</p><ul v-if="foodReferences[food.id]?.length"><li v-for="reference in foodReferences[food.id]" :key="reference.url"><a :href="reference.url" target="_blank" rel="noopener">{{ reference.title }} ↗</a></li></ul></details></section>
    <p class="local-note">前端本地演示 · {{ nextFood ? '点击下一道美食的贴纸，继续翻阅本省风味。' : '本省风味已翻完，可以返回美食地图。' }}</p>
  </section><section v-else class="page"><EmptyState heading="h1" title="这道风味暂时找不到了" message="可能是链接有误，回地图重新选一道吧。"/></section>
</template>

<style scoped>
.book-pagination { display: flex; flex-wrap: wrap; gap: 8px; align-self: flex-start; }
.book-pagination a { display: inline-flex; align-items: center; min-height: 44px; padding: 4px 11px; border: 3px double #c1a079; border-radius: 4px; background: #fff2d8; color: #883d2a; box-shadow: 2px 3px 5px #72512e26; }
@media (max-width: 520px) {
  .book-pagination { grid-column: 1 / -1; grid-row: 2; }
}
.noodle-clue:focus-visible{outline:2px dashed #8b4e34;outline-offset:5px}
.noodle-clue :deep(.memento-art::after){content:'';position:absolute;right:14px;top:18px;width:11px;height:12px;background:linear-gradient(135deg,#fff6df,#d5bb89);clip-path:polygon(0 0,100% 100%,0 100%);filter:drop-shadow(-1px 1px 1px #644a3633);transform:rotate(-8deg)}
.noodle-clue .clue-caption{color:#634d37}
</style>
