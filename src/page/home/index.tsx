import { useState, useCallback, useEffect, useRef } from 'react'
import {
  Button,
  Input,
  Row,
  Col,
  Empty,
  Spin,
  message,
  Popconfirm,
  Tag,
  Tooltip,
  Card,
  Typography,
} from 'antd'

const { Text, Paragraph } = Typography
import { useNavigate } from 'react-router-dom'
import {
  SendOutlined,
  DeleteOutlined,
  EditOutlined,
  ThunderboltOutlined,
  SearchOutlined,
  CloseOutlined,
  RightOutlined,
} from '@ant-design/icons'
import {
  addApp,
  listMyAppVOByPage,
  listGoodAppVOByPage,
  deleteMyApp,
} from '@/api/endpoints/app-controller'
import type { AppVO } from '@/api'
import { useAuthStore } from '@/store/authStore'
import styles from './index.module.css'

const COVER_COLORS = [
  styles.placeholder0,
  styles.placeholder1,
  styles.placeholder2,
  styles.placeholder3,
  styles.placeholder4,
  styles.placeholder5,
]

function pickColor(id?: number) {
  return COVER_COLORS[(id ?? 0) % COVER_COLORS.length]
}

const PAGE_SIZE = 8

interface SearchInputProps {
  value: string
  onChange: (val: string) => void
}

function SearchInput({ value, onChange }: SearchInputProps) {
  const [open, setOpen] = useState(false)
  const [draft, setDraft] = useState(value)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleOpen = () => {
    setDraft(value)
    setOpen(true)
    setTimeout(() => inputRef.current?.focus(), 50)
  }

  const handleConfirm = () => {
    onChange(draft.trim())
    setOpen(false)
  }

  const handleClear = () => {
    setDraft('')
    onChange('')
    setOpen(false)
  }

  if (open) {
    return (
      <Input
        ref={inputRef}
        size="small"
        value={draft}
        onChange={e => setDraft(e.target.value)}
        placeholder="搜索应用名称"
        className={styles.searchInput}
        onBlur={handleConfirm}
        onPressEnter={handleConfirm}
        suffix={
          draft ? (
            <CloseOutlined
              className={styles.searchClear}
              onMouseDown={e => { e.preventDefault(); handleClear() }}
            />
          ) : null
        }
      />
    )
  }

  if (value) {
    return (
      <Tag
        className={styles.searchTag}
        closable
        onClose={handleClear}
        onClick={handleOpen}
        icon={<SearchOutlined />}
      >
        {value}
      </Tag>
    )
  }

  return (
    <Tooltip title="搜索应用">
      <Button
        type="text"
        size="small"
        icon={<SearchOutlined />}
        className={styles.searchTrigger}
        onClick={handleOpen}
      />
    </Tooltip>
  )
}

