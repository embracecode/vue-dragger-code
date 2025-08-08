import type { JSX } from "vue/jsx-runtime"
import type { VisualEditorProps } from "./visualEditor.props"

export interface VisualEditorBlockData {
    componentKey: string, // 组件key VisualEditorComponent.key
    top: number, // 坐标
    left: number, // 坐标
    adjustPosition?: boolean, // 是否需要调整拖拽放下时的位置
    focus?: boolean, // 当前是否选中状态
    zIndex: number, // z-index 做置顶效果和置底效果
    width: number, // 组件宽
    height: number, // 组件高
    hasResize?: boolean, // 是否调整过宽高
    props?: Record<string, any> // 组件的设计属性
}



export interface VisualEditorModelValue {
    container: {
        width: number,
        height: number
    },
    blocks: VisualEditorBlockData[]
}

export interface VisualEditorComponent {
    key: string,
    label: string,
    preview: () => JSX.Element,
    render: (data: { props: any }) => JSX.Element,
    props?: Record<string, VisualEditorProps>
}

export interface VisualEditorMarkLine {
    x: { left: number, showLeft: number }[],
    y: { top: number, showTop: number }[]
}

export function createNewBlock({ component, top, left } : {
    component: VisualEditorComponent,
    top: number,
    left: number
}): VisualEditorBlockData {
    return {
        top,
        left,
        componentKey: component!.key,
        adjustPosition: true,
        focus: false,
        zIndex: 0,
        width: 0,
        height: 0,
        hasResize: false,
        props: {}
    }
}
export function createVisualEditorConfig() {
    const componentList: VisualEditorComponent[] = []
    const componentMap: Record<string, VisualEditorComponent> = {}
    return {
        componentList,
        componentMap,
        register<Props extends Record<string, VisualEditorProps> = {}>(key: string, component: {
            label: string,
            preview: () => JSX.Element,
            render: (data: { props: { [key in keyof Props]: any } }) => JSX.Element,
            props?: Props
        }) {
            let comp = {...component, key}
            componentList.push(comp)
            componentMap[key] = comp
        }
    }
}
export type VisualEditorConfig = ReturnType<typeof createVisualEditorConfig>