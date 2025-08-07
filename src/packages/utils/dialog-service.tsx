import { createApp, defineComponent, reactive, getCurrentInstance, type PropType } from "vue"
import { defer } from "./defer"
import { ElInput, ElDialog, ElButton } from "element-plus"

enum DialogServiceEditorType {
    textarea = 'textarea',
    input = 'input'
}

interface DialogServiceOptions {
    title?: string,
    editType: DialogServiceEditorType
    editReadOnly?: boolean,
    editValue?: string | null,
    onConfirm: (value?: string | null) => void
}

const keyGenerator = (() => {
    let count = 0
    return () => `auto_key_${count++}`
})()

const serviceComponent = defineComponent({
    props: {
        options: { type: Object as PropType<DialogServiceOptions>, required: true }
    },
    setup(props) {

        const ctx = getCurrentInstance()!

        const state = reactive({
            options: props.options,
            editValue: null as string | null | undefined,
            showFlag: false,
            key: keyGenerator()
        })

        const methods = {
            service: (options: DialogServiceOptions) => {
                state.options = options
                state.editValue = options.editValue
                state.key = keyGenerator()
                methods.show()
            },
            show: () => {
                state.showFlag = true
            },
            hide: () => {
                state.showFlag = false
            }
        }

        const handler = {
            onConfirm: () => {
                state.options.onConfirm(state.editValue)
                methods.hide()
            },
            onCancel: () => {
                methods.hide()
            }
        }
        console.log(ctx);
        // @ts-ignore
        Object.assign(ctx.proxy, methods)
        return () => (
            // 需要使用从element-plus中导入的组件
            <ElDialog v-model={state.showFlag} title={state.options.title} key={state.key}>
                {{
                    default: () => <>
                        {
                            state.options.editType === DialogServiceEditorType.textarea ? 
                            <ElInput type="textarea" v-model={state.editValue} rows={10} />
                            : 
                            <ElInput v-model={state.editValue} rows={10} />
                        }
                    </>,
                    footer: () => (
                        <div>
                            <ElButton onClick={handler.onCancel}>取消</ElButton>
                            <ElButton onClick={handler.onConfirm}>确定</ElButton>
                        </div>
                    )
                }}
            </ElDialog>
        )
    }
})


const dialogService = (() => {

    let ins: any


    return (options: DialogServiceOptions) => {
        if (!ins) {
            const el = document.createElement('div')
            document.body.appendChild(el)
            const app = createApp(serviceComponent, { options })
            ins = app.mount(el)
        }
        ins.service(options)
    }
})()

export const $$dialog = Object.assign(dialogService, {
    input: (initValue?: string, title?: string, options?: Omit<DialogServiceOptions, 'editType'|'onConfirm'>) => {
        const dfd = defer<string | null | undefined>()
        const opt = {
            ...options,
            editType: DialogServiceEditorType.input,
            onConfirm: dfd.resolve,
            editValue: initValue,
            title
        }
        console.log(opt, 'opt');
        dialogService(opt)
        return dfd.promise
    },
    textarea: (initValue?: string, title?: string, options?: Omit<DialogServiceOptions, 'editType'|'onConfirm'>) => {
        const dfd = defer<string | null | undefined>()
        const opt = {
            ...options,
            editType: DialogServiceEditorType.textarea,
            onConfirm: dfd.resolve,
            editValue: initValue,
            title
        }
        dialogService(opt)
        return dfd.promise
    }
})