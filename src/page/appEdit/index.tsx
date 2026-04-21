import { useState, useCallback, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  Card,
  Form,
  Input,
  Button,
  Space,
  message,
  Spin,
  InputNumber,
  Typography,
} from 'antd'
import {
  getMyAppById,
  getAppById,
  updateMyApp,
  updateApp,
} from '@/api/endpoints/app-controller'
import type { AppVO } from '@/api'
import { useAuthStore } from '@/store/authStore'

const { Title } = Typography

function AppEdit() {
  const { appId } = useParams<{ appId: string }>()
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const isAdmin = user?.userRole === 'admin'

  const [form] = Form.useForm()
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [app, setApp] = useState<AppVO | null>(null)

  const loadApp = useCallback(async () => {
    if (!appId) return
    setLoading(true)
    try {
      // 管理员用 getAppById，普通用户用 getMyAppById
      const res = isAdmin
        ? await getAppById({ id: appId as unknown as number })
        : await getMyAppById({ id: appId as unknown as number })

      if (res.code === 0 && res.data) {
        setApp(res.data as AppVO)
        if (isAdmin) {
          form.setFieldsValue({
            appName: res.data.appName,
            cover: (res.data as AppVO).cover,
            priority: (res.data as AppVO).priority,
          })
        } else {
          form.setFieldsValue({ appName: (res.data as AppVO).appName })
        }
      } else {
        message.error(res.message || '加载失败')
        navigate(-1)
      }
    } catch {
      message.error('加载应用信息失败')
      navigate(-1)
    } finally {
      setLoading(false)
    }
  }, [appId, isAdmin, form, navigate])

  useEffect(() => {
    void loadApp()
  }, [loadApp])

  const handleSubmit = useCallback(async () => {
    try {
      const values = await form.validateFields()
      setSubmitting(true)

      let res
      if (isAdmin) {
        res = await updateApp({
          id: appId as unknown as number,
          appName: values.appName,
          cover: values.cover,
          priority: values.priority,
        })
      } else {
        res = await updateMyApp({
          id: appId as unknown as number,
          appName: values.appName,
        })
      }

      if (res.code === 0) {
        message.success('保存成功')
        navigate(-1)
      } else {
        message.error(res.message || '保存失败')
      }
    } catch {
      // 表单校验失败
    } finally {
      setSubmitting(false)
    }
  }, [form, isAdmin, appId, navigate])

  if (loading) {
    return (
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: 300,
        }}
      >
        <Spin size="large" tip="加载中..." />
      </div>
    )
  }

  return (
    <Card style={{ maxWidth: 600, margin: '24px auto' }}>
      <Title level={4} style={{ marginBottom: 24 }}>
        编辑应用：{app?.appName}
      </Title>

      <Form form={form} layout="vertical">
        <Form.Item
          name="appName"
          label="应用名称"
          rules={[{ required: true, message: '请输入应用名称' }]}
        >
          <Input placeholder="请输入应用名称" maxLength={100} showCount />
        </Form.Item>

        {isAdmin && (
          <>
            <Form.Item name="cover" label="封面图URL">
              <Input placeholder="请输入封面图URL" />
            </Form.Item>
            <Form.Item name="priority" label="优先级">
              <InputNumber
                min={0}
                max={99}
                style={{ width: '100%' }}
                placeholder="0-99，数值越大越靠前"
              />
            </Form.Item>
          </>
        )}

        <Form.Item style={{ marginTop: 24 }}>
          <Space>
            <Button type="primary" loading={submitting} onClick={handleSubmit}>
              保存
            </Button>
            <Button onClick={() => navigate(-1)}>取消</Button>
          </Space>
        </Form.Item>
      </Form>
    </Card>
  )
}

export default AppEdit
