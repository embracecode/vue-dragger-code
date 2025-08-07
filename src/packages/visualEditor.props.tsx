export enum VisualEditorPropsType {
    input = 'input',
    color = 'color',
    select = 'select'
}

export type VisualEditorProps = {
    type: VisualEditorPropsType
    label: string,
} & {
    options?: VisualEditorSelectOptions
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
