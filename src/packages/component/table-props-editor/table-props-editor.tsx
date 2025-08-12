import { defineComponent, reactive, ref, type PropType } from 'vue'
import './table-props-editor.scss'
import type { VisualEditorProps, VisualEditorTableColumn } from '@/packages/visualEditor.props'
import { useModel } from '@/packages/utils/useModel'
import { ElButton, ElTag } from 'element-plus'
import { $$tablePropsEditor } from './table-props-deitor-service'

export const TablePropsEditor = defineComponent({
    props: {
        modelValue: { type: Array as PropType<any[]> },
        propsConfig: { type: Object as PropType<VisualEditorProps>, required: true }
    },
    emits: {
        'update:modelValue': (value?: any) => true
    },

    setup(props, { emit }) {
        // const model = useModel(() => props.modelValue, value => emit('update:modelValue', value))

        const model = ref(props.modelValue)
        const onClick = async () => {
            const data = await $$tablePropsEditor({
                config: props.propsConfig,
                data: props.modelValue || [],
            })
            console.log(data, 'data点击添加时的返回数据')
            model.value = data
            emit('update:modelValue', data)
        }

        return () => (
            <div onClick={onClick}>
                {
                    (!model.value || model.value.length === 0) && <ElButton>
                        添加
                    </ElButton>
                }
                {   
                    (model.value || []).map((item: any) => <ElTag>{item[props.propsConfig.table!.showKey]}</ElTag>)
                }
            </div>
        )
    }
})