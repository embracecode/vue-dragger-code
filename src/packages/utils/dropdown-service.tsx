import type { JSX } from "vue/jsx-runtime"
import { computed, defineComponent, reactive, getCurrentInstance, createApp, type PropType, onMounted, onBeforeUnmount, ref, inject, provide } from "vue"
import './dropdown-service.scss'
import type { VisualEditorBlockData } from "../visualEditor.utils"
import { defer } from "./defer"
interface DropdownServiceOptions {
    reference: MouseEvent | HTMLElement
    content: () => JSX.Element
}

// 点击右键鼠标激活的菜单的时候  自动关闭菜单
const dropdownServiceProvider = (() => {
    const DRODOWN_SERVICE_PROVIDER = '@@DRODOWN_SERVICE_PROVIDER'
    return {
        provider: (handler: { onClick: () => void }) => {
           return provide(DRODOWN_SERVICE_PROVIDER, handler)
        },
        inject: () => {
            return inject(DRODOWN_SERVICE_PROVIDER) as { onClick: () => void }
        }
    }
})()

const ServiceComponent = defineComponent({
    props: {
        options: { type: Object as PropType<DropdownServiceOptions>, required: true }
    },
    setup(props) {
        const state = reactive({
            options: props.options,
            showFlag: false,
            top: 0,
            left: 0,
            mounted: (() => {
                const dfd = defer()
                onMounted(() => dfd.resolve())
                return dfd.promise
            })()
        })

        const el = ref<HTMLElement>()

        const ctx = getCurrentInstance()!

        const service = (options: DropdownServiceOptions) => {
            state.options = options
            if ('addEventListener' in options.reference) {
                const { top, left, height } = options.reference.getBoundingClientRect()!
                state.top = top + height
                state.left = left
            } else {
                const { clientY, clientX } = options.reference
                state.top = clientY
                state.left = clientX
            }
            methods.show()
        }

        const methods = {
            hide: () => {
                state.showFlag = false
            },
            show: async () => {
                await state.mounted
                state.showFlag = true
            }
        }

        const classes = computed(() => [
            'dropdown-service',
            {
                'dropdown-service-show': state.showFlag
            }
        ])

        const styles = computed(() => ({
            top: `${state.top}px`,
            left: `${state.left}px`
        }))

        // @ts-ignore
        Object.assign(ctx.proxy, { service })

        const onMouseDownPage = (e: MouseEvent) => {
            if (!(el.value as HTMLElement).contains(e.target as HTMLElement)) {
                methods.hide()
            }
        }
        onMounted(() => {
            document.body.addEventListener('mousedown', onMouseDownPage, true)
        })

        onBeforeUnmount(() => {
            document.body.removeEventListener('mousedown', onMouseDownPage, true)
        })

        dropdownServiceProvider.provider({ onClick: methods.hide })
        return () => (
            <div class={classes.value} style={styles.value} ref={el}>
                { state.options.content() }
            </div>
        )
    }
})

export const DropdownOption = defineComponent({
    props: {
        label: { type: String, required: true },
        icon: { type: String }
    },
    emits: {
        click: (e: MouseEvent) => true
    },
    setup(props, ctx) {

        const { onClick: dropDownClick } = dropdownServiceProvider.inject()

        const handle = {
            onClick: (e: MouseEvent) => {
                ctx.emit('click', e)
                dropDownClick()
            }
        }

        return () => (
            <div class="dropdown-option" {...handle}>
                <i class={`iconfont ${props.icon}`}></i>
                <span>{ props.label }</span>
            </div>
        )
    }
})

export const $$dropdown = (() => {
    let ins: any
    return (options: DropdownServiceOptions) => {
        if (!ins) {
            const el = document.createElement('div')
            document.body.appendChild(el)
            const app = createApp(ServiceComponent, { options })
            // app.component('DropdownOption', DropdownOption)
            ins = app.mount(el)
        }
        ins.service(options)
    }
})()

export const dropdownOptionContent = (e: MouseEvent, block: VisualEditorBlockData, useCommander: any, showBlockData: any, importBlockData: any) => {
    return {
        reference: e,
        content: () => (
            <div>
                <DropdownOption label="置顶节点" icon="icon-place-top" {...{onClick: useCommander.placeTop}}></DropdownOption>
                <DropdownOption label="置底节点" icon="icon-place-bottom" {...{onClick: useCommander.placeBottom}}></DropdownOption>
                <DropdownOption label="删除节点" icon="icon-delete" {...{onClick: useCommander.delete}}></DropdownOption>
                <DropdownOption label="查看数据" icon="icon-browse" {...{onClick: () => showBlockData(block)}}></DropdownOption>
                <DropdownOption label="导入节点" icon="icon-import" {...{onClick: () => importBlockData(block)}}></DropdownOption>
            </div>
        )
    }
}