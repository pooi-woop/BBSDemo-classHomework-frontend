import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'

import App from './App.vue'
import router from './router'

const app = createApp(App)

// Element Plus 全局配置
app.use(ElementPlus)

// 创建pinia实例并使用
const pinia = createPinia()
app.use(pinia)
app.use(router)

app.mount('#app')
