import { defineComponent, type PropType } from "vue"
import './block-resize.scss'
import type { VisualEditorBlockData, VisualEditorComponent } from "@/packages/visualEditor.utils"

enum Direction {
    start = 'start',
    center = 'center',
    end = 'end'
}

export const BlockResizeComponent = defineComponent({
    props: {
        block: { type: Object as PropType<VisualEditorBlockData>, required: true },
        component: { type: Object as PropType<VisualEditorComponent>, required: true }
    },
    setup(props) {
        console.log(props.block, 'props.block', props.component)

        const omMouseDown = (() => {
            let data = {
                startX: 0,
                startY: 0,
                startWidth: 0,
                startHeight: 0,
                startTop: 0,
                startLeft: 0,
                direction: { horzontal: Direction.start, vertical: Direction.start }
            }
            const mouseDown = (e: MouseEvent, direction: { horzontal: Direction, vertical: Direction }) => {
                e.stopPropagation()
                document.addEventListener('mousemove', mouseMove)
                document.addEventListener('mouseup', mouseUp)
                data = {
                    startX: e.clientX,
                    startY: e.clientY,
                    startWidth: props.block.width,
                    startHeight: props.block.height,
                    startTop: props.block.top,
                    startLeft: props.block.left,
                    direction
                }
            }
            const mouseMove = (e: MouseEvent) => {
                let { startX, startY, startWidth, startHeight, startTop, startLeft, direction } = data
                let { clientX: moveX, clientY: moveY } = e
                if (direction.horzontal === Direction.center) {
                    moveX = startX

                }
                if (direction.vertical === Direction.center) {
                    moveY = startY
                }
                let durX = moveX - startX
                let durY = moveY - startY
                if (direction.vertical === Direction.start) {
                    durY = -durY
                    props.block.top = startTop - durY
                }
                if (direction.horzontal === Direction.start) {
                    durX = -durX
                    props.block.left = startLeft - durX
                }
                const width = startWidth + durX
                const height = startHeight + durY
                props.block.width = width
                props.block.height = height
                props.block.hasResize = true
            }
            const mouseUp = (e: MouseEvent) => {
                document.removeEventListener('mousemove', mouseMove)
                document.removeEventListener('mouseup', mouseUp)
            }
            return mouseDown
        })()

        return () => {
            const { width, height } = props.component.resize || {}
            return <>
                {
                    !!height && <>
                        <div class={'block-resize block-resize-top'}
                             onMousedown={e => omMouseDown(e, { horzontal: Direction.center, vertical: Direction.start })}></div>
                        <div class={'block-resize block-resize-bottom'}
                             onMousedown={e => omMouseDown(e, { horzontal: Direction.center, vertical: Direction.end })}></div>
                    </>
                }
                {
                    !!width && <>
                        <div class={'block-resize block-resize-left'}
                            onMousedown={e => omMouseDown(e, { horzontal: Direction.start, vertical: Direction.center })}></div>
                        <div class={'block-resize block-resize-right'}
                            onMousedown={e => omMouseDown(e, { horzontal: Direction.end, vertical: Direction.center })}></div>
                    </>
                }
                {
                    !!width && !!height && <>
                        <div class={'block-resize block-resize-top-left'}
                            onMousedown={e => omMouseDown(e, { horzontal: Direction.start, vertical: Direction.start })}></div>
                        <div class={'block-resize block-resize-top-right'}
                            onMousedown={e => omMouseDown(e, { horzontal: Direction.end, vertical: Direction.start })}></div>
                        <div class={'block-resize block-resize-bottom-left'}
                            onMousedown={e => omMouseDown(e, { horzontal: Direction.start, vertical: Direction.end })}></div>
                        <div class={'block-resize block-resize-bottom-right'}
                            onMousedown={e => omMouseDown(e, { horzontal: Direction.end, vertical: Direction.end })}></div>
                    </>
                }
            </>
        }
    }
})