<script setup>
import { computed, ref } from 'vue'
import { stories } from '../data/stories.js'
import { session } from '../stores/session.js'
import MementoArt from '../components/MementoArt.vue'

const province = ref('全部地区'), visibleCount = ref(9)
const list = computed(() => stories.filter(story => province.value === '全部地区' || story.province === province.value))
const regions = computed(() => [...new Set(stories.map(story => story.province))])
const visibleList = computed(() => list.value.slice(0, visibleCount.value))
const count = computed(() => stories.filter(story => session.progress.stories[story.id]?.collected).length)
const record = story => session.progress.stories[story.id]
// 固定的九件一组：四件、五件交替；刷新不重新随机位置。
const rowCount = computed(() => Math.floor(visibleList.value.length / 9) * 2 + (visibleList.value.length % 9 > 4 ? 2 : visibleList.value.length % 9 > 0 ? 1 : 0))
const pasteStyle = story => {
  const index = visibleList.value.findIndex(item => item.id === story.id)
  const slot = index % 9, pair = Math.floor(index / 9), five = slot >= 4
  const column = five ? slot - 4 : slot, row = pair * 2 + (five ? 1 : 0)
  const left = (five ? [1.5,21,40,59,78] : [3,28,51.5,75])[column]
  const offset = (five ? [16,0,26,7,21] : [4,28,0,20])[column]
  const stableIndex = stories.findIndex(item => item.id === story.id)
  const angle = [-6,4,-3,7,3,-5,6,-4,2][stableIndex % 9]
  return {
    '--paste-x': left + '%', '--paste-y': 30 + row * 320 + offset + 'px', '--paste-angle': angle + 'deg',
    '--tablet-x': [3,36,68][index % 3] + '%', '--tablet-y': 35 + Math.floor(index / 3) * 300 + [0,22,7][index % 3] + 'px',
    '--mobile-y': 35 + index * 310 + 'px',
  }
}
</script>

<template>
  <section class="page collection-page sticker-collection">
    <div class="collection-heading">
      <div><h1>时光手记</h1><p>把偶遇的故事，贴进这本手记。</p></div>
      <div class="collection-summary">
        <p class="collection-count"><span>已拾得</span><strong>{{ count }}</strong><span>/ {{ stories.length }} 件</span></p>
        <RouterLink class="text-link" to="/map">继续寻味 →</RouterLink>
      </div>
    </div>
    <div class="collection-filters" aria-label="按地区查看纪念物">
      <button v-for="item in ['全部地区', ...regions]" :key="item" :class="{ active: province === item }" :aria-pressed="province === item" @click="province = item; visibleCount = 9">{{ item }}</button>
    </div>
    <div class="memento-board pasted-journal" aria-label="纪念物手账" :style="{ '--journal-height': Math.max(390, rowCount * 320 + 65) + 'px', '--journal-tablet-height': Math.ceil(visibleList.length / 3) * 300 + 90 + 'px', '--journal-mobile-height': Math.max(490, visibleList.length * 310 + 160) + 'px' }">
      <div class="journal-corner" aria-hidden="true"><span>留一角给下次相逢</span><i></i><b>一物，一段时光。</b></div>
      <article v-for="story in visibleList" :key="story.id" class="memento-entry" :style="pasteStyle(story)">
        <template v-if="record(story)?.collected">
          <RouterLink class="memento-open collected-ticket" :to="'/story/' + story.id">
            <MementoArt :memento="story.memento" decorative />
            <h2>{{ story.memento.name }}</h2><p>{{ story.province }} · {{ story.character }}的巷口故事</p>
          </RouterLink>
          <div class="memento-links"><RouterLink class="memento-action" :to="'/story/' + story.id">翻开故事 ↗</RouterLink><RouterLink class="memento-food-link" :to="'/food/' + story.foodId">回到关联美食 →</RouterLink></div>
        </template>
        <template v-else>
          <MementoArt :memento="story.memento" unknown />
          <h2>{{ record(story)?.readComplete ? '一件待收下的纪念物' : record(story)?.found ? '一段未读完的故事' : '一件待发现的小物' }}</h2><p>待寻 · {{ story.province }}</p>
          <RouterLink class="memento-action" :to="record(story)?.found ? '/story/' + story.id : '/province/' + story.province">{{ record(story)?.found ? '继续读故事' : '去当地找找' }} ↗</RouterLink>
        </template>
      </article>
      <p v-if="!list.length" class="local-note">这里还没有纪念物，换个地区看看吧。</p>
    </div>
    <button v-if="visibleCount < list.length" class="text-link collection-more" @click="visibleCount += 9">再翻一页旧物（还有 {{ list.length - visibleCount }} 件） ↓</button>
    <div class="collection-endnote"><p>每一件旧物，都有一段来处。</p><span>留意纸条的翘角，故事从你翻开时开始。</span></div>
    <p class="local-note">探索记录仅保存在当前浏览器，清除浏览器数据后会丢失。</p>
  </section>
</template>
