import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import {
  Form,
  Input,
  Button,
  message,
  Space,
  Typography,
  Layout,
  Card,
} from 'antd'
import { UserOutlined, LockOutlined } from '@ant-design/icons'
import { userLogin } from '@/api'
import { useAuthStore } from '@/store/authStore'
import { Logo } from '@/components/Logo'

import styles from './index.module.css'

const { Title, Text, Link } = Typography

interface LoginForm {
  userAccount: string
  userPassword: string
}

export default function Login() {
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()
  const { getLoginUser } = useAuthStore()

  const from = (location.state as { from?: string })?.from || '/'

  const handleSubmit = async (values: LoginForm) => {
    setLoading(true)
    try {
      const res = await userLogin(values)
      if (res.code === 0 && res.data) {
        await getLoginUser()
        message.success('登录成功')
        navigate(from, { replace: true })
      } else {
        message.error('登录失败' + res.message)
      }
    } catch (error) {
      console.log(error)
      message.error('登录失败，请稍后重试')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Layout>
      <div className={styles.container}>
        <Card className={styles.loginBox}>
          <Space vertical size={24} className={styles.content}>
            {/* Logo 和标题 */}
            <div className={styles.header}>
              <Logo />
              <Title level={3} className={styles.title}>
                欢迎登录
              </Title>
              <Text type="secondary" className={styles.subtitle}>
                Code Create 代码生成平台
              </Text>
            </div>

            {/* 登录表单 */}
            <Form
              name="login"
              onFinish={handleSubmit}
              autoComplete="off"
              size="large"
              className={styles.form}
            >
              <Form.Item
                name="userAccount"
                rules={[
                  { required: true, message: '请输入账号' },
                  { min: 4, message: '账号至少 4 个字符' },
                ]}
              >
                <Input
                  prefix={<UserOutlined className={styles.inputIcon} />}
                  placeholder="请输入账号"
                  autoComplete="username"
                />
              </Form.Item>

              <Form.Item
                name="userPassword"
                rules={[
                  { required: true, message: '请输入密码' },
                  { min: 8, message: '密码至少 8 个字符' },
                ]}
              >
                <Input.Password
                  prefix={<LockOutlined className={styles.inputIcon} />}
                  placeholder="请输入密码"
                  autoComplete="current-password"
                />
              </Form.Item>

              <Form.Item>
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={loading}
                  block
                  className={styles.submitBtn}
                >
                  登录
                </Button>
              </Form.Item>
            </Form>

            {/* 底部提示 */}
            <div className={styles.footer}>
              <Text type="secondary" className={styles.footerText}>
                还没有账号？
                <Link href="/register" className={styles.link}>
                  立即注册
                </Link>
              </Text>
            </div>
          </Space>
        </Card>
      </div>
    </Layout>
  )
}
