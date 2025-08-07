import { createApp } from 'vue'
import App from './App.vue'
import './assets/css/reset.scss'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
const app = createApp(App)

app.use(ElementPlus)
app.mount('#app')
