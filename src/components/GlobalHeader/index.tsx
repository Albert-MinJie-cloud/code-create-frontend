import {
  Layout,
  Menu,
  Button,
  Switch,
  theme,
  message,
  Dropdown,
  Space,
} from 'antd'
import { useNavigate, useLocation } from 'react-router-dom'
import { MoonOutlined, SunOutlined, DownOutlined } from '@ant-design/icons'
import type { MenuProps } from 'antd'
import logo from '@/assets/react.svg'
import { useThemeStore } from '@/store/themeStore'
import { useAuthStore } from '@/store/authStore'

import { userLogout } from '@/api'

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

  const items: MenuProps['items'] = [
    {
      key: '1',
      label: '退出登陆',
      onClick: () => {
        userDoLogout()
      },
    },
    {
      key: '2',
      label: 'Profile',
    },
    {
      key: '3',
      label: 'Billing',
    },
  ]

  const userDoLogout = async () => {
    try {
      const res = await userLogout()
      if (res.code === 0) {
        logout()
        message.success('退出登陆成功')
        navigate('/')
      } else {
        message.error('退出登录失败' + res.message)
      }
    } catch (error) {
      console.log(error)
    }
  }

  const goLogin = () => {
    navigate('/login')
  }

  const renderUser = () => {
    if (isAuthenticated) {
      return (
        <Dropdown menu={{ items }}>
          <a onClick={e => e.preventDefault()}>
            <Space>
              {user?.userName}
              <DownOutlined />
            </Space>
          </a>
        </Dropdown>
      )
    }
    return (
      <Button type="primary" className={styles.loginButton} onClick={goLogin}>
        登录
      </Button>
    )
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

      {renderUser()}
    </Header>
  )
}

export default GlobalHeader
