<script setup>
import { computed, ref } from 'vue'
import { stories } from '../data/stories.js'
import { session } from '../stores/session.js'
import MementoArt from '../components/MementoArt.vue'

const province = ref('全部地区')
const list = computed(() => stories.filter(story => province.value === '全部地区' || story.province === province.value))
const regions = computed(() => [...new Set(stories.map(story => story.province))])
const count = computed(() => stories.filter(story => session.progress.stories[story.id]?.collected).length)
const record = story => session.progress.stories[story.id]
// 陈列位置固定，筛选和刷新不会重新随机分配。
const pasteStyle = story => {
  const index = stories.findIndex(item => item.id === story.id)
  const [left, top, angle] = [[8, 30, -7], [39, 112, 5], [69, 42, -4]][index % 3]
  return { '--paste-x': left + '%', '--paste-y': top + Math.floor(index / 3) * 350 + 'px', '--paste-angle': angle + 'deg', '--mobile-y': 35 + index * 310 + 'px' }
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
      <button v-for="item in ['全部地区', ...regions]" :key="item" :class="{ active: province === item }" :aria-pressed="province === item" @click="province = item">{{ item }}</button>
    </div>
    <div class="memento-board pasted-journal" aria-label="纪念物手账" :style="{ '--journal-height': Math.max(450, Math.ceil(stories.length / 3) * 350 + 150) + 'px', '--journal-mobile-height': Math.max(490, stories.length * 310 + 160) + 'px' }">
      <div class="journal-corner" aria-hidden="true"><span>留一角给下次相逢</span><i></i><b>一物，一段时光。</b></div>
      <article v-for="story in list" :key="story.id" class="memento-entry" :style="pasteStyle(story)">
        <template v-if="record(story)?.collected">
          <RouterLink class="memento-open collected-ticket" :to="'/story/' + story.id">
            <MementoArt :memento="story.memento" decorative />
            <h2>{{ story.memento.name }}</h2><p>{{ story.province }} · {{ story.character }}的巷口故事</p>
            <span class="memento-action">翻开故事 ↗</span>
          </RouterLink>
          <RouterLink class="memento-food-link" :to="'/food/' + story.foodId">回到关联美食 →</RouterLink>
        </template>
        <template v-else>
          <MementoArt :memento="story.memento" unknown />
          <h2>{{ record(story)?.found ? '一段未读完的故事' : '一件待发现的小物' }}</h2><p>待寻 · {{ story.province }}</p>
          <RouterLink class="memento-action" :to="record(story)?.found ? '/story/' + story.id : '/province/' + story.province">{{ record(story)?.found ? '继续读故事' : '去当地找找' }} ↗</RouterLink>
        </template>
      </article>
      <p v-if="!list.length" class="local-note">这里还没有纪念物，换个地区看看吧。</p>
    </div>
    <div class="collection-endnote"><p>每一件旧物，都有一段来处。</p><span>留意纸条的翘角，故事从你翻开时开始。</span></div>
    <p class="local-note">探索记录仅保存在当前浏览器，清除浏览器数据后会丢失。</p>
  </section>
</template>
