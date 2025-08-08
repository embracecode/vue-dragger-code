<template>
    <div :class="classes" :style="{...blockStyle}" ref="el">
       <component :is="currentComp.render({ props: props.block.props || {}})"></component>
    </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted } from 'vue'
import { VisualEditorBlockData, VisualEditorConfig } from './visualEditor.utils'
const props = defineProps<{
    block: VisualEditorBlockData,
    config: VisualEditorConfig
}>()
const blockStyle = computed(() => {
    return {
        top: `${props.block.top}px`,
        left: `${props.block.left}px`,
        zIndex: props.block.zIndex
    }
})
const el = ref({} as HTMLDivElement)

onMounted(() => {
    // 拖拽放置组件时 上下左右居中
    const block = props.block
    if (block.adjustPosition) {
        const { offsetWidth, offsetHeight } = el.value
        block.top -= offsetHeight / 2
        block.left -= offsetWidth / 2
        block.width = offsetWidth
        block.height = offsetHeight
        block.adjustPosition = false
    }
})
const currentComp = props.config.componentMap[props.block.componentKey]

// 容器内选择物料时增加虚线
const classes = computed(() => [
    'visual-editor-block',
    {
        'visual-editor-block-focus': props.block.focus
    }
    
])
</script>

<style lang="scss" scoped>

</style>
