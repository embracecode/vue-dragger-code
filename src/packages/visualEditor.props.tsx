export enum VisualEditorPropsType {
    input = 'input',
    color = 'color',
    select = 'select',
    table = 'table'
}

export type VisualEditorProps = {
    type: VisualEditorPropsType
    label: string,
} & {
    options?: VisualEditorSelectOptions,
} & {
    table?: VisualEditorTableColumn
}

/**-----------------------------input------------------------------------------ */
export function createInputProps(label: string): VisualEditorProps {
    return {
        type: VisualEditorPropsType.input,
        label
    }
}
/**-----------------------------color------------------------------------------ */
export function createColorProps(label: string): VisualEditorProps {
    return {
        type: VisualEditorPropsType.color,
        label
    }
}

export type VisualEditorSelectOptions = {
    label: string,
    value: string
}[]

/**-----------------------------select------------------------------------------ */
export function createSelectProps(label: string, options: VisualEditorSelectOptions): VisualEditorProps {
    return {
        type: VisualEditorPropsType.select,
        label,
        options
    }
}

/**-----------------------------table------------------------------------------ */

export type VisualEditorTableColumn = {
    label: string, // 列显示的文本
    field: string, // 列绑定的字段
}[]

export function createTableProps(label: string, columns: VisualEditorTableColumn): VisualEditorProps {
    return {
        type: VisualEditorPropsType.table,
        label,
        table: columns
    }
}
