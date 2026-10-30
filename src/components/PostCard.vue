<script setup>
import InteractionButtons from './InteractionButtons.vue'
import { session } from '../stores/session.js'
defineProps({ post: { type: Object, required: true } })
</script>
<template><article class="post scrapbook-post"><div class="post-author"><span class="paper-avatar" aria-hidden="true">{{ (post.author || '我').slice(0,1) }}</span><div><strong>{{ post.author || '本地访客' }}</strong><span>{{ post.example ? '虚构示例 · 编辑手记' : '本机记录 · 未公开' }} · {{ post.region }}</span></div></div><RouterLink class="post-preview" :to="'/post/' + post.id"><div class="post-copy"><h3>{{ post.title }}</h3><p>{{ post.body.slice(0, 96) }}{{ post.body.length > 96 ? '…' : '' }}</p></div><figure v-if="post.image" class="post-polaroid"><img class="post-image" :src="post.image" :alt="post.title + '的配图'" loading="lazy"><figcaption>{{ post.example ? '寻味示例' : '我的寻味记录' }}</figcaption></figure></RouterLink><div class="post-bottom"><RouterLink class="text-link" :to="'/post/' + post.id">翻开小记 ↗<span v-if="session.progress.comments[post.id]?.length"> · {{ session.progress.comments[post.id].length }} 条本地留言</span></RouterLink><InteractionButtons type="post" :id="post.id"/></div></article></template>
