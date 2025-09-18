import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import vueDevTools from 'vite-plugin-vue-devtools'
import { ElectronDevPlugin } from './electronplugin/vite.electron.dev'
import { ElectronBuilderPlugin } from './electronplugin/vite.eletron.builder'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    vueJsx(),
    vueDevTools(),
    // ElectronDevPlugin(),
    // ElectronBuilderPlugin()
  ],
  base: './', // 默认是绝对路径 / 这里改成相对路径 ./ 不然会白屏
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    },
  },
})
