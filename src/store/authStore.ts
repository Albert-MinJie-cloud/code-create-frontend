import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface AuthState {
  isAuthenticated: boolean
  user: { name: string; role: string } | null
  login: (username: string, password: string) => Promise<boolean>
  logout: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    set => ({
      isAuthenticated: false,
      user: null,
      login: async (username: string, password: string) => {
        // 模拟登录逻辑，实际项目中应该调用 API
        if (username === 'admin' && password === 'admin') {
          set({
            isAuthenticated: true,
            user: { name: 'Admin', role: 'admin' },
          })
          return true
        }
        return false
      },
      logout: () => {
        set({ isAuthenticated: false, user: null })
      },
    }),
    {
      name: 'auth-storage',
    }
  )
)
