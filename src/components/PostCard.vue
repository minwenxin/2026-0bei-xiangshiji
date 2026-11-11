<script setup>
import CommunityCardHead from './CommunityCardHead.vue'
import InteractionButtons from './InteractionButtons.vue'
import { session } from '../stores/session.js'
defineProps({ post: { type: Object, required: true } })
</script>
<template><article class="post scrapbook-post"><CommunityCardHead
  :name="post.author || '巷口饭友'"
  :initials="post.contentKind === 'editorial' ? '编' : post.author?.slice(-1) || '我'"
  :category="post.contentKind === 'editorial' ? '小编推荐' : '食客分享'"
  :region="post.region"
  :disclosure="post.example ? '虚构示例' : '本机记录 · 未公开'"
  :to="post.authorId ? '/taster/' + post.authorId : undefined"
  :color="post.authorColor"
/><RouterLink class="post-preview" :to="'/post/' + post.id"><div class="post-copy"><h3>{{ post.title }}</h3><p>{{ post.body.slice(0, 96) }}{{ post.body.length > 96 ? '…' : '' }}</p></div><figure v-if="post.image" class="post-polaroid"><img class="post-image" :src="post.image" :alt="post.title + '的配图'" loading="lazy"><figcaption>{{ post.example ? '寻味示例' : '我的寻味记录' }}</figcaption></figure></RouterLink><p v-if="post.demoStats" class="demo-count">演示点赞 {{post.demoStats.likes}} · 演示收藏 {{post.demoStats.favorites}} · 下方互动仅存本机</p><div class="post-bottom"><RouterLink class="text-link" :to="'/post/' + post.id">翻开小记 ↗<span v-if="session.progress.comments[post.id]?.length"> · {{ session.progress.comments[post.id].length }} 条本地留言</span></RouterLink><InteractionButtons type="post" :id="post.id"/></div></article></template>
