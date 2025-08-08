import { defineComponent, reactive, watch, type PropType } from "vue";
import type { VisualEditorBlockData, VisualEditorConfig, VisualEditorModelValue } from "./visualEditor.utils";
import type { JSX } from "vue/jsx-runtime";
import { ElButton, ElColorPicker, ElForm, ElFormItem, ElInput, ElInputNumber, ElOption, ElSelect } from "element-plus";
import { VisualEditorPropsType, type VisualEditorProps } from "./visualEditor.props";
import deepcopy from "deepcopy";

export const VisualEditorOperation = defineComponent({
    props: {
        block: { type: Object as PropType<VisualEditorBlockData>},
        config: { type: Object as PropType<VisualEditorConfig>, required: true },
        dataModel: { type: Object as PropType<{ value: VisualEditorModelValue }>, required: true },
        updateBlock: { type: Function as PropType<(( newBlock: VisualEditorBlockData, oldBlock: VisualEditorBlockData ) => void)>, required: true },
        updateModelValue: { type: Function as PropType<((value: VisualEditorModelValue) => void)>, required: true }
    },
    setup(props) {
        console.log(props, 'VisualEditorOperation')

        const state = reactive({
            editData: {} as any
        })
        const methods = {
            apply: () => {
                if (!props.block) {
                    // 当前编辑容器的属性
                    props.updateModelValue({ ...props.dataModel.value, container: deepcopy(state.editData) })
                } else {
                    // 当前编辑block组件的属性
                    props.updateBlock({
                        ...props.block,
                        props: deepcopy(state.editData)
                    }, props.block)
                }
            },
            reset: () => {
                if (!props.block) {
                    state.editData = deepcopy(props.dataModel.value.container)
                } else {
                    state.editData = deepcopy(props.block.props)
                }
            }
        }
        watch(() => props.block, (val) => {
            if (!val) {
                state.editData = deepcopy(props.dataModel.value.container)
                console.log(state.editData, '---------')
            } else {
                state.editData = deepcopy(val.props || {})
            }
        }, { immediate: true })

        const propElementMap = {
            [VisualEditorPropsType.input]: (propName: string, props: VisualEditorProps) => <ElInput v-model={state.editData[propName]}></ElInput>,
            [VisualEditorPropsType.color]: (propName: string, props: VisualEditorProps) => <ElColorPicker v-model={state.editData[propName]} />,
            [VisualEditorPropsType.select]: (propName: string, props: VisualEditorProps) => {
                return <ElSelect placeholder="" v-model={state.editData[propName]}>
                    {
                        props.options?.map(option => {
                            return <ElOption label={option.label} value={option.value}></ElOption>
                        })
                    }
                </ElSelect>
            },
            [VisualEditorPropsType.table]: (propName: string, props: VisualEditorProps) => {
                return <div>编辑 table props</div>
            }
        }


        return () => {
            let content: JSX.Element | null = null

            if (!props.block) {
                content = <>
                    <ElFormItem label="容器宽度">
                        <ElInputNumber v-model={state.editData.width} step={100}></ElInputNumber>
                    </ElFormItem>
                    <ElFormItem label="容器高度">
                        <ElInputNumber v-model={state.editData.height} step={100}></ElInputNumber>
                    </ElFormItem>
                </>
            } else {

                const { componentKey } = props.block
                const component = props.config.componentMap[componentKey]
                if (!!component && !!component.props) {
                    content = <>
                        {
                            Object.entries(component.props).map(([propName, propValue]) => {
                                return <ElFormItem label={propValue.label} key={propName}>
                                    {propElementMap[propValue.type](propName, propValue)}
                                </ElFormItem>
                            })
                        }
                    </>
                }
            }

            return (
                <div class="visual-editor-operator">
                    <ElForm labelPosition="top">
                        {content}
                        <ElFormItem>
                            <ElButton type="primary" onClick={methods.apply}>应用</ElButton>
                            <ElButton onClick={methods.reset}>重置</ElButton>
                        </ElFormItem>
                    </ElForm>
                </div>
            )
        }
    }
})