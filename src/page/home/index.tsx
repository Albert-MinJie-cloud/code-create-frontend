import { useState, useCallback, useEffect } from 'react'
import {
  Button,
  Input,
  Card,
  Row,
  Col,
  Typography,
  Pagination,
  Empty,
  Spin,
  message,
  Popconfirm,
  Tag,
} from 'antd'
import { useNavigate } from 'react-router-dom'
import { SendOutlined, DeleteOutlined, EditOutlined } from '@ant-design/icons'
import {
  addApp,
  listMyAppVOByPage,
  listGoodAppVOByPage,
  deleteMyApp,
} from '@/api/endpoints/app-controller'
import type { AppVO } from '@/api'
import { useAuthStore } from '@/store/authStore'
import styles from './index.module.css'

const { Title, Text, Paragraph } = Typography

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

  const PAGE_SIZE = 20

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
        navigate(
          `/app/chat/${res.data}?prompt=${encodeURIComponent(prompt.trim())}`
        )
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
            <img
              src={app.cover}
              alt={app.appName}
              className={styles.appCover}
            />
          ) : (
            <div className={styles.appCoverPlaceholder}>
              {app.appName?.charAt(0) || 'A'}
            </div>
          )
        }
        onClick={() => navigate(`/app/chat/${app.id}`)}
        actions={
          showActions
            ? [
                <EditOutlined
                  key="edit"
                  onClick={e => {
                    e.stopPropagation()
                    console.log('Navigate to edit app:', app.id) // 调试日志
                    navigate(`/app/edit/${app.id}`)
                  }}
                />,
                <Popconfirm
                  key="delete"
                  title="确认删除该应用？"
                  onConfirm={e => {
                    e?.stopPropagation()
                    void handleDeleteMyApp(app.id!)
                  }}
                  okText="确定"
                  cancelText="取消"
                >
                  <DeleteOutlined onClick={e => e.stopPropagation()} />
                </Popconfirm>,
              ]
            : undefined
        }
      >
        <Card.Meta
          title={
            <Text ellipsis={{ tooltip: app.appName }}>
              {app.appName || '未命名应用'}
            </Text>
          }
          description={
            <Paragraph
              ellipsis={{ rows: 2, tooltip: app.initPrompt }}
              className={styles.appDesc}
            >
              {app.initPrompt || '暂无描述'}
            </Paragraph>
          }
        />
        {app.deployKey && (
          <Tag color="green" className={styles.deployTag}>
            已部署
          </Tag>
        )}
      </Card>
    </Col>
  )

  return (
    <div className={styles.container}>
      {/* 标题区域 */}
      <div className={styles.hero}>
        <Title className={styles.heroTitle}>Code Create</Title>
        <Text className={styles.heroSubtitle}>
          用 AI 对话，轻松创建你的专属网页应用
        </Text>
        <div className={styles.promptBox}>
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
          <Button
            type="primary"
            size="large"
            icon={<SendOutlined />}
            loading={creating}
            onClick={handleCreate}
            className={styles.createBtn}
          >
            创建应用
          </Button>
        </div>
      </div>

      {/* 我的应用 */}
      {isAuthenticated && (
        <div className={styles.section}>
          <div className={styles.sectionHeader}>
            <Title level={3} className={styles.sectionTitle}>
              我的应用
            </Title>
            <Input.Search
              placeholder="搜索应用名称"
              allowClear
              style={{ width: 220 }}
              onSearch={val => {
                setMySearch(val)
                setMyPage(1)
              }}
            />
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
            <div className={styles.pagination}>
              <Pagination
                current={myPage}
                pageSize={PAGE_SIZE}
                total={myTotal}
                onChange={page => setMyPage(page)}
                showTotal={t => `共 ${t} 个`}
              />
            </div>
          )}
        </div>
      )}

      {/* 精选应用 */}
      <div className={styles.section}>
        <div className={styles.sectionHeader}>
          <Title level={3} className={styles.sectionTitle}>
            精选应用
          </Title>
          <Input.Search
            placeholder="搜索应用名称"
            allowClear
            style={{ width: 220 }}
            onSearch={val => {
              setGoodSearch(val)
              setGoodPage(1)
            }}
          />
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
          <div className={styles.pagination}>
            <Pagination
              current={goodPage}
              pageSize={PAGE_SIZE}
              total={goodTotal}
              onChange={page => setGoodPage(page)}
              showTotal={t => `共 ${t} 个`}
            />
          </div>
        )}
      </div>
    </div>
  )
}

export default Home
