<template>
    <div :class="classes" v-show="state.editing">
        <div class="visual-editor-menu">
            <div class="visual-editor-menu-item"
                draggable="true"
                @dragend="menuDragger.dragend"
                @dragstart="menuDragger.dragstart($event, comp)"
                v-for="comp, index in props.config.componentList" :key="comp.key">
                    <span class="visual-editor-menu-item-label">{{comp.label}}</span>
                    <component :is="comp.preview()"></component>
            </div>
        </div>
        <div class="visual-editor-head">
            <template v-for="btn, index in buttons" :key="index">
                <el-tooltip v-if="btn.tip" :content="btn.tip" placement="bottom" effect="dark" >
                    <div class="visual-editor-head-button"
                        @click="btn.handler">
                        <i :class="`iconfont ${btn.icon}`"></i>
                        <span>{{ btn.label }}</span>
                    </div>
                </el-tooltip>
                <div v-else class="visual-editor-head-button"
                    @click="btn.handler">
                    <i :class="`iconfont ${typeof btn.icon === 'function' ? btn.icon() : btn.icon}`"></i>
                    <span>{{ typeof btn.label === 'function' ? btn.label() : btn.label }}</span>
                </div>
            </template>
            
        </div>
        <!-- 不加key  在切换选中的时候 会无法更新属性绑定的界面 很奇怪的问题  在app.vue 中模拟了一下这个场景发现 children组件会重新渲染 在这里不行-->
        <VisualEditorOperation
            :key="state.selectBolck?.top ? state.selectBolck?.top : '0'"
            :block="state.selectBolck"
            :config="props.config"
            :dataModel="dataModel" 
            :updateBlock="useCommander.updateBlock"
            :updateModelValue="useCommander.updateModelValue"
            ></VisualEditorOperation>
        <div class="visual-editor-body">
            <div class="visual-editor-content">
                <div class="visual-editor-container"
                    @mousedown="blockFocusHandler.container.onMouseDown($event)"
                    ref="containerRef"
                    :style="{...containerStyle}">
                    <VisualEditorBlock
                        @mousedown="blockFocusHandler.block.onMouseDown($event, value, index)"
                        @contextmenu="handler.onContextMenuBlock($event, value)"
                        :config="props.config"
                        :formData="props.formData"
                        v-for="value, index in dataModel.value.blocks"
                        :key="value.componentKey"
                        :block="value"
                        :slots="slots"></VisualEditorBlock>
                    <div v-if="blockDragger.mark.y !== null" :style="`top: ${blockDragger.mark.y}px`" class="visual-editor-mark-line-y"></div>
                    <div v-if="blockDragger.mark.x !== null" :style="`left: ${blockDragger.mark.x}px`" class="visual-editor-mark-line-x"></div>
                </div>
            </div>
        </div> 
    </div>
    <div v-show="!state.editing">
        <div class="visual-editor-container"
            :style="{...containerStyle}">
            <VisualEditorBlock
                :config="props.config"
                :formData="props.formData"
                v-for="value, index in dataModel.value.blocks"
                :key="value.componentKey"
                :block="value"
                :slots="slots"></VisualEditorBlock>
        </div>
        <div class="vue-visual-container-edit-button" @click=openEdit>
            <i class="iconfont icon-edit"/>
            <span>编辑组件</span>
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed, ref, reactive, type PropType, useSlots } from 'vue'
import { createNewBlock, type VisualEditorModelValue, type VisualEditorConfig, type VisualEditorMarkLine, type VisualEditorBlockData, type VisualEditorComponent } from './visualEditor.utils'
import { useModel } from './utils/useModel'
import { useVisualCommand } from './utils/useVisualCommand'
import { createEvent } from './plugins/event'
import VisualEditorBlock from './visualEditorBlock.vue'
import { VisualEditorOperation } from './visualEditor-operation'
import { $$dialog } from './utils/dialog-service'
import { $$dropdown, dropdownOptionContent } from './utils/dropdown-service'
import { ElMessageBox } from 'element-plus'
const props = defineProps<{
    modelValue: VisualEditorModelValue,
    config: VisualEditorConfig,
    formData: Record<string, any>
}>()
const emit = defineEmits<{
    (e: 'update:modelValue', value: VisualEditorModelValue): Boolean
}>()
const slots = useSlots()
// 双向绑定容器中的组件数据
const dataModel = useModel(() => props.modelValue, value => emit('update:modelValue', value))

