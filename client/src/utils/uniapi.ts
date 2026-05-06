// 封装 UniApp API 调用
export function request<T>(options: UniApp.RequestOptions): Promise<T> {
  return new Promise((resolve, reject) => {
    uni.request({
      ...options,
      success: (res) => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve(res.data as T)
        } else {
          reject(res)
        }
      },
      fail: reject
    })
  })
}

// 显示提示
export function showToast(title: string, icon: 'success' | 'loading' | 'error' | 'none' = 'none') {
  uni.showToast({
    title,
    icon,
    duration: 2000
  })
}

// 显示加载
export function showLoading(title: string = '加载中...') {
  uni.showLoading({
    title,
    mask: true
  })
}

// 隐藏加载
export function hideLoading() {
  uni.hideLoading()
}

// 获取系统信息
export function getSystemInfo(): UniApp.GetSystemInfoResult {
  return uni.getSystemInfoSync()
}

// 获取系统信息（响应式 hook）
export function useSystemInfo() {
  const systemInfo = uni.getSystemInfoSync()
  // 状态栏高度（单位 px）
  const statusBarHeight = systemInfo.statusBarHeight || 0
  // 导航栏内容高度（不含状态栏）
  const navContentHeight = 44
  // 导航栏总高度（状态栏 + 内容）
  const navbarHeight = statusBarHeight + navContentHeight

  return {
    statusBarHeight,
    navbarHeight,
    navContentHeight,
    systemInfo
  }
}

// 跳转页面
export function navigateTo(url: string) {
  uni.navigateTo({ url })
}

export function redirectTo(url: string) {
  uni.redirectTo({ url })
}

export function switchTab(url: string) {
  uni.switchTab({ url })
}
