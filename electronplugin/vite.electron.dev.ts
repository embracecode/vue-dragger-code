// 开发环境的插件

import type { Plugin } from 'vite'
import type { AddressInfo } from 'node:net'
import { spawn } from 'child_process'
import esbuild from 'esbuild'
import fs from 'node:fs'


const buildBackground = () => {
    esbuild.buildSync({
        entryPoints: ['src/background.ts'],
        bundle: true,
        platform: 'node',
        outfile: 'dist/background.js', // 输出文件
        target: 'node12',
        format: 'esm',
        external: ['electron']
    })
}

// vite插件要求 必须导出一个对象 且对象有个name属性
// 在这个对象中有许多钩子函数
export const ElectronDevPlugin = (): Plugin => {
    return {
        name: 'electron-dev',
        // 用于配置开发服务的钩子
        configureServer(server) {
            server?.httpServer?.once('listening', async () => {
                // vite 自带esbuild 把ts 文件编译成js
                buildBackground()

                // 读取vite 服务的信息
                const addressInfo = server.httpServer?.address() as AddressInfo
                //拼接IP地址  给electron启动服务的时候要用
                const host = `http://localhost:${addressInfo.port}` 

                // 开启electron进程
                // 第一个参数是eletron的入口文件
                // electron 不认识ts 文件 需要把文件编译成js
                // 进程传参法  把electron进程的端口号传过去

                const electronPath = await import('electron')
                // electronPath.default 返回的是一个路径
                // 进程传参 第一个是文件路径 然后是host地址
                // @ts-ignore
                let electronProcess = spawn(electronPath.default, ['dist/background.js', host])
                console.log(electronProcess, 'electronProcess');
                // 监听electron 主进程文件变化 变化之后就重新打包
                fs.watchFile('src/background.ts', () => {

                    // @ts-ignore
                    electronProcess.kill() // 杀掉之前的进程
                    buildBackground()
                    // @ts-ignore
                    electronProcess = spawn(electronPath.default, ['dist/background.js', host])
                })
                // @ts-ignore
                electronProcess.stderr.on('data', data => {
                    console.log(data.toString(), 'data electronProcess.stderr.on');
                })
                // import('electron').then(electron => {
                //     console.log(electron, 'electron.default');
                //     // spawn(electron.default, ['dist/background.js', host])
                // }).catch(err => {
                //     console.log(err, 'err');
                // })
                // console.log(addressInfo.port, 'addressInfo');
            })
        }
    }
}
