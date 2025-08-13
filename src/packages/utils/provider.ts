import { inject, provide } from "vue"

export interface VisualDragEvent {
    dragStart: {
        on: (cb: () => void) => void,
        off: (cb: () => void) => void,
        emit: () => void,
    },
    dragEnd: {
        on: (cb: () => void) => void,
        off: (cb: () => void) => void,
        emit: () => void,
    }
}
export const VisualDragProvider = (() => {
    const VISUAL_DRAG_PROVIDER = '@@VISUAL_DRAG_PROVIDER'
    return {
        provide: (data: VisualDragEvent ) => {
            provide(VISUAL_DRAG_PROVIDER, data)
        },
        inject: () => {
            return inject(VISUAL_DRAG_PROVIDER) as VisualDragEvent
        }
    }
})()