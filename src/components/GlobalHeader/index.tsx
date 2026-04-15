import { Layout, Menu, Button, Switch, theme } from 'antd'
import { useNavigate } from 'react-router-dom'
import { MoonOutlined, SunOutlined } from '@ant-design/icons'
import type { MenuProps } from 'antd'
import logo from '@/assets/react.svg'
import { useThemeStore } from '@/store/themeStore'

import styles from './index.module.css'

const { Header } = Layout

interface GlobalHeaderProps {
  menuItems?: MenuProps['items']
}

const GlobalHeader = ({ menuItems }: GlobalHeaderProps) => {
  const { themeStore, toggleTheme } = useThemeStore()
  const navigate = useNavigate()
  const {
    token: { colorBgContainer },
  } = theme.useToken()

  const defaultMenuItems: MenuProps['items'] = [
    {
      key: 'home',
      label: '首页',
      onClick: () => {
        navigate('/')
      },
    },
    {
      key: 'about',
      label: '关于',
      onClick: () => {
        navigate('/about')
      },
    },
    {
      key: 'dashboard',
      label: '看板',
      onClick: () => {
        navigate('/dashboard')
      },
    },
  ]

  return (
    <Header className={styles.header} style={{ background: colorBgContainer }}>
      <div className={styles.logoContainer}>
        <img src={logo} alt="logo" className={styles.logo} />
        <span className={styles.title}>Code Create</span>
      </div>
      <Menu
        mode="horizontal"
        defaultSelectedKeys={['home']}
        items={menuItems || defaultMenuItems}
        className={styles.menu}
      />
      <Switch
        checked={themeStore === 'dark'}
        onChange={toggleTheme}
        checkedChildren={<MoonOutlined />}
        unCheckedChildren={<SunOutlined />}
        className={styles.themeSwitch}
      />
      <Button type="primary" className={styles.loginButton}>
        登录
      </Button>
    </Header>
  )
}

export default GlobalHeader
