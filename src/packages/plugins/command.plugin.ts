import { onUnmounted, reactive } from "vue"
import { KeyboardCode } from "./keyboard-code"
import { debounce, throttle } from 'lodash'

export interface CommandExecute {
    undo?: () => void,
    redo: () => void
}

export interface Command {
    name: string, // 命令唯一标识符
    keyBoard?: string | string[], // 命令的快捷键
    execute: (...args: any[]) => CommandExecute, // 命令被执行的时候 要做的事情
    followQueue?: boolean, // 命令执行完成后 是否要将命令执行得到的 undo redo 放入到命令队列
    init?: () => (() => void | undefined), // 命令初始化函数
    data?: any
}

export function useCommander() {
    const state = reactive({
        cuccentIndex: -1, // 当前命令的下标
        queue: [] as CommandExecute[], // 命令队列
        commands: {} as Record<string, (...args: any[]) => void>, // 命令对象 方便通过命令的名称调用命令的execute函数
        commandArray: [] as Command[], // 命令对象数组
        destoryList: [] as (() => void | undefined)[] // 组件销毁时需要调用函数
    })
    
    const keyBoardEvent = (() => {
        const onKeydown = (e: KeyboardEvent) => {
            if (document.activeElement !== document.body) return
            const { keyCode, shiftKey, ctrlKey, altKey, metaKey } = e
            let keyStr: string[] = []
            if (ctrlKey || metaKey) keyStr.push('ctrl')
            if (shiftKey) keyStr.push('shift')
            if (altKey) keyStr.push('alt')
            keyStr.push(KeyboardCode[keyCode])
            const keyNames = keyStr.join('+')
            console.log(keyNames, 'keyNames')
            state.commandArray.forEach(command => {
                const { keyBoard, name } = command
                if (!keyBoard) return
                const keys = Array.isArray(keyBoard) ? keyBoard : [keyBoard]
                if (keys.indexOf(keyNames) > -1) {
                    e.stopPropagation()
                    e.preventDefault()
                    state.commands[name]()
                }
            })
        }
        // 想着用
        const onKeydownDebounce = throttle(onKeydown, 100)
        const init = () => {
            window.addEventListener('keydown', onKeydownDebounce)
            return () => window.removeEventListener('keydown', onKeydownDebounce)
        }
        return init
    })()

    // useCommander初始化函数，负责初始化键盘监听事件，调用命令的初始化逻辑
    const init = () => {
        const onKeydown = (e: KeyboardEvent) => {
            
        }
        window.addEventListener('keydown', onKeydown)
        state.commandArray.forEach(command => {
            !!command.init && state.destoryList.push(command.init())
        })
        state.destoryList.push(keyBoardEvent())
        state.destoryList.push(() => window.removeEventListener('keydown', onKeydown))
    }
    const registerCommand = (command: Command) => {
        state.commandArray.push(command)
        state.commands[command.name] = (...args) => {
            const { undo, redo } = command.execute(...args)
            redo()
            // 如果命令执行后不需要进入命令队列 则直接结束
            if (command.followQueue === false) {
                return
                // state.queue.push({ undo, redo })
                // state.cuccentIndex += 1
            }
            // redo()
            // 否则将命令队列中的命令去除 
            let { queue, cuccentIndex } = state
            if (queue.length > 0) {
                queue = queue.slice(0, cuccentIndex + 1)
                state.queue = queue
            }
            queue.push({ undo, redo })
            state.cuccentIndex = cuccentIndex + 1
            // redo()
        }
    }
    registerCommand({
        name: 'undo',
        keyBoard: 'ctrl+z',
        followQueue: false,
        execute: () => {
            // 命令被执行的时候 要做的事情
            return {
                redo: () => {
                    // 将要做的事情还原
                    if (state.cuccentIndex === -1) return
                    const queueItem = state.queue[state.cuccentIndex]
                    // console.log('queueItem',queueItem)
                    if (!!queueItem) {
                        !!queueItem.undo && queueItem.undo()
                        state.cuccentIndex--
                    }
                }
            }
        }
    })
    registerCommand({
        name: 'redo',
        keyBoard: ['ctrl+y', 'ctrl+shift+z'],
        followQueue: false,
        execute: () => {
            return {
                redo: () => {
                    const queueItem = state.queue[state.cuccentIndex + 1]
                    if (!!queueItem) {
                        queueItem.redo()
                        state.cuccentIndex++
                    }
                }
            }
        }
    })

    onUnmounted(() => {
        state.destoryList.forEach(item => !!item && item())
    })
    return {
        state,
        registerCommand,
        init
    }
}