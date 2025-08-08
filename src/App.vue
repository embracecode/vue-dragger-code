<template>
    <VisualEditor v-model="jsonData" :config="visualConfigData"></VisualEditor>
</template>

<script setup lang="ts">
import { reactive } from 'vue'
import VisualEditor from './packages/visualEditor.vue'
import { visualConfig } from './visualConfig'
import JsonDataZindex from './edit-data.json'
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
const visualConfigData = reactive(visualConfig)
</script>

<style scoped></style>
