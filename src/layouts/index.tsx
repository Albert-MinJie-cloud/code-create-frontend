import { Layout } from 'antd'
import type { MenuProps } from 'antd'
import { Outlet } from 'react-router-dom'
import GlobalHeader from '@/components/GlobalHeader'
import GlobalFooter from '@/components/GlobalFooter'
import styles from './index.module.css'

const { Content } = Layout

interface BasicLayoutProps {
  menuItems?: MenuProps['items']
}

const BasicLayout = ({ menuItems }: BasicLayoutProps) => {
  return (
    <Layout className={styles.layout}>
      <GlobalHeader menuItems={menuItems} />
      <Content className={styles.content}>
        <Outlet />
      </Content>
      <GlobalFooter />
    </Layout>
  )
}

export default BasicLayout