// 计算容器的尺寸
const containerStyle = computed(() => ({
    width: `${dataModel.value.container.width}px`,
    height: `${dataModel.value.container.height}px`
}))

const containerRef = ref<HTMLDivElement>()
const selectIndex = ref(-1)
const state = reactive({
    selectBolck: computed(() => (dataModel.value.blocks || [])[selectIndex.value]),
    preview: true, // 是否处于预览状态
    editing: true, // 当前是否已经开启了编辑器

})

const classes = computed(() => ([
    'visual-editor',
    {
        'visual-editor-not-preview': !state.preview
    }
]))

// 计算选中与未选中的block数据
const focusData = computed(() => {
    let focus = [] as VisualEditorBlockData[]
    let unFocus = [] as VisualEditorBlockData[]
    dataModel.value.blocks.forEach(block => {
        block.focus ? focus.push(block) : unFocus.push(block)
    })
    return {
        focus,
        unFocus
    }
})

// 增加拖拽时的事件监听  使其能触发撤销 重做
const dragStart = createEvent()
const dragEnd = createEvent()


// 左侧物料拖拽至容器时的动作
const menuDragger = (() => {
    let currentComponent = null as null | VisualEditorComponent
    // 处理菜单拖拽开始和结束
    const blockHandler = {
        dragstart: (e: DragEvent, component: VisualEditorComponent) => {
            if (state.preview) return
            containerRef.value!.addEventListener('dragenter', containerHandler.dragenter)
            containerRef.value!.addEventListener('dragover', containerHandler.dragover)
            containerRef.value!.addEventListener('dragleave', containerHandler.dragleave)
            containerRef.value!.addEventListener('drop', containerHandler.drop)
            currentComponent = component
            dragStart.emit()
        },
        dragend: (e: DragEvent) => {
            containerRef.value!.removeEventListener('dragenter', containerHandler.dragenter)
            containerRef.value!.removeEventListener('dragover', containerHandler.dragover)
            containerRef.value!.removeEventListener('dragleave', containerHandler.dragleave)
            containerRef.value!.addEventListener('drop', containerHandler.drop)
            currentComponent = null
        }
    }
    // 拖拽至容器中时的动作
    const containerHandler = {
        dragenter: (e: DragEvent) => e.dataTransfer!.dropEffect = 'move',
        dragover: (e: DragEvent) => e.preventDefault(),
        dragleave: (e: DragEvent) => e.dataTransfer!.dropEffect = 'none',
        drop: (e: DragEvent) => {
            const blocks = [...dataModel.value.blocks]
            blocks.push(createNewBlock({
                component: currentComponent!,
                top: e.offsetY,
                left: e.offsetX
            }))
            updateDataModel(blocks)
            dragEnd.emit()
        }
    }
    return blockHandler
})()

const clearFocusedBlock = ((block?: VisualEditorBlockData) => {
    let blocks = dataModel.value.blocks || []
    if (blocks.length === 0) return
    if (!!block) {
        blocks = blocks.filter(item => item !== block)
    }
    blocks.forEach(block => block.focus = false)
})

// 容器内物料选中
const blockFocusHandler = (() => {
    return {
        container: {
            onMouseDown(e: MouseEvent) {
                if(state.preview) return
                e.preventDefault()
                if (e.target !== e.currentTarget) return
                if (!e.shiftKey) {
                    // 点击容器空白处清空所有选中
                    clearFocusedBlock()
                    selectIndex.value = -1
                }
            }
        },
        block: {
            onMouseDown(e: MouseEvent, block: VisualEditorBlockData, index: number) {
                if(state.preview) return
                e.stopPropagation()
                e.preventDefault()
                // 按shift多选 选择完之后 松开shift 在拖拽
                if (e.shiftKey) {
                    // 按住shift时 如果此时没有选中的block 就选中这个block 否则令这个block的状态取反
                    if (focusData.value.focus.length <= 1) {
                        block.focus = true
                    } else {
                        block.focus = !block.focus
                    }
                } else {
                    if (!block.focus) {
                        block.focus = true
                        clearFocusedBlock(block)
                    }
                }
                selectIndex.value = index
                // console.log(block, index, e, '-----------', state.selectBolck)
                blockDragger.mouseDown(e)
            }
        }
    }
})()

