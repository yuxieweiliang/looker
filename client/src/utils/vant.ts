import type { App } from 'vue'

// Vant Weapp 是通过 easycom 自动引入的
// 这里可以放置全局 Vant 相关配置
export function setupVant(_app: App) {
  // Vant 组件通过 easycom 模式自动引入
  // 无需手动注册
  console.log('Vant Weapp 已配置')
}
