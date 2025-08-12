import { defer } from "@/packages/utils/defer"
import { type VisualEditorProps } from "@/packages/visualEditor.props"
import deepcopy from "deepcopy"
import { ElButton, ElDialog, ElInput, ElTable, ElTableColumn } from "element-plus"
import { createApp, defineComponent, getCurrentInstance, onMounted, reactive,  type PropType } from "vue"

export interface TablePropsEditorServiceOptions {
    data: any[],
    config: VisualEditorProps,
    onConfirm: (val: any[]) => void,
}


const ServiceComponent = defineComponent({
    props: {
        option: { type: Object as PropType<TablePropsEditorServiceOptions>, required: true }
    },
    setup(props) {

        const ctx = getCurrentInstance()!

        const state = reactive({
            option: props.option,
            showFlag: false,
            editData: [] as any[],
            mounted: (() => {
                const dfd = defer()
                onMounted(() => dfd.resolve())
                return dfd.promise
            })()
        })

        const methods = {
            service: (option: TablePropsEditorServiceOptions) => {
                state.option = option
                state.editData = deepcopy(option.data || [])
                methods.show()
            },
            hide: () => {
                state.showFlag = false
            },
            show: async () => {
                await state.mounted
                state.showFlag = true
            },
            add: () => {
                state.editData.push({})
            },
            reset: () => {
                state.editData = deepcopy(state.option.data)
            },
        }
        const handler = {
            onConfirm: () => {
                state.option.onConfirm(state.editData)
                methods.hide()
            },
            onCancel: () => {
                methods.hide()
            },
            onDelete: (index: number) => {
                state.editData.splice(index, 1)
            }
        }
        // @ts-ignore
        Object.assign(ctx.proxy, methods)
        // console.log(ctx.exposed, 'ctx.exposed', ctx)
        // ctx.exposed = methods
        return () => <ElDialog v-model={state.showFlag}>
            {{
                default: () => (
                    <div>
                        <div>
                            <ElButton onClick={methods.add}>添加</ElButton>
                            <ElButton onClick={methods.reset}>重置</ElButton>
                        </div>
                        <ElTable data={state.editData}>
                            <ElTableColumn type="index"/>
                            {state.option.config.table!.options.map((item, index) => (
                                <ElTableColumn label={item.label}>
                                    {{
                                        default: ({row}: { row: any }) => <ElInput v-model={row[item.field]}/>
                                    }}
                                </ElTableColumn>
                            ))}
                            <ElTableColumn label="操作栏">
                                {{
                                    default: ({$index}: { $index: number }) => <ElButton
                                        type="danger" {...{onClick: () => handler.onDelete($index)} as any}>
                                        删除
                                    </ElButton>
                                }}
                            </ElTableColumn>
                        </ElTable>
                    </div>
                ),
                footer: () => <>
                    <ElButton onClick={handler.onCancel}>取消</ElButton>
                    <ElButton onClick={handler.onConfirm}>确定</ElButton>
                </>
            }}
        </ElDialog>
    }
})


export const $$tablePropsEditor = (() => { 
    let ins: any;
    return (option: Omit<TablePropsEditorServiceOptions, 'onConfirm'>) => {
        if (!ins) {
            const el = document.createElement('div')
            document.body.appendChild(el)
            const app = createApp(ServiceComponent, {option})
            ins = app.mount(el)
        }
        const dfd = defer<any[]>()
        ins.service({
            ...option,
            onConfirm: dfd.resolve,
        })
        return dfd.promise
    }
})()