// 容器内物料的拖拽
const blockDragger = (() => {

    const mark = reactive({
        x: null as null | number,
        y: null as null | number
    })

    let dragState = {
        startX: 0,
        startY: 0,
        startLeft: 0,
        startTop: 0,
        startPosition: [] as { top: number, left: number }[],
        dragging: false,
        markLines: {} as VisualEditorMarkLine
    }
    const mouseDown = (e: MouseEvent) => {
        dragState = {
            startX: e.clientX,
            startY: e.clientY,
            startLeft: state.selectBolck!.left,
            startTop: state.selectBolck!.top,
            startPosition: focusData.value.focus.map(item => ({ top: item.top, left: item.left })),
            dragging: false,
            markLines: (() => {
                const { focus, unFocus } = focusData.value
                const { left, top, width, height } = state.selectBolck!
                let lines = { x: [], y: [] } as VisualEditorMarkLine
                // 最后一项增加的是容器的中心辅助线
                [...unFocus, {
                    top: 0,
                    left: 0,
                    width: dataModel.value.container.width,
                    height: dataModel.value.container.height
                }].forEach(item => {
                    const { left: l, top: t, width: w, height: h } = item
                    lines.y.push({ top: t, showTop: t})  // 顶部对其顶部
                    lines.y.push({ top: t + h, showTop: t + h }) // 顶部对其底部
                    lines.y.push({ top: t + h / 2 - height / 2, showTop: t + h / 2 }) // 顶部对其中间
                    lines.y.push({ top: t - height, showTop: t}) // 底部对其顶部
                    lines.y.push({ top: t + h - height, showTop: t + h }) // 底部对其底部

                    // todo 还需要计算X的标线位置
                    lines.x.push({ left: l, showLeft: l }) // 左侧对其左侧
                    lines.x.push({ left: l + w, showLeft: l + w }) // 左侧对其右侧
                    lines.x.push({ left: l + w / 2 - width / 2, showLeft: l + w / 2 }) // 左侧对其中间
                    lines.x.push({ left: l - width, showLeft: l }) // 右侧对其左侧
                    lines.x.push({ left: l + w - width, showLeft: l + w }) // 右侧对其右侧

                })
                return lines
            })()
        }
        document.addEventListener('mousemove', mouseMove)
        document.addEventListener('mouseup', mouseUp)
    }
    const mouseMove = (e: MouseEvent) => {
        if (!dragState.dragging) {
            dragState.dragging = true
            dragStart.emit()
        }

        let { clientX: moveX, clientY: moveY } = e
        const { startX, startY } = dragState


        // let dragX = e.clientX - dragState.startX
        // let dragY = e.clientY - dragState.startY

        // 按着shift键时 只能水平或者垂直拖动
        if (e.shiftKey) {
            if (Math.abs(moveX - startX) > Math.abs(moveY - startY)) {
                moveY = startY
            } else {
                moveX = startX
            }
        }

        const currentLeft = dragState.startLeft + moveX - startX
        const currentTop = dragState.startTop + moveY - startY
        const currentMark = {
            x: null as null | number,
            y: null as null | number
        }
        for (let i = 0; i < dragState.markLines.y.length; i++) {
            const { top, showTop } = dragState.markLines.y[i]
            if (Math.abs(top - currentTop) < 5) {
                moveY = top + startY - dragState.startTop
                currentMark.y = showTop
                break
            }
        }
        for (let i = 0; i < dragState.markLines.x.length; i++) {
            const { left, showLeft } = dragState.markLines.x[i]
            if (Math.abs(left - currentLeft) < 5) {
                moveX = left + startX - dragState.startLeft
                currentMark.x = showLeft
                break
            }
        }

        mark.x = currentMark.x
        mark.y = currentMark.y
        const dragX = moveX - startX
        const dragY = moveY - startY

        // dragState.markLines.x.forEach(({left, showLeft}) => {
            
        // })

        focusData.value.focus.forEach((item, index) => {
            item.top = dragState.startPosition[index].top + dragY
            item.left = dragState.startPosition[index].left + dragX
        })
    }
    const mouseUp = (e: MouseEvent) => {
        document.removeEventListener('mousemove', mouseMove)
        document.removeEventListener('mouseup', mouseUp)
        mark.x = null
        mark.y = null
        if (dragState.dragging === true) {
            dragEnd.emit()
        }
    }

    return {
        mark,
        mouseDown
    }
})()

