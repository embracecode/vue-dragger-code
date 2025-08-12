<template>
    <VisualEditor v-model="jsonData" :formData="formData" :config="visualConfigData"></VisualEditor>
    <div style="text-align: center;padding-top: 30px;">
        {{ JSON.stringify(formData) }}
    </div>
    <!-- <NumberRangeComponent v-model:start="formData.startLevel" v-model:end="formData.endLevel"></NumberRangeComponent> -->
     <!-- <Children :config="state.config"></Children>
     <button @click="changeConfig">11111</button> -->
</template>

<script setup lang="ts">
import { reactive, ref, computed } from 'vue'
import VisualEditor from './packages/visualEditor.vue'
import { visualConfig } from './visualConfig'
import JsonDataZindex from './edit-data.json'
import { Children } from './packages/children'
import { NumberRangeComponent } from './packages/component/number-range/number-range'
const configOptions = [
    {
        key: 'abc',
        label: 'abc',
        options: {
            a: [1,2,3]
        }
    },
    {
        key: 'def',
        label: 'def',
        options: {
            a: [1,2,3, 45]
        }
    }
]
const state = reactive({
    config: computed(() => configOptions[stateIndex.value])
})
const stateIndex = ref(0)
 const changeConfig = () => {
     setTimeout(() => {
         stateIndex.value  = 1
     }, 0)
 }
// const jsonData = reactive({
//     container: {
//         width: 800,
//         height: 500
//     },
//     blocks: [{
//         top: 200,
//         left: 100,
//         componentKey: 'text'
//     }, {
//         top: 100,
//         left: 100,
//         componentKey: 'button'
//     }, {
//         top: 200,
//         left: 200,
//         componentKey: 'input'
//     }]
// })
const jsonData = reactive(JsonDataZindex)
const formData = reactive({
    startLevel: 0,
    endLevel: 0
})
const visualConfigData = reactive(visualConfig)
</script>

<style scoped>

</style>
