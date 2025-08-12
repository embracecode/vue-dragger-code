import { defineComponent } from "vue";

export const Children = defineComponent({
    props: {
        config: { type: Object, required: true }
    },
    setup(props, { slots }) {
        console.log(props.config, 'props.config')
        return () => (
            <>
                <div>
                    {props.config.options.a}
                </div>
            </>
        )
    }
})