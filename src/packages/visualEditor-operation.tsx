import { defineComponent, reactive, watch, type PropType } from "vue";
import type { VisualEditorBlockData, VisualEditorConfig, VisualEditorModelValue } from "./visualEditor.utils";
import type { JSX } from "vue/jsx-runtime";
import { ElButton, ElColorPicker, ElForm, ElFormItem, ElInput, ElInputNumber, ElOption, ElSelect } from "element-plus";
import { VisualEditorPropsType, type VisualEditorProps } from "./visualEditor.props";
import deepcopy from "deepcopy";
import { TablePropsEditor } from "./component/table-props-editor/table-props-editor";

export const VisualEditorOperation = defineComponent({
    props: {
        block: { type: Object as PropType<VisualEditorBlockData>},
        config: { type: Object as PropType<VisualEditorConfig>, required: true },
        dataModel: { type: Object as PropType<{ value: VisualEditorModelValue }>, required: true },
        updateBlock: { type: Function as PropType<(( newBlock: VisualEditorBlockData, oldBlock: VisualEditorBlockData ) => void)>, required: true },
        updateModelValue: { type: Function as PropType<((value: VisualEditorModelValue) => void)>, required: true }
    },
    setup(props) {
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
                    const newBlock = state.editData
                    props.updateBlock(newBlock, props.block)
                }
                console.log(props.dataModel, 'dataModel')
            },
            reset: () => {
                if (!props.block) {
                    state.editData = deepcopy(props.dataModel.value.container)
                } else {
                    state.editData = deepcopy(props.block)
                }
            }
        }
        watch(() => props.block, (val) => {
            methods.reset()
        }, { immediate: true })

        const propElementMap = {
            [VisualEditorPropsType.input]: (propName: string, props: VisualEditorProps) => <ElInput v-model={state.editData.props[propName]}></ElInput>,
            [VisualEditorPropsType.color]: (propName: string, props: VisualEditorProps) => <ElColorPicker v-model={state.editData.props[propName]} />,
            [VisualEditorPropsType.select]: (propName: string, props: VisualEditorProps) => {
                return <ElSelect placeholder="" v-model={state.editData.props[propName]}>
                    {
                        props.options?.map(option => {
                            return <ElOption label={option.label} value={option.value}></ElOption>
                        })
                    }
                </ElSelect>
            },
            [VisualEditorPropsType.table]: (propName: string, props: VisualEditorProps) => {
                return <TablePropsEditor v-model={state.editData.props[propName]} propsConfig={props}></TablePropsEditor>
            }
        }


        return () => {
            let content: JSX.Element[] = []

            if (!props.block) {
                content.push(<>
                    <ElFormItem label="容器宽度">
                        <ElInputNumber v-model={state.editData.width} step={100}></ElInputNumber>
                    </ElFormItem>
                    <ElFormItem label="容器高度">
                        <ElInputNumber v-model={state.editData.height} step={100}></ElInputNumber>
                    </ElFormItem>
                </>)
            } else {

                const { componentKey } = props.block
                const component = props.config.componentMap[componentKey]
                // console.log(component.props, 'component.props', component.model, 'component.model')

                if (!!component) {
                    if (!!component.props) {
                        content.push(<>
                            {
                                Object.entries(component.props).map(([propName, propValue]) => {
                                    return <ElFormItem label={propValue.label} key={propName}>
                                        {propElementMap[propValue.type](propName, propValue)}
                                    </ElFormItem>
                                })
                            }
                        </>)
                    }
                    if (!!component.model) {
                        console.log(component.model, 'component.model', state.editData.model)
                        content.push(<>
                            {
                                Object.entries(component.model).map(([modelName, label]) => {
                                    return <ElFormItem label={label} key={label}>
                                        <ElInput v-model={state.editData.model[modelName]}/>
                                    </ElFormItem>
                                })
                            }
                        </>)
                    }
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