
import { da } from "element-plus/es/locales.mjs";
import { useCommander } from "../plugins/command.plugin";
import type { VisualEditorBlockData, VisualEditorModelValue } from "../visualEditor.utils";
import deepcopy from 'deepcopy'
export function useVisualCommand(
    { focusData, updateDataModel, dataModel, dragStart, dragEnd }: {
        focusData: { value: { focus: VisualEditorBlockData[], unFocus: VisualEditorBlockData[] } },
        updateDataModel: (value: VisualEditorBlockData[]) => void,
        dataModel: { value: VisualEditorModelValue },
        dragStart: { on: (cb: () => void) => void, off: (cb: () => void) => void },
        dragEnd: { on: (cb: () => void) => void, off: (cb: () => void) => void }
    }
) {
    const commander = useCommander()


    commander.registerCommand({
        name: 'delete',
        keyBoard: [
            'space',
            'delete',
            'ctrl+d'
        ],
        execute: () => {
            let data = {
                before: dataModel.value.blocks || [],
                after: focusData.value.unFocus
            }
            return {
                undo: () => {
                    updateDataModel(deepcopy(data.before))
                    
                },
                redo: () => {
                    updateDataModel(deepcopy(data.after))
                }
            }
        }
    })

    commander.registerCommand({
        name: 'clear',
        keyBoard: [],
        execute: () => {
            let data = {
                before: dataModel.value.blocks || [],
                after: []
            }
            return {
                undo: () => {
                    updateDataModel(deepcopy(data.before))
                },
                redo: () => {
                    updateDataModel(deepcopy(data.after))
                }
            }
        }
    })

    commander.registerCommand({
        name: 'drag',
        init(){
            this.data = {
                before: null as null | VisualEditorBlockData[],
                after: null as null | VisualEditorBlockData[]
            }
            const handler = {
                dragstart: () => {
                    this.data.before = deepcopy(dataModel.value.blocks || [])
                },
                dragend: () => commander.state.commands.drag()
            }
            dragStart.on(handler.dragstart)
            dragEnd.on(handler.dragend)
            return () => {
                dragStart.off(handler.dragstart)
                dragEnd.off(handler.dragend)
            }
        },
        execute() {
            let before = this.data.before
            let after = deepcopy(dataModel.value.blocks || [])
            return {
                undo: () => {
                    updateDataModel(deepcopy(before))
                },
                redo: () => {
                    updateDataModel(deepcopy(after))
                }
            }
        }
    })

    commander.registerCommand({
        name: 'placeTop',
        keyBoard: 'ctrl+up',
        execute: () => {
            let data = {
                before: deepcopy(dataModel.value.blocks || []),
                after: deepcopy((() => {
                    const { focus, unFocus } = focusData.value
                    const maxZIndex = Math.max(...unFocus.map(item => item.zIndex || 0), -Infinity) + 1
                    focus.forEach(item => item.zIndex = maxZIndex)
                    return dataModel.value.blocks || []
                })())
            }
            return {
                undo: () => {
                    updateDataModel(deepcopy(data.before))
                },
                redo: () => {
                    updateDataModel(deepcopy(data.after))
                }
            }
        }
    })

    commander.registerCommand({
        name: 'placeBottom',
        keyBoard: 'ctrl+down',
        execute: () => {
            let data = {
                before: deepcopy(dataModel.value.blocks || []),
                after: deepcopy((() => {
                    const { focus, unFocus } = focusData.value
                    let minZIndex = Math.min(...unFocus.map(item => item.zIndex || 0), Infinity) - 1
                    if (minZIndex < 0) {
                        const dur = Math.abs(minZIndex)
                        unFocus.forEach(item => item.zIndex = item.zIndex || 0 + dur)
                        minZIndex = 0
                    }
                    focus.forEach(item => item.zIndex = minZIndex)
                    return dataModel.value.blocks || []
                })())
            }
            return {
                undo: () => {
                    updateDataModel(deepcopy(data.before))
                },
                redo: () => {
                    updateDataModel(deepcopy(data.after))
                }
            }
        }
    })

    commander.registerCommand({
        name: 'updateBlock',
        execute: (block: VisualEditorBlockData, oldBlock: VisualEditorBlockData) => {
            let blocks = deepcopy(dataModel.value.blocks || [])
            let data = {
                before: blocks,
                after: (() => {
                    blocks = [...blocks]
                    const index = dataModel.value.blocks.indexOf(oldBlock)
                    if (index > -1) {
                        blocks.splice(index, 1, block)
                    }
                    return deepcopy(blocks)
                })()
            }
            return {
                undo: () => {
                    updateDataModel(deepcopy(data.before))
                },
                redo: () => {
                    updateDataModel(deepcopy(data.after))
                }
            }
        }
    })

    commander.registerCommand({
        name: 'updateModelValue',
        execute: (value: VisualEditorModelValue) => {
            let data = {
                before: deepcopy(dataModel.value),
                after: deepcopy(value)
            }
            return {
                undo: () => {
                    dataModel.value = deepcopy(data.before)
                },
                redo: () => {
                    dataModel.value = deepcopy(data.after)
                }
            }
        }
    })

    commander.registerCommand({
        name: 'selectAll',
        keyBoard: 'ctrl+a',
        followQueue: false,
        execute: () => {
            return {
                redo: () => {
                    (dataModel.value.blocks || []).forEach(item => item.focus = true)
                }
            }
        }
    })

    commander.init()
    return {
        undo: () => commander.state.commands.undo(),
        redo: () => commander.state.commands.redo(),
        delete: () => commander.state.commands.delete(),
        clear: () => commander.state.commands.clear(),
        placeTop: () => commander.state.commands.placeTop(),
        placeBottom: () => commander.state.commands.placeBottom(),
        updateBlock: (block: VisualEditorBlockData, oldBlock: VisualEditorBlockData) => commander.state.commands.updateBlock(block, oldBlock),
        updateModelValue: (value: VisualEditorModelValue) => commander.state.commands.updateModelValue(value)
    }
}