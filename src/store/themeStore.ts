import { create } from 'zustand'
import { persist } from 'zustand/middleware'

type Theme = 'light' | 'dark'

interface ThemeState {
  themeStore: Theme
  toggleTheme: () => void
  setTheme: (theme: Theme) => void
}

export const useThemeStore = create<ThemeState>()(
  persist(
    set => ({
      themeStore: 'light',
      toggleTheme: () =>
        set(state => ({
          themeStore: state.themeStore === 'light' ? 'dark' : 'light',
        })),
      setTheme: theme => set({ themeStore: theme }),
    }),
    {
      name: 'theme-storage',
    }
  )
)