// 更新数据模型
const updateDataModel = (blocks: VisualEditorBlockData[]) => {
    dataModel.value = { ...dataModel.value, blocks }
}

// openEdit
const openEdit = () => {
    state.editing = true
}

// 
const showBlockData = (block: VisualEditorBlockData) => {
    $$dialog.textarea(JSON.stringify(block), '节点数据', { editReadOnly: true })
}

const importBlockData = async (block: VisualEditorBlockData) => {
    const text = await $$dialog.textarea('', '请输入节点Json字符串')
    try {
        const data = JSON.parse(text as string)
        useCommander.updateBlock(data, block)
    } catch (error) {
        ElMessageBox.alert('JSON格式错误')
    }
}

// 头部操作栏命令
const useCommander = useVisualCommand({
    focusData,
    updateDataModel,
    dataModel,
    dragStart,
    dragEnd
})


const handler = {
    onContextMenuBlock: (e: MouseEvent, block: VisualEditorBlockData) => {
        if(state.preview) return
        e.stopPropagation()
        e.preventDefault()
        $$dropdown(dropdownOptionContent(e, block, useCommander, showBlockData, importBlockData))
    }
}

const buttons = [
    {
        label: '撤销', icon: 'icon-back', handler: () => useCommander.undo(), tip: 'Ctrl + Z'
    },
    {
        label: '重做', icon: 'icon-forward', handler: () => useCommander.redo(), tip: 'Ctrl + Y, Ctrl + Shift + Z'
    },
    {
        label: () => state.preview ? '编辑' : '预览',
        icon: () => state.preview ? 'icon-edit' : 'icon-browse',
        handler: () => {
            if (!state.preview) {
                clearFocusedBlock()
            }
            state.preview = !state.preview
        },
    },
    {
        label: '导入', icon: 'icon-import', handler: async () => {
            const text = await $$dialog.textarea('', '请输入导入的JSON字符串')
            console.log(text)
            try {
                const blocks = JSON.parse(text as string)
                updateDataModel(blocks)
            } catch (error) {
                ElMessageBox.alert('JSON格式错误')
            }
        }
    },
    {
        label: '导出', icon: 'icon-export', handler: () => $$dialog.textarea(JSON.stringify(dataModel.value), '导出的JSON数据', { editReadOnly: true })
    },
    {
        label: '置顶', icon: 'icon-place-top', handler: () => useCommander.placeTop(), tip: 'ctrl+up'
    },
    {
        label: '置底', icon: 'icon-place-bottom', handler: () => useCommander.placeBottom(), tip: 'ctrl+down'
    },
    {
        label: '删除', icon: 'icon-delete', handler: () => useCommander.delete(), tip: 'space, Delete, Ctrl + D'
    },
    {
        label: '清空', icon: 'icon-reset', handler: () => useCommander.clear()
    },
    {
        label: '关闭', icon: 'icon-close', handler: () => {
            clearFocusedBlock()
            state.editing = false
        },
    },
]


</script>

<style lang="scss" scoped>
@import '../lib/iconfont/iconfont.css';
$headSize: 60px; // 顶部操作栏的高度
$menuSize: 275px; // 左侧菜单栏的宽度
$operatorSize: 275px; // 右侧操作栏的宽度

$ibc: #dcdfe6; // border color 边框颜色
$ibl: #ebeef5; // border light 边框浅色
$itc: #314659; // text color 文字颜色
$icc: rgba(0,0,0, .45); // icon color 图标颜色
$boxShadowColor: #f0f1f2; // box shadow 阴影
$pramary: #409eff; // 主要颜色

