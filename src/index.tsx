import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider } from 'react-router-dom'
import { ConfigProvider, theme } from 'antd'
import zhCN from 'antd/locale/zh_CN'
import { useThemeStore } from '@/store/themeStore'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import router from '@/router'
import '@/styles/global.css'

export const APP = () => {
  const currentTheme = useThemeStore(state => state.themeStore)

  console.log('antd-theme', { theme })

  return (
    <StrictMode>
      <ErrorBoundary>
        <ConfigProvider
          locale={zhCN}
          theme={{
            algorithm:
              currentTheme === 'dark'
                ? theme.darkAlgorithm
                : theme.defaultAlgorithm,
          }}
        >
          <RouterProvider router={router} />
        </ConfigProvider>
      </ErrorBoundary>
    </StrictMode>
  )
}

createRoot(document.getElementById('root')!).render(<APP />)