function Home() {
  const navigate = useNavigate()
  const { isAuthenticated } = useAuthStore()

  const [prompt, setPrompt] = useState('')
  const [creating, setCreating] = useState(false)

  const [myApps, setMyApps] = useState<AppVO[]>([])
  const [myTotal, setMyTotal] = useState(0)
  const [myPage, setMyPage] = useState(1)
  const [myLoading, setMyLoading] = useState(false)
  const [mySearch, setMySearch] = useState('')

  const [goodApps, setGoodApps] = useState<AppVO[]>([])
  const [goodTotal, setGoodTotal] = useState(0)
  const [goodPage, setGoodPage] = useState(1)
  const [goodLoading, setGoodLoading] = useState(false)
  const [goodSearch, setGoodSearch] = useState('')

  const loadMyApps = useCallback(
    async (page: number, search: string) => {
      if (!isAuthenticated) return
      setMyLoading(true)
      try {
        const res = await listMyAppVOByPage({
          pageNum: page,
          pageSize: PAGE_SIZE,
          appName: search || undefined,
        })
        if (res.code === 0 && res.data) {
          setMyApps(res.data.records || [])
          setMyTotal(res.data.totalRow || 0)
        }
      } catch {
        message.error('加载我的应用失败')
      } finally {
        setMyLoading(false)
      }
    },
    [isAuthenticated]
  )

  const loadGoodApps = useCallback(async (page: number, search: string) => {
    setGoodLoading(true)
    try {
      const res = await listGoodAppVOByPage({
        pageNum: page,
        pageSize: PAGE_SIZE,
        appName: search || undefined,
      })
      if (res.code === 0 && res.data) {
        setGoodApps(res.data.records || [])
        setGoodTotal(res.data.totalRow || 0)
      }
    } catch {
      message.error('加载精选应用失败')
    } finally {
      setGoodLoading(false)
    }
  }, [])

  useEffect(() => {
    void loadMyApps(myPage, mySearch)
  }, [loadMyApps, myPage, mySearch])

  useEffect(() => {
    void loadGoodApps(goodPage, goodSearch)
  }, [loadGoodApps, goodPage, goodSearch])

  const handleCreate = useCallback(async () => {
    if (!prompt.trim()) {
      message.warning('请输入提示词')
      return
    }
    if (!isAuthenticated) {
      message.warning('请先登录')
      navigate('/login')
      return
    }
    setCreating(true)
    try {
      const res = await addApp({ initPrompt: prompt.trim() })
      if (res.code === 0 && res.data) {
        message.success('应用创建成功，正在跳转...')
        navigate(`/app/chat/${res.data}?prompt=${encodeURIComponent(prompt.trim())}`)
      } else {
        message.error(res.message || '创建失败')
      }
    } catch {
      message.error('创建应用失败')
    } finally {
      setCreating(false)
    }
  }, [prompt, isAuthenticated, navigate])

  const handleDeleteMyApp = useCallback(
    async (id: number) => {
      try {
        const res = await deleteMyApp({ id })
        if (res.code === 0) {
          message.success('删除成功')
          void loadMyApps(myPage, mySearch)
        } else {
          message.error(res.message || '删除失败')
        }
      } catch {
        message.error('删除失败')
      }
    },
    [loadMyApps, myPage, mySearch]
  )

  const renderAppCard = (app: AppVO, showActions = false) => (
    <Col xs={24} sm={12} md={8} lg={6} key={app.id}>
      <Card
        hoverable
        className={styles.appCard}

        cover={
          app.cover ? (
            <img src={app.cover} alt={app.appName} className={styles.appCover} />
          ) : (
            <div className={`${styles.appCoverPlaceholder} ${pickColor(app.id)}`}>
              {app.appName?.charAt(0)?.toUpperCase() || 'A'}
            </div>
          )
        }
        onClick={() => navigate(`/app/chat/${app.id}`)}
      >
        <Text strong ellipsis={{ tooltip: app.appName }} className={styles.appCardName}>
          {app.appName || '未命名应用'}
        </Text>
        <Paragraph
          type="secondary"
          ellipsis={{ rows: 2, tooltip: app.initPrompt }}
          className={styles.appCardDesc}
        >
          {app.initPrompt || '暂无描述'}
        </Paragraph>
        <div className={styles.appCardFooter}>
          <div>
            {app.deployKey && (
              <Tag color="success" className={styles.deployTag}>已部署</Tag>
            )}
          </div>
          {showActions && (
            <div className={styles.cardActions} onClick={e => e.stopPropagation()}>
              <Tooltip title="编辑">
                <Button
                  type="text"
                  size="small"
                  className={styles.cardActionBtn}
                  icon={<EditOutlined />}
                  onClick={() => navigate(`/app/edit/${app.id}`)}
                />
              </Tooltip>
              <Popconfirm
                title="确认删除该应用？"
                onConfirm={() => void handleDeleteMyApp(app.id!)}
                okText="确定"
                cancelText="取消"
              >
                <Button
                  type="text"
                  size="small"
                  className={`${styles.cardActionBtn} ${styles.cardActionBtnDanger}`}
                  icon={<DeleteOutlined />}
                />
              </Popconfirm>
            </div>
          )}
        </div>
      </Card>
    </Col>
  )

  return (
    <div className={styles.container}>
      <div className={styles.hero}>
        <div className={styles.heroBadge}>
          <ThunderboltOutlined />
          AI 驱动 · 即刻生成
        </div>
        <h1 className={styles.heroTitle}>Code Create</h1>
        <Text type="secondary" className={styles.heroSubtitle}>
          用 AI 对话，轻松创建你的专属网页应用
        </Text>
        <Card className={styles.promptBox}>
          <Input.TextArea
            value={prompt}
            onChange={e => setPrompt(e.target.value)}
            placeholder="描述你想创建的网页应用，例如：一个漂亮的个人简历页面..."
            autoSize={{ minRows: 3, maxRows: 6 }}
            className={styles.promptInput}
            onPressEnter={e => {
              if (!e.shiftKey) {
                e.preventDefault()
                void handleCreate()
              }
            }}
          />
          <div className={styles.promptFooter}>
            <Text type="secondary" className={styles.promptHint}>Shift + Enter 换行</Text>
            <Button
              type="primary"
              icon={<SendOutlined />}
              loading={creating}
              onClick={handleCreate}
              className={styles.createBtn}
            >
              创建应用
            </Button>
          </div>
        </Card>
      </div>

      <Card className={styles.sectionsCard}>
        {isAuthenticated && (
          <div className={styles.section}>
            <div className={styles.sectionHeader}>
              <div className={styles.sectionTitleWrap}>
                <h3 className={styles.sectionTitle}>我的应用</h3>
                {myTotal > 0 && <Text type="secondary" className={styles.sectionCount}>{myTotal} 个</Text>}
                <SearchInput
                  value={mySearch}
                  onChange={val => { setMySearch(val); setMyPage(1) }}
                />
              </div>
            </div>
            <Spin spinning={myLoading}>
              {myApps.length === 0 && !myLoading ? (
                <Empty description="暂无应用，快去创建第一个吧！" />
              ) : (
                <Row gutter={[16, 16]}>
                  {myApps.map(app => renderAppCard(app, true))}
                </Row>
              )}
            </Spin>
            {myTotal > PAGE_SIZE && (
              <div className={styles.moreWrap}>
                {myPage * PAGE_SIZE < myTotal ? (
                  <Button
                    type="default"
                    icon={<RightOutlined />}
                    className={styles.moreBtn}
                    onClick={() => setMyPage(p => p + 1)}
                    loading={myLoading}
                  >
                    查看更多应用
                  </Button>
                ) : (
                  <Text type="secondary" className={styles.noMore}>已加载全部</Text>
                )}
              </div>
            )}
          </div>
        )}

        <div className={styles.section}>
          <div className={styles.sectionHeader}>
            <div className={styles.sectionTitleWrap}>
              <h3 className={styles.sectionTitle}>精选应用</h3>
              {goodTotal > 0 && <Text type="secondary" className={styles.sectionCount}>{goodTotal} 个</Text>}
              <SearchInput
                value={goodSearch}
                onChange={val => { setGoodSearch(val); setGoodPage(1) }}
              />
            </div>
          </div>
          <Spin spinning={goodLoading}>
            {goodApps.length === 0 && !goodLoading ? (
              <Empty description="暂无精选应用" />
            ) : (
              <Row gutter={[16, 16]}>
                {goodApps.map(app => renderAppCard(app, false))}
              </Row>
            )}
          </Spin>
          {goodTotal > PAGE_SIZE && (
            <div className={styles.moreWrap}>
              {goodPage * PAGE_SIZE < goodTotal ? (
                <Button
                  type="default"
                  icon={<RightOutlined />}
                  className={styles.moreBtn}
                  onClick={() => setGoodPage(p => p + 1)}
                  loading={goodLoading}
                >
                  查看更多应用
                </Button>
              ) : (
                <Text type="secondary" className={styles.noMore}>已加载全部</Text>
              )}
            </div>
          )}
        </div>
      </Card>
    </div>
  )
}

export default Home
