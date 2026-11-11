<script setup>
import {computed} from 'vue'
defineOptions({inheritAttrs:false})
const props=defineProps({post:Object,alt:String,loading:{type:String,default:'eager'}})
const trimmed=computed(()=>props.post.id==='note-noodles'&&props.post.image?.includes('note-noodles-user-v2.webp'))
</script>
<template><span class="post-photo-window" :class="{'photo-bottom-trimmed':trimmed}" :style="trimmed?{aspectRatio:'474 / 555'}:{}"><img v-bind="$attrs" :src="post.image" :alt="alt||post.title+'的配图'" :loading="loading" :style="{width:'100%',height:'auto',maxHeight:'none',aspectRatio:'auto',objectFit:'contain'}"></span></template>
<style scoped>
.post-photo-window{display:block;width:100%;min-width:0;overflow:hidden;line-height:0}
.post-photo-window>img{display:block}
</style>
