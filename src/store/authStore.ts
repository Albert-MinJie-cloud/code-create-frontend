import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface AuthState {
  isAuthenticated: boolean
  user: { name: string; role: string } | null
  token: string | null
  login: (username: string, password: string) => Promise<boolean>
  logout: () => void
  setToken: (token: string) => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    set => ({
      isAuthenticated: false,
      user: null,
      token: null,
      login: async (username: string, password: string) => {
        // 模拟登录逻辑，实际项目中应该调用 API
        if (username === 'admin' && password === 'admin') {
          const mockToken = 'mock-jwt-token-' + Date.now()
          set({
            isAuthenticated: true,
            user: { name: 'Admin', role: 'admin' },
            token: mockToken,
          })
          return true
        }
        return false
      },
      logout: () => {
        set({ isAuthenticated: false, user: null, token: null })
      },
      setToken: (token: string) => {
        set({ token })
      },
    }),
    {
      name: 'auth-storage',
    }
  )
)
