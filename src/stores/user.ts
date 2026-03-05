import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { userApi, authApi } from '@/services/userApi'
import { tokenManager } from '@/utils/auth'

// 用户类型定义
export interface User {
  id: string
  email: string
  nickname: string
  avatar?: string
  created_at: string
}

// 使用 Pinia 创建用户状态管理 Store
export const useUserStore = defineStore('user', () => {
  // ==================== State ====================
  // 当前用户信息
  const user = ref<User | null>(null)
  // 加载状态
  const isLoading = ref(false)
  // 错误信息
  const error = ref('')

  // ==================== Getters ====================
  // 是否已登录
  const isLoggedIn = computed(() => !!user.value && tokenManager.isAuthenticated())
  // 用户昵称（如果没有则显示邮箱前缀）
  const displayName = computed(() => {
    if (!user.value) return '未登录'
    return user.value.nickname || user.value.email.split('@')[0]
  })
  // 用户头像（如果没有则使用默认头像）
  const avatarUrl = computed(() => {
    return user.value?.avatar || 'https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png'
  })

  // ==================== Actions ====================
  // 获取用户信息
  async function fetchUserInfo() {
    if (!tokenManager.isAuthenticated()) {
      user.value = null
      return
    }

    try {
      isLoading.value = true
      error.value = ''
      const response = await userApi.getUserInfo()
      user.value = response
    } catch (err: any) {
      error.value = err.response?.data?.error || '获取用户信息失败'
      console.error('获取用户信息错误:', err)
      // 如果获取失败且是 401 错误，清除登录状态
      if (err.response?.status === 401) {
        logout()
      }
    } finally {
      isLoading.value = false
    }
  }

  // 更新用户信息
  async function updateUserInfo(data: { nickname?: string; avatar?: string }) {
    try {
      isLoading.value = true
      error.value = ''

      if (data.nickname) {
        await userApi.updateNickname({ nickname: data.nickname })
      }

      // 更新本地状态
      if (user.value) {
        user.value = { ...user.value, ...data }
      }

      return true
    } catch (err: any) {
      error.value = err.response?.data?.error || '更新用户信息失败'
      console.error('更新用户信息错误:', err)
      return false
    } finally {
      isLoading.value = false
    }
  }

  // 上传头像
  async function uploadUserAvatar(file: File) {
    try {
      isLoading.value = true
      error.value = ''

      const formData = new FormData()
      formData.append('avatar', file)

      const response = await userApi.uploadAvatar(formData)

      // 更新本地状态
      // 后端返回: { message: "...", avatar: "/uploads/..." }
      if (user.value && response.avatar) {
        user.value.avatar = response.avatar
      }

      return true
    } catch (err: any) {
      error.value = err.response?.data?.error || '上传头像失败'
      console.error('上传头像错误:', err)
      return false
    } finally {
      isLoading.value = false
    }
  }

  // 登录
  async function login(email: string, password: string) {
    try {
      isLoading.value = true
      error.value = ''

      const response = await authApi.login({ email, password })

      // 保存 refresh_token
      if (response.tokens?.refresh_token) {
        localStorage.setItem('refresh_token', response.tokens.refresh_token)
      }

      // 获取用户信息
      await fetchUserInfo()

      return true
    } catch (err: any) {
      error.value = err.response?.data?.error || '登录失败'
      console.error('登录错误:', err)
      return false
    } finally {
      isLoading.value = false
    }
  }

  // 登出
  async function logout() {
    try {
      const refreshToken = localStorage.getItem('refresh_token')
      if (refreshToken) {
        await authApi.logout({ refresh_token: refreshToken })
      }
    } catch (err) {
      console.error('登出错误:', err)
    } finally {
      // 清除本地状态
      user.value = null
      tokenManager.removeToken()
      localStorage.removeItem('refresh_token')
    }
  }

  // 初始化（应用启动时调用）
  async function init() {
    if (tokenManager.isAuthenticated()) {
      await fetchUserInfo()
    }
  }

  return {
    // State
    user,
    isLoading,
    error,
    // Getters
    isLoggedIn,
    displayName,
    avatarUrl,
    // Actions
    fetchUserInfo,
    updateUserInfo,
    uploadUserAvatar,
    login,
    logout,
    init
  }
})
