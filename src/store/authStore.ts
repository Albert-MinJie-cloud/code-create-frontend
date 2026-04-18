import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { getLoginUser } from '@/api/endpoints/user-controller'
import type { LoginUserVO } from '@/api/models'

interface AuthState {
  isAuthenticated: boolean
  user: LoginUserVO | null
  logout: () => void
  getLoginUser: () => Promise<boolean>
  setLoginUser: (newLoginUser: LoginUserVO) => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    set => ({
      isAuthenticated: false,
      user: null,

      // 获取登陆的用户信息
      getLoginUser: async () => {
        try {
          const response = await getLoginUser()
          if (response.code === 0 && response.data) {
            set({ isAuthenticated: true, user: response.data })
            return true
          }
          return false
        } catch (error) {
          console.error('getLoginUser失败:', error)
          return false
        }
      },

      // 设置登陆的用户信息
      setLoginUser: (newLoginUser: LoginUserVO) => {
        set({ isAuthenticated: true, user: newLoginUser })
      },

      // 退出登陆
      logout: () => {
        set({ isAuthenticated: false, user: null })
      },
    }),
    {
      name: 'auth-storage',
    }
  )
)
