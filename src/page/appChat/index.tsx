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
import { listAppChatHistory } from '@/api/endpoints/chat-history-controller'
import type { AppVO, ChatHistory } from '@/api'
import { useAuthStore } from '@/store/authStore'
import MarkdownRenderer from '@/components/MarkdownRenderer'
import { API_BASE_URL, getStaticPreviewUrl } from '@/config/env'
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
  const user = useAuthStore(state => state.user)
  const {
    token: { colorBgContainer, colorBorder, colorPrimary },
  } = theme.useToken()

  const [app, setApp] = useState<AppVO | null>(null)
  const [appLoading, setAppLoading] = useState(true)

  const [chatHistory, setChatHistory] = useState<ChatHistory[]>([])
  const [hasMoreHistory, setHasMoreHistory] = useState(false)
  const [loadingHistory, setLoadingHistory] = useState(false)

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
  const messageListRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)
  const dividerRef = useRef<HTMLDivElement>(null)
  const hasSentInitPrompt = useRef(false)
  const prevHistoryLengthRef = useRef(0)
  const appRef = useRef<AppVO | null>(null)

  const [chatPanelWidth, setChatPanelWidth] = useState(420)
  const [dragging, setDragging] = useState(false)

  const baseUrl = API_BASE_URL

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    const divider = dividerRef.current
    if (!divider) return
    divider.setPointerCapture(e.pointerId)
    setDragging(true)
    document.body.style.userSelect = 'none'
    document.body.style.cursor = 'col-resize'
  }, [])

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!dragging || !contentRef.current) return
      const rect = contentRef.current.getBoundingClientRect()
      const newWidth = e.clientX - rect.left
      const minChatWidth = 320
      const minPreviewWidth = 200
      const dividerWidth = 6
      const maxChatWidth = rect.width - minPreviewWidth - dividerWidth
      setChatPanelWidth(
        Math.max(minChatWidth, Math.min(maxChatWidth, newWidth))
      )
    },
    [dragging]
  )

  const handlePointerUp = useCallback((e: React.PointerEvent) => {
    const divider = dividerRef.current
    if (divider) {
      divider.releasePointerCapture(e.pointerId)
    }
    setDragging(false)
    document.body.style.userSelect = ''
    document.body.style.cursor = ''
  }, [])

  // 保持 appRef 同步最新值
  useEffect(() => {
    appRef.current = app
  }, [app])

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
          setDeployedUrl(`${baseUrl}/static/${res.data.deployKey}/`)
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
    void loadApp()
  }, [loadApp])

  // 加载对话历史（仅依赖 appId，通过 ref 读取最新 app）
  const loadChatHistory = useCallback(
    async (lastCreateTime?: string) => {
      if (!appId) return
      setLoadingHistory(true)
      try {
        const res = await listAppChatHistory(appId as unknown as number, {
          // pageSize: 10,
          ...(lastCreateTime ? { lastCreateTime } : {}),
        })
        if (res.code === 0 && res.data) {
          const rawRecords = res.data.records || []
          const records = [...rawRecords].sort((a, b) =>
            (a.createTime || '').localeCompare(b.createTime || '')
          )
          if (lastCreateTime) {
            setChatHistory(prev => [...records, ...prev])
          } else {
            setChatHistory(records)
            // 如果没有部署 key，但历史记录 >= 2 条，也展示预览
            if (!appRef.current?.deployKey && records.length >= 2) {
              setShowPreview(true)
              setPreviewKey(k => k + 1)
            }
          }
          setHasMoreHistory(rawRecords.length >= 10)
        }
      } catch {
        // 首次加载静默处理，加载更多时提示
        if (lastCreateTime) {
          message.error('加载更多对话历史失败')
        }
      } finally {
        setLoadingHistory(false)
      }
    },
    [appId]
  )

  // 加载完 app 后加载对话历史
  useEffect(() => {
    if (app && appId) {
      void loadChatHistory()
    }
  }, [app, appId, loadChatHistory])

  // 加载更多历史时，保持滚动位置
  useEffect(() => {
    if (
      chatHistory.length > prevHistoryLengthRef.current &&
      prevHistoryLengthRef.current > 0
    ) {
      const list = messageListRef.current
      if (list) {
        const prevScrollHeight = list.scrollHeight
        requestAnimationFrame(() => {
          list.scrollTop = list.scrollHeight - prevScrollHeight
        })
      }
    }
    prevHistoryLengthRef.current = chatHistory.length
  }, [chatHistory.length])

  const handleLoadMore = () => {
    const earliestTime = chatHistory[0]?.createTime
    if (earliestTime) {
      void loadChatHistory(earliestTime)
    }
  }

  // 流结束 + 应用 codeGenType 就绪 后，统一触发预览
  useEffect(() => {
    if (streamCompleted && app?.codeGenType) {
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

      const url = `${baseUrl}/app/chat/gen/code?appId=${appId}&message=${encodeURIComponent(text)}`

      const eventSource = new EventSource(url, { withCredentials: true })
      let receivedAnyMessage = false

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

      eventSource.addEventListener('done', () => {
        void finishStream(true)
      })
      eventSource.addEventListener('complete', () => {
        void finishStream(true)
      })

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
    [appId, sending, aiStreaming, baseUrl, loadApp]
  )

  // 自动发送初始消息：自己的 app + 无对话历史 + 有 initPrompt
  useEffect(() => {
    const initPrompt = searchParams.get('prompt')
    if (
      initPrompt &&
      !hasSentInitPrompt.current &&
      !appLoading &&
      app &&
      user &&
      app.userId === user.id &&
      chatHistory.length === 0 &&
      !loadingHistory
    ) {
      hasSentInitPrompt.current = true
      void sendMessage(initPrompt)
    }
  }, [
    appLoading,
    app,
    user,
    chatHistory.length,
    loadingHistory,
    searchParams,
    sendMessage,
  ])

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
        await loadApp()
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
  }, [appId, loadApp])

  const previewSrc =
    app && getStaticPreviewUrl(app?.codeGenType || 'default', app.id)

  // 将历史消息转换为 ChatMessage 格式
  const historyMessages: ChatMessage[] = chatHistory.map(h => ({
    role: (h.messageType === 'user' ? 'user' : 'assistant') as
      | 'user'
      | 'assistant',
    content: h.message || '',
  }))

  const allMessages = [...historyMessages, ...messages]

  if (appLoading) {
    return (
      <div className={styles.loadingWrap}>
        <Spin size="large" />
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

      <Content className={styles.content} ref={contentRef}>
        <div
          className={styles.chatPanel}
          style={{
            background: colorBgContainer,
            width: chatPanelWidth,
            minWidth: 320,
          }}
        >
          <div className={styles.messageList} ref={messageListRef}>
            {hasMoreHistory && (
              <div className={styles.loadMoreBar}>
                <Button
                  type="link"
                  loading={loadingHistory}
                  onClick={handleLoadMore}
                >
                  加载更多
                </Button>
              </div>
            )}
            {allMessages.length === 0 && (
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
            {allMessages.map((msg, idx) => (
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
                  className={
                    msg.role === 'user' ? styles.userBubble : styles.aiBubble
                  }
                  style={{
                    background: msg.role === 'user' ? colorPrimary : undefined,
                    color: msg.role === 'user' ? '#fff' : undefined,
                    borderColor: colorBorder,
                  }}
                >
                  {msg.content ? (
                    msg.role === 'assistant' ? (
                      <MarkdownRenderer content={msg.content} />
                    ) : (
                      msg.content
                    )
                  ) : msg.role === 'assistant' &&
                    aiStreaming &&
                    idx === allMessages.length - 1 ? (
                    <Spin size="small" />
                  ) : (
                    ''
                  )}
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
          ref={dividerRef}
          className={`${styles.divider} ${dragging ? styles.dividerActive : ''}`}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
        />

        <div className={styles.previewPanel}>
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
