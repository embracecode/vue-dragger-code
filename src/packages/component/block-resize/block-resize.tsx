import { defineComponent, type PropType } from "vue"
import './block-resize.scss'
import type { VisualEditorBlockData, VisualEditorComponent } from "@/packages/visualEditor.utils"

export const BlockResizeComponent = defineComponent({
    props: {
        block: { type: Object as PropType<VisualEditorBlockData>, required: true },
        component: { type: Object as PropType<VisualEditorComponent>, required: true }
    },
    setup(props) {
        console.log(props.block, 'props.block', props.component)
        return () => {
            const { width, height } = props.component.resize || {}
            return <>
                {
                    !!height && <>
                        <div class={'block-resize block-resize-top'}></div>
                        <div class={'block-resize block-resize-bottom'}></div>
                    </>
                }
                {
                    !!width && <>
                        <div class={'block-resize block-resize-left'}></div>
                        <div class={'block-resize block-resize-right'}></div>
                    </>
                }
                {
                    !!width && !!height && <>
                        <div class={'block-resize block-resize-top-left'}></div>
                        <div class={'block-resize block-resize-top-right'}></div>
                        <div class={'block-resize block-resize-bottom-left'}></div>
                        <div class={'block-resize block-resize-bottom-right'}></div>
                    </>
                }
            </>
        }
    }
})