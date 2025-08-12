import { defineComponent, watch } from 'vue'
import './number-range.scss'
import { useModel } from '@/packages/utils/useModel'
import { ElInput } from 'element-plus'


export const NumberRangeComponent = defineComponent({
    props: {
        start: {type: [String, Number], required: true, default: ''},
        end: {type: [String, Number], required: true, default: ''}
    },
    emits: {
        'update:start': (value: any) => true,
        'update:end': (value: any) => true
    },
    setup(props, { emit }) {

        // @ts-ignore
        const startModel = useModel(() => props.start, value => emit('update:start', value))
        // @ts-ignore
        const endModel = useModel(() => props.end, value => emit('update:end', value))

        watch(() => props.start, val => {
            console.log(val, 'props.start')
        })
        watch(() => props.end, val => {
            console.log(val, 'props.end')
        })

        return () => (
            <div class="number-range">
                <ElInput type='number' v-model={startModel.value}></ElInput>
                <div class={'line'}>-</div>
                <ElInput type='number' v-model={endModel.value}></ElInput>
            </div>
        )
    }
})