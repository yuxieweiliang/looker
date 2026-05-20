import type { ApiResponse } from '../types/user'

// HTTP 请求封装
export const request = <T>(options: {
  url: string
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE'
  data?: unknown
  header?: Record<string, string>
}): Promise<T> => {
  return new Promise((resolve, reject) => {
    const baseUrl = import.meta.env.VITE_API_BASE_URL || '/api/v1'
    const token = uni.getStorageSync('token')

    // 构建请求头，只在有 token 时添加 Authorization
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...options.header,
    }
    if (token) {
      headers.Authorization = `Bearer ${token}`
    }

    uni.request({
      url: `${baseUrl}${options.url}`,
      method: options.method || 'GET',
      data: options.data as string | AnyObject | ArrayBuffer | undefined,
      header: headers,
      success: (res) => {
        // 检测 HTTP 状态码 401
        if (res.statusCode === 401) {
          uni.removeStorageSync('token')
          uni.showModal({
            title: '登录已过期',
            content: '您的登录状态已过期，请重新登录',
            confirmText: '去登录',
            cancelText: '取消',
            success: (modalRes) => {
              if (modalRes.confirm) {
                uni.reLaunch({ url: '/pages/login/login' })
              }
            }
          })
          reject(new Error('Unauthorized'))
          return
        }

        const data = res.data as ApiResponse<T>
        if (data.code === 0 || data.code === 200) {
          resolve(data)
        } else {
          uni.showToast({
            title: data.message || '请求失败',
            icon: 'none',
          })
          reject(new Error(data.message))
        }
      },
      fail: (err) => {
        uni.showToast({
          title: '网络错误',
          icon: 'none',
        })
        reject(err)
      },
    })
  })
}

// GET 请求
export const get = <T>(url: string, params?: unknown): Promise<T> => {
  const queryString = params
    ? '?' +
      Object.entries(params)
        .map(([k, v]) => `${k}=${encodeURIComponent(String(v))}`)
        .join('&')
    : ''
  return request<T>({ url: url + queryString, method: 'GET' })
}

// POST 请求
export const post = <T>(url: string, data?: unknown): Promise<T> => {
  return request<T>({ url, method: 'POST', data })
}

// PUT 请求
export const put = <T>(url: string, data?: unknown): Promise<T> => {
  return request<T>({ url, method: 'PUT', data })
}

// DELETE 请求
export const del = <T>(url: string): Promise<T> => {
  return request<T>({ url, method: 'DELETE' })
}
