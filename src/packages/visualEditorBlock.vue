<template>
    <div :class="classes" :style="{...blockStyle}" ref="el">
       <component :is="currentComp.render({ props: props.block.props || {}, model: modelProps || {}, size: sizeProps || {}})"></component>
       <component v-if="!!props.block.focus && (!!resizeWidthValue || !!resizeHeightValue)"
       :is="BlockResizeComponent" :block="props.block" :component="currentComp" ></component>
    </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted } from 'vue'
import type { VisualEditorBlockData, VisualEditorConfig } from './visualEditor.utils'
import { BlockResizeComponent } from './component/block-resize/block-resize'
const props = defineProps<{
    block: VisualEditorBlockData,
    config: VisualEditorConfig,
    formData: Record<string, any>
}>()
const blockStyle = computed(() => {
    return {
        top: `${props.block.top}px`,
        left: `${props.block.left}px`,
        zIndex: props.block.zIndex
    }
})
const el = ref({} as HTMLDivElement)

const modelProps = computed(() => {
    return Object.keys(currentComp.model || []).reduce((prev, propsName) => {
        const modelName = props.block.model![propsName]
        prev[propsName] = {
            [propsName === 'default' ? 'modelValue' : propsName]: !!modelName ? props.formData[modelName] : null,
            [propsName === 'default' ? 'onUpdate:modelValue' : `onChange`]: (value: any) => props.formData[modelName] = value
        }
        return prev
    }, {} as Record<string, any>)
})

const sizeProps = computed(() => {
    const result = props.block.hasResize ? { width: props.block.width, height: props.block.height } : {}
    return result
})

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

const { width: resizeWidthValue, height:resizeHeightValue } = currentComp.resize || {}
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
