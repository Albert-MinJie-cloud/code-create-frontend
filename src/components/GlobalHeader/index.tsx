import { Layout, Menu, Button, Switch, theme } from 'antd'
import { useNavigate, useLocation } from 'react-router-dom'
import { MoonOutlined, SunOutlined } from '@ant-design/icons'
import type { MenuProps } from 'antd'
import logo from '@/assets/react.svg'
import { useThemeStore } from '@/store/themeStore'
import { useAuthStore } from '@/store/authStore'

import styles from './index.module.css'

const { Header } = Layout

interface GlobalHeaderProps {
  menuItems?: MenuProps['items']
}

const GlobalHeader = ({ menuItems }: GlobalHeaderProps) => {
  const { themeStore, toggleTheme } = useThemeStore()
  const { isAuthenticated, user, logout } = useAuthStore()
  const navigate = useNavigate()
  const location = useLocation()
  const {
    token: { colorBgContainer },
  } = theme.useToken()

  // 根据当前路径获取选中的菜单项
  const getSelectedKey = () => {
    const path = location.pathname
    if (path === '/') return ['home']
    if (path === '/about') return ['about']
    if (path === '/dashboard') return ['dashboard']
    return []
  }

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

  const handleAuthAction = () => {
    if (isAuthenticated) {
      logout()
      navigate('/')
    } else {
      navigate('/login')
    }
  }

  return (
    <Header className={styles.header} style={{ background: colorBgContainer }}>
      <div className={styles.logoContainer}>
        <img src={logo} alt="logo" className={styles.logo} />
        <span className={styles.title}>Code Create</span>
      </div>
      <Menu
        mode="horizontal"
        selectedKeys={getSelectedKey()}
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
      <Button
        type="primary"
        className={styles.loginButton}
        onClick={handleAuthAction}
      >
        {isAuthenticated ? `${user?.name} (登出)` : '登录'}
      </Button>
    </Header>
  )
}

export default GlobalHeader
