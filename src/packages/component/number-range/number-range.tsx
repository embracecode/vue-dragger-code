import { defineComponent } from 'vue'
import './number-range.scss'
import { useModel } from '@/packages/utils/useModel'
import { ElInput } from 'element-plus'


export const NumberRangeComponent = defineComponent({
    props: {
        start: {type: [String, Number], required: true},
        end: {type: [String, Number], required: true}
    },
    emits: {
        'update:start': (value: string) => true,
        'update:end': (value: string) => true
    },
    setup(props, { emit }) {

        // @ts-ignore
        const startModel = useModel(() => props.start, value => emit('update:start', value))
        // @ts-ignore
        const endModel = useModel(() => props.end, value => emit('update:end', value))

        return () => (
            <div class="number-range">
                <ElInput type='number' v-model={startModel.value}></ElInput>
                <div class={'line'}>-</div>
                <ElInput type='number' v-model={endModel.value}></ElInput>
            </div>
        )
    }
})