<script setup>
import { computed, reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { foods, foodRegions, foodCategories } from '../data/foods.js'
import { session, updateProgress, notify } from '../stores/session.js'
const route = useRoute(), router = useRouter(), submission = computed(() => route.name === 'submission')
const form = reactive({ title: '', region: '湖北', body: '', foodId: '', category: '街巷小吃', source: '', image: '' })
const preview = ref(false), imageError = ref(''), reading = ref(false)
function valid() {
  if (!form.title.trim() || form.body.trim().length < 8) { notify('请写下标题与至少 8 个字的介绍。'); return false }
  if (submission.value && !form.source.trim()) { notify('正式美食投稿请填写资料来源或参考说明。'); return false }
  return true
}
function showPreview() { if (valid()) preview.value = true }
async function readImage(event) {
  const file = event.target.files?.[0]
  form.image = ''; imageError.value = ''; preview.value = false
  if (!file) return
  if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type) || file.size > 1024 * 1024) { imageError.value = '请选择 1 MB 以内的 JPG、PNG 或 WebP 图片。'; event.target.value = ''; return }
  reading.value = true
  try {
    form.image = await new Promise((resolve, reject) => { const reader = new FileReader(); reader.onload = () => resolve(reader.result); reader.onerror = () => reject(new Error('图片无法读取，请重新选择。')); reader.readAsDataURL(file) })
  } catch (error) { imageError.value = error.message }
  finally { reading.value = false }
}
async function submit() {
  if (!valid() || reading.value) return
  const record = { ...form, title: form.title.trim(), body: form.body.trim(), source: form.source.trim(), id: crypto.randomUUID(), createdAt: new Date().toISOString(), status: 'pending-demo' }
  if (await updateProgress(progress => { progress[submission.value ? 'submissions' : 'posts'].push(record) })) {
    notify(submission.value ? '演示投稿已保存在本机，未发送到团队' : '推荐已加入本地烟火广场')
    router.push(submission.value ? '/me' : '/post/' + record.id)
  }
}
</script>
<template><section class="page"><RouterLink class="back" :to="submission ? '/me' : '/square'">← 返回{{ submission ? '我的' : '烟火广场' }}</RouterLink><h1>{{ submission ? '推荐一份地方风味' : '把这一口，写下来' }}</h1><p class="page-intro">{{ submission ? '正式收录流程演示：团队不会真实收到资料，不会自动加入地图。' : '仅加入当前浏览器的分享列表，不向其他用户公开。' }}</p><form v-if="!preview" class="form" @submit.prevent="showPreview"><label>{{ submission ? '美食名称' : '推荐标题' }}<input v-model="form.title" name="title" required maxlength="40" placeholder="给这份风味起个标题"></label><label>所在地区<select v-model="form.region" name="region"><option v-for="item in [...foodRegions, '其他地区']" :key="item">{{ item }}</option></select></label><label v-if="submission">分类<select v-model="form.category"><option>街巷小吃</option><option v-for="item in foodCategories" :key="item">{{ item }}</option></select></label><label v-else>关联美食（选填）<select v-model="form.foodId"><option value="">不关联</option><option v-for="food in foods" :key="food.id" :value="food.id">{{ food.name }}</option></select></label><label>{{ submission ? '特色简介' : '推荐理由' }}<textarea v-model="form.body" name="body" required minlength="8" maxlength="1000" placeholder="写下至少 8 个字的介绍或体验"></textarea></label><label v-if="submission">资料来源或参考说明<input v-model="form.source" name="source" required maxlength="500" placeholder="链接、书籍或资料说明"></label><label>推荐照片（选填，1 MB 以内）<input type="file" accept="image/jpeg,image/png,image/webp" @change="readImage"></label><p v-if="imageError" class="field-error" role="alert">{{ imageError }}</p><p v-if="reading" role="status">正在读取图片……</p><img v-if="form.image" class="image-preview" :src="form.image" alt="推荐照片预览"><small>图片与文字存于当前浏览器，容量有限；保存失败时会保留表单内容。</small><div class="actions"><button class="button" :disabled="reading">先看看预览 →</button></div></form><article v-else class="post publish-preview"><div class="place">{{ submission ? '投稿预览' : '推荐预览' }} · {{ form.region }}</div><h2>{{ form.title }}</h2><img v-if="form.image" class="image-preview" :src="form.image" alt="推荐照片预览"><p class="post-body">{{ form.body }}</p><p v-if="submission">资料来源：{{ form.source }}</p><div class="actions"><button class="text-link" :disabled="session.saving" @click="preview = false">← 返回修改</button><button class="button" :disabled="session.saving" @click="submit">{{ session.saving ? '正在保存…' : '确认保存到本机 →' }}</button></div></article></section></template>
