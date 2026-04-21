import { useState, useCallback, useEffect, useRef } from 'react'
import { useParams, useSearchParams, useNavigate } from 'react-router-dom'
import {
  Button,
  Input,
  Typography,
  message,
  Spin,
  Layout,
  Avatar,
  theme,
  Modal,
} from 'antd'
import {
  SendOutlined,
  CloudUploadOutlined,
  RobotOutlined,
  UserOutlined,
  LinkOutlined,
} from '@ant-design/icons'
import { getMyAppById, deployApp } from '@/api/endpoints/app-controller'
import type { AppVO } from '@/api'
import styles from './index.module.css'

const { Header, Content } = Layout
const { Text, Title } = Typography

interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}

function AppChat() {
  const { appId } = useParams<{ appId: string }>()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const {
    token: { colorBgContainer, colorBorder, colorPrimary },
  } = theme.useToken()

  const [app, setApp] = useState<AppVO | null>(null)
  const [appLoading, setAppLoading] = useState(true)

  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [inputValue, setInputValue] = useState('')
  const [sending, setSending] = useState(false)
  const [aiStreaming, setAiStreaming] = useState(false)

  const [previewKey, setPreviewKey] = useState(0)
  const [showPreview, setShowPreview] = useState(false)
  const [streamCompleted, setStreamCompleted] = useState(false)

  const [deploying, setDeploying] = useState(false)
  const [deployedUrl, setDeployedUrl] = useState('')

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const hasSentInitPrompt = useRef(false)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const loadApp = useCallback(async () => {
    if (!appId) return
    setAppLoading(true)
    try {
      const res = await getMyAppById({ id: appId as unknown as number })
      if (res.code === 0 && res.data) {
        setApp(res.data)
        if (res.data.deployKey) {
          setShowPreview(true)
          setPreviewKey(k => k + 1)
        }
      } else {
        message.error(res.message || '加载应用失败')
        navigate('/')
      }
    } catch {
      message.error('加载应用失败')
      navigate('/')
    } finally {
      setAppLoading(false)
    }
  }, [appId, navigate])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void loadApp()
  }, [loadApp])

  // 流结束 + 应用 codeGenType 就绪 后，统一触发预览（确保 iframe URL 正确）
  useEffect(() => {
    if (streamCompleted && app?.codeGenType) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setShowPreview(true)
      setPreviewKey(k => k + 1)
      setStreamCompleted(false)
    }
  }, [streamCompleted, app?.codeGenType])

  const sendMessage = useCallback(
    async (text: string) => {
      if (!text.trim() || !appId || sending || aiStreaming) return

      const userMsg: ChatMessage = { role: 'user', content: text }
      setMessages(prev => [...prev, userMsg])
      setSending(true)
      setAiStreaming(true)
      setStreamCompleted(false)

      const assistantMsg: ChatMessage = { role: 'assistant', content: '' }
      setMessages(prev => [...prev, assistantMsg])

      const baseUrl =
        import.meta.env.VITE_API_BASE_URL || 'http://localhost:8123/api'
      const url = `${baseUrl}/app/chat/gen/code?appId=${appId}&message=${encodeURIComponent(text)}`

      const eventSource = new EventSource(url, { withCredentials: true })
      let receivedAnyMessage = false

      // 标记流结束 + 重新加载应用信息（保证 codeGenType 拿到最新值）
      const finishStream = async (success: boolean) => {
        eventSource.close()
        setSending(false)
        setAiStreaming(false)
        if (success) {
          await loadApp()
          setStreamCompleted(true)
        }
      }

      eventSource.onmessage = event => {
        receivedAnyMessage = true
        const chunk: string = event.data
        setMessages(prev => {
          const updated = [...prev]
          const last = updated[updated.length - 1]
          if (last.role === 'assistant') {
            updated[updated.length - 1] = {
              ...last,
              content: last.content + chunk,
            }
          }
          return updated
        })
      }

      // 兼容后端可能发送的自定义结束事件
      eventSource.addEventListener('done', () => {
        void finishStream(true)
      })
      eventSource.addEventListener('complete', () => {
        void finishStream(true)
      })

      // EventSource 在服务端关闭连接后，浏览器会触发 onerror 并尝试自动重连
      // - 收到过消息：视为正常结束
      // - 完全没收到消息：视为真错误
      eventSource.onerror = () => {
        if (receivedAnyMessage) {
          void finishStream(true)
        } else {
          eventSource.close()
          setSending(false)
          setAiStreaming(false)
          message.error('AI 对话连接失败')
        }
      }
    },
    [appId, sending, aiStreaming, loadApp]
  )

  useEffect(() => {
    const initPrompt = searchParams.get('prompt')
    if (initPrompt && !hasSentInitPrompt.current && !appLoading && appId) {
      hasSentInitPrompt.current = true
      void sendMessage(initPrompt)
    }
  }, [appLoading, appId, searchParams, sendMessage])

  const handleSend = useCallback(() => {
    const text = inputValue.trim()
    if (!text) return
    setInputValue('')
    void sendMessage(text)
  }, [inputValue, sendMessage])

  const handleDeploy = useCallback(async () => {
    if (!appId) return
    setDeploying(true)
    try {
      const res = await deployApp({ appId: appId as unknown as number })
      if (res.code === 0 && res.data) {
        setDeployedUrl(res.data)
        message.success('部署成功！')
        Modal.success({
          title: '部署成功',
          content: (
            <div>
              <Text>你的应用已部署，访问地址：</Text>
              <br />
              <a href={res.data} target="_blank" rel="noreferrer">
                {res.data}
              </a>
            </div>
          ),
        })
      } else {
        message.error(res.message || '部署失败')
      }
    } catch {
      message.error('部署失败')
    } finally {
      setDeploying(false)
    }
  }, [appId])

  const previewSrc = app
    ? `http://localhost:8123/api/static/${app.codeGenType}_${appId}/`
    : ''

  if (appLoading) {
    return (
      <div className={styles.loadingWrap}>
        <Spin size="large" tip="加载中..." />
      </div>
    )
  }

  return (
    <Layout className={styles.layout}>
      <Header
        className={styles.header}
        style={{
          background: colorBgContainer,
          borderBottom: `1px solid ${colorBorder}`,
        }}
      >
        <div className={styles.headerLeft}>
          <Button type="text" onClick={() => navigate('/')}>
            ← 返回
          </Button>
          <Title level={4} className={styles.appTitle}>
            {app?.appName || '应用对话'}
          </Title>
        </div>
        <div className={styles.headerRight}>
          {deployedUrl && (
            <Button
              icon={<LinkOutlined />}
              href={deployedUrl}
              target="_blank"
              rel="noreferrer"
            >
              访问已部署
            </Button>
          )}
          <Button
            type="primary"
            icon={<CloudUploadOutlined />}
            loading={deploying}
            onClick={handleDeploy}
          >
            部署
          </Button>
        </div>
      </Header>

      <Content className={styles.content}>
        <div
          className={styles.chatPanel}
          style={{ background: colorBgContainer }}
        >
          <div className={styles.messageList}>
            {messages.length === 0 && (
              <div className={styles.emptyChat}>
                <RobotOutlined
                  className={styles.emptyChatIcon}
                  style={{ color: colorPrimary }}
                />
                <Text type="secondary">
                  描述你的需求，AI 将为你生成网页应用
                </Text>
              </div>
            )}
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={
                  msg.role === 'user' ? styles.userMessage : styles.aiMessage
                }
              >
                {msg.role === 'assistant' && (
                  <Avatar
                    icon={<RobotOutlined />}
                    style={{ background: colorPrimary, flexShrink: 0 }}
                  />
                )}
                <div
                  className={styles.messageBubble}
                  style={{
                    background: msg.role === 'user' ? colorPrimary : undefined,
                    color: msg.role === 'user' ? '#fff' : undefined,
                    borderColor: colorBorder,
                  }}
                >
                  {msg.content ||
                    (msg.role === 'assistant' &&
                    aiStreaming &&
                    idx === messages.length - 1 ? (
                      <Spin size="small" />
                    ) : (
                      ''
                    ))}
                </div>
                {msg.role === 'user' && (
                  <Avatar icon={<UserOutlined />} style={{ flexShrink: 0 }} />
                )}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          <div
            className={styles.inputArea}
            style={{ borderTop: `1px solid ${colorBorder}` }}
          >
            <Input.TextArea
              value={inputValue}
              onChange={e => setInputValue(e.target.value)}
              placeholder="输入消息，Shift+Enter 换行，Enter 发送"
              autoSize={{ minRows: 2, maxRows: 5 }}
              className={styles.chatInput}
              onPressEnter={e => {
                if (!e.shiftKey) {
                  e.preventDefault()
                  handleSend()
                }
              }}
              disabled={sending || aiStreaming}
            />
            <Button
              type="primary"
              icon={<SendOutlined />}
              onClick={handleSend}
              loading={sending || aiStreaming}
              disabled={!inputValue.trim()}
              className={styles.sendBtn}
            >
              发送
            </Button>
          </div>
        </div>

        <div
          className={styles.previewPanel}
          style={{ borderLeft: `1px solid ${colorBorder}` }}
        >
          {showPreview && previewSrc ? (
            <iframe
              key={previewKey}
              src={previewSrc}
              className={styles.previewFrame}
              title="应用预览"
              sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
            />
          ) : (
            <div className={styles.previewEmpty}>
              {aiStreaming ? (
                <>
                  <Spin size="large" />
                  <Text type="secondary" style={{ marginTop: 16 }}>
                    AI 正在生成中...
                  </Text>
                </>
              ) : (
                <>
                  <RobotOutlined
                    className={styles.previewEmptyIcon}
                    style={{ color: colorPrimary }}
                  />
                  <Text type="secondary">
                    AI 生成完成后，这里将展示网页效果
                  </Text>
                </>
              )}
            </div>
          )}
        </div>
      </Content>
    </Layout>
  )
}

export default AppChat
