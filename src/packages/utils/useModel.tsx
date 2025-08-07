import { ref, watch } from "vue"

export function useModel<T>(getter: () => T, emitter: (value: T) => void) {
    const modelValue = ref(getter())

    watch(getter, val => {
        if (val !== modelValue.value) {
            modelValue.value = val
        }
    })

    return {
        get value() {
            return modelValue.value
        },
        set value(value: T) {
            if (modelValue.value !== value) {
                modelValue.value = value
                emitter(value)
            }
        }
    }
}