// 生产环境的插件
import type { Plugin } from 'vite'
import esbuild from 'esbuild'
import fs from 'node:fs'
import * as electronBuild from 'electron-builder'
import path from 'node:path'

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

// 打包需要等vite 打完包之后有了index.html 文件   再对electron 打包
export const ElectronBuilderPlugin = (): Plugin => {
    return {
        name: 'electron-builder',
        // vite 打完包之后
        closeBundle() {
            // 为了解决项目直接 npm run build 时没有dist文件  所以在这打包一次主进程文件
            buildBackground()

            // electron-builder 需要指定package.json main
            const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf-8'))
            packageJson.main = 'background.js'
            packageJson.dependencies = {} // 在electron 中打包时会有 unable to parse `path` during `tree.dependencies` reduce 报错
            fs.writeFileSync('dist/package.json', JSON.stringify(packageJson))
            // electron bug 他会给你下载垃圾文件 创建一个假的node_modules 文件 就能解决这个问题
            fs.mkdirSync('dist/node_modules')

            electronBuild.build({
                config: {
                    appId: 'com.vue-dragger-code.app',
                    productName: 'vue-dragger-code',
                    directories: {
                        output: path.resolve(process.cwd(), 'release'),
                        app: path.resolve(process.cwd(), 'dist')
                    },
                    asar: true, // 打包成一个压缩包
                    nsis: {
                        oneClick: false, // 是否一键安装
                        allowToChangeInstallationDirectory: true, // 允许修改安装目录
                    }, // 安装时的配置
                }
            })
        }
    }
}