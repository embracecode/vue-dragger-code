import { createColorProps, createInputProps, createSelectProps, createTableProps } from "./packages/visualEditor.props";
import { createVisualEditorConfig } from "./packages/visualEditor.utils";
import { ElButton, ElInput, ElOption, ElSelect } from "element-plus";
export const visualConfig = createVisualEditorConfig()

visualConfig.register('text', {
    label: '文本',
    preview: () => <div>预览文本</div>,
    render: ({ props }) => <span style={{ color: props.color, fontSize: props.size }}>{ props.text || '默认文本' }</span>,
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
    render: ({ props }) => <ElButton type={props.type} size={props.size}>{ props.text || '按钮' }</ElButton>,
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

visualConfig.register('select', {
    label: '下拉框',
    preview: () => <ElSelect></ElSelect>,
    render: ({ props }) => <ElSelect>
        {
            (props.options || []).map((item: { label: string, field: string }) => <ElOption key={item.field} label={item.label} value={item.field}></ElOption>)
        }
    </ElSelect>,
    props: {
        options: createTableProps('下拉框', {
            options: [
                { label: '显示文本', field: 'label' },
                { label: '绑定字段', field: 'field' },
                { label: '备注', field: 'comments'},
            ],
            showKey: 'label'
        })
    }
})

visualConfig.register('input', {
    label: '输入框',
    preview: () => <ElInput/>,
    render: ( { model } ) => {
        console.log(model, 'input')
        return <ElInput {...model.default}></ElInput>
    },
    model: {
        default: '绑定字段'
    }
})