import { createSSRApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'

// 导入全局组件
import AppIcon from './components/AppIcon.vue'
import AppLoading from './components/AppLoading.vue'

export function createApp() {
  const app = createSSRApp(App)
  const pinia = createPinia()

  // 注册 Pinia
  app.use(pinia)

  // 注册全局组件
  app.component('AppIcon', AppIcon)
  app.component('AppLoading', AppLoading)

  return {
    app
  }
}
