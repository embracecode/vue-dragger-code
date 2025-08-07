import { createColorProps, createInputProps, createSelectProps } from "./packages/visualEditor.props";
import { createVisualEditorConfig } from "./packages/visualEditor.utils";
import { ElButton, ElInput } from "element-plus";
export const visualConfig = createVisualEditorConfig()

visualConfig.register('text', {
    label: '文本',
    preview: () => <div>预览文本</div>,
    render: () => <div>渲染文本</div>,
    props: {
        text: createInputProps('显示文本'),
        color: createColorProps('文本颜色'),
        size: createSelectProps('字体大小', [
            { label: '14px', value: '14px' },
            { label: '16px', value: '16px' },
            { label: '18px', value: '18px' }
        ])
    }
})
visualConfig.register('button', {
    label: '按钮',
    preview: () => <ElButton>按钮</ElButton>,
    render: () => <ElButton>渲染按钮</ElButton>,
    props: {
        text: createInputProps('显示文本'),
        type: createSelectProps('按钮类型', [
            { label: '主要', value: 'primary' },
            { label: '成功', value: 'success' },
            { label: '信息', value: 'info' },
            { label: '警告', value: 'warning' },
            { label: '危险', value: 'danger' },
            { label: '文本', value: 'text' }
        ]),
        size: createSelectProps('按钮大小', [
            { label: '默认', value: '' },
            { label: '中等', value: 'medium' },
            { label: '小型', value: 'small' },
            { label: '迷你', value: 'mini' }
        ])
    }
})
visualConfig.register('input', {
    label: '输入框',
    preview: () => <ElInput/>,
    render: () => <ElInput/>
})