.visual-editor {
    position: fixed;
    inset: 20px 20px 20px 20px;
    background-color: white;
    &:before {
        content: '';
        position: fixed;
        inset: 0;
        background-color: rgba(#999, .2);
    }
    & > .visual-editor-menu {
        position: absolute;
        width: $menuSize;
        top: 0;
        left: 0;
        bottom: 0;
        background-color: white;
        z-index: 9;
        overflow-y: auto;
        padding-bottom: 200px;
        .visual-editor-menu-item {
            position: relative;
            width: calc(100% - 20px);
            margin-left: 10px;
            margin-top: 20px;
            border: 2px solid $ibl;
            min-height: 100px;
            display: flex;
            justify-content: center;
            align-items: center;
            padding: 0 20px;
            box-sizing: border-box;
            &::after {
                content: '';
                position: absolute;
                inset: 0;
                z-index: 2;
            }
            &:hover {
                border-color: $pramary;
                cursor: move;
            }
        }
        .visual-editor-menu-item-label {
            position: absolute;
            top: -3px;
            left: -3px;
            background-color: $pramary;
            color: white;
            padding: 4px 8px;
            font-size: 12px;
            z-index: 1;
        }
    }
    & > .visual-editor-head {
        position: absolute;
        top: 0;
        left: $menuSize;
        right: $operatorSize;
        height: $headSize;
        display: flex;
        justify-content: center;
        align-items: center;
        .visual-editor-head-button {
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            background-color: rgba(0,0,0, .2);
            color: white;
            height: 60px;
            width: 60px;
            cursor: pointer;
            transition: all .3s;
            & + .visual-editor-head-button{
                margin-left: 1px;
            }
            &:first-child {
                border-top-left-radius: 5px;
                border-bottom-left-radius: 5px;
            }
            &:last-child {
                border-top-right-radius: 5px;
                border-bottom-right-radius: 5px;
            }
            &:hover {
                background-color: rgba(0,0,0, .3);
            }
            i {
                font-size: 20px;
            }
            span {
                font-size: 12px;
            }
        }
    }
    & > .visual-editor-operator {
        position: absolute;
        top: 0;
        right: 0;
        bottom: 0;
        width: $operatorSize;
        background-color: white;
        padding: 20px 10px 300px 10px;
        box-sizing: border-box;
        :deep(.el-input-number) {
            width: 100%;
        }
    }
    & > .visual-editor-body {
        padding-top: $headSize + 10;
        padding-right: $operatorSize;
        padding-left: $menuSize;
        box-sizing: border-box;
        height: 100%;
        .visual-editor-content {
            height: 100%;
            width: 100%;
            // overflow: auto;
            display: flex;
            justify-content: center;
            overflow-y: auto;
        }
    }
    &.visual-editor-not-preview {
        & > .visual-editor-body {
            .visual-editor-container {
                border: 1px dashed $pramary;
                box-sizing: border-box;
                .visual-editor-block {
                    :deep(.el-button, .el-input, .el-select) {
                        transition: none;
                    }
                    &:after {
                        content: '';
                        position: absolute;
                        inset: -3px;
                    }
                }
            }
        }
    }
}
.visual-editor-container {
    background-color: white;
    position: relative;
    .visual-editor-block {
        position: absolute;
        :deep(.el-select) {
            width: 194px;
        }
    }
    .visual-editor-block-focus {
        &::after {
            border: 1px dashed $pramary;
        }
    }
    .visual-editor-mark-line-y {
        position: absolute;
        left:0;
        right:0;
        border-top: 1px dashed $pramary;
    }
    .visual-editor-mark-line-x {
        position: absolute;
        top:0;
        bottom:0;
        border-left: 1px dashed $pramary;
    }
}
.vue-visual-container-edit-button {
    position: absolute;
    top: 10px;
    right: 10px;
    color: black;
    padding: 6px 16px;
    border: dashed 1px gray;
    user-select: none;

    &:hover {
        background-color: $ibl;
        cursor: pointer;
        border-style: solid;
    }

    &:active {
        background-color: $ibc;
    }

    & > i {
        font-size: 16px;
        margin-right: 4px;
    }

    & > span {
        font-size: 14px;
    }
}
</style>