import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
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
import { register } from '@/api'
import { Logo } from '@/components/Logo'

import styles from './index.module.css'

const { Title, Text, Link } = Typography

interface RegisterForm {
  userAccount: string
  userPassword: string
  checkPassword: string
}

export default function Register() {
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async (values: RegisterForm) => {
    setLoading(true)
    try {
      const res = await register(values)
      if (res.code === 0 && res.data) {
        message.success('注册成功，请登录')
        navigate('/login')
      } else {
        message.error(res.message || '注册失败')
      }
    } catch (error) {
      console.error(error)
      message.error('注册失败，请稍后重试')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Layout>
      <div className={styles.container}>
        <Card className={styles.registerBox}>
          <Space vertical size={24} className={styles.content}>
            {/* Logo 和标题 */}
            <div className={styles.header}>
              <Logo />
              <Title level={3} className={styles.title}>
                欢迎注册
              </Title>
              <Text type="secondary" className={styles.subtitle}>
                Code Create 代码生成平台
              </Text>
            </div>

            {/* 注册表单 */}
            <Form
              name="register"
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
                  {
                    pattern: /^[a-zA-Z0-9_]+$/,
                    message: '账号只能包含字母、数字和下划线',
                  },
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
                  autoComplete="new-password"
                />
              </Form.Item>

              <Form.Item
                name="checkPassword"
                dependencies={['userPassword']}
                rules={[
                  { required: true, message: '请再次输入密码' },
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      if (!value || getFieldValue('userPassword') === value) {
                        return Promise.resolve()
                      }
                      return Promise.reject(new Error('两次输入的密码不一致'))
                    },
                  }),
                ]}
              >
                <Input.Password
                  prefix={<LockOutlined className={styles.inputIcon} />}
                  placeholder="请再次输入密码"
                  autoComplete="new-password"
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
                  注册
                </Button>
              </Form.Item>
            </Form>

            {/* 底部提示 */}
            <div className={styles.footer}>
              <Text type="secondary" className={styles.footerText}>
                已有账号？
                <Link href="/login" className={styles.link}>
                  立即登录
                </Link>
              </Text>
            </div>
          </Space>
        </Card>
      </div>
    </Layout>
  )
}
