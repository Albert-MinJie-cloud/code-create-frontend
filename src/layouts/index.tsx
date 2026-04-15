import { Layout, ConfigProvider, theme } from 'antd'
import type { MenuProps } from 'antd'
import { Outlet } from 'react-router-dom'
import GlobalHeader from '@/components/GlobalHeader'
import GlobalFooter from '@/components/GlobalFooter'
import { useThemeStore } from '@/store/themeStore'
import styles from './index.module.css'

const { Content } = Layout

interface BasicLayoutProps {
  menuItems?: MenuProps['items']
}

const BasicLayout = ({ menuItems }: BasicLayoutProps) => {
  const currentTheme = useThemeStore(state => state.themeStore)

  return (
    <ConfigProvider
      theme={{
        algorithm:
          currentTheme === 'dark'
            ? theme.darkAlgorithm
            : theme.defaultAlgorithm,
      }}
    >
      <Layout className={styles.layout}>
        <GlobalHeader menuItems={menuItems} />
        <Content className={styles.content}>
          <Outlet />
        </Content>
        <GlobalFooter />
      </Layout>
    </ConfigProvider>
  )
}

export default BasicLayout
