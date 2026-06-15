import { useState, useCallback, useEffect } from 'react'
import {
  Card,
  Table,
  Button,
  Form,
  Input,
  Select,
  Row,
  Col,
  message,
  Tag,
  Pagination,
} from 'antd'
import {
  SearchOutlined,
  ReloadOutlined,
  MessageOutlined,
} from '@ant-design/icons'
import type { TableProps } from 'antd'
import { listAllChatHistoryByPageForAdmin } from '@/api/endpoints/chat-history-controller'
import type { ChatHistory } from '@/api'
import styles from './index.module.css'

const MESSAGE_TYPE_OPTIONS = [
  { label: '用户', value: 'user' },
  { label: 'AI', value: 'assistant' },
]

const cleanParams = (obj: Record<string, unknown>) => {
  const result: Record<string, unknown> = {}
  Object.entries(obj).forEach(([key, value]) => {
    if (value === '' || value === undefined || value === null) return
    result[key] = value
  })
  return result
}

function ChatHistoryManage() {
  const [searchForm] = Form.useForm()

  const [loading, setLoading] = useState(false)
  const [dataSource, setDataSource] = useState<ChatHistory[]>([])
  const [total, setTotal] = useState(0)
  const [pageNum, setPageNum] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [searchParams, setSearchParams] = useState<Record<string, unknown>>({})

  const loadHistoryList = useCallback(async () => {
    setLoading(true)
    try {
      const res = await listAllChatHistoryByPageForAdmin({
        pageNum,
        pageSize,
        ...searchParams,
      })
      if (res.code === 0 && res.data) {
        setDataSource(res.data.records || [])
        setTotal(res.data.totalRow || 0)
      } else {
        message.error(res.message || '加载失败')
      }
    } catch {
      message.error('加载对话历史失败')
    } finally {
      setLoading(false)
    }
  }, [pageNum, pageSize, searchParams])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadHistoryList()
  }, [loadHistoryList])

  const handleSearch = useCallback(() => {
    const values = searchForm.getFieldsValue()
    const cleaned = cleanParams({
      ...values,
      id: values.id ? Number(values.id) : undefined,
      appId: values.appId ? Number(values.appId) : undefined,
      userId: values.userId ? Number(values.userId) : undefined,
    })
    setPageNum(1)
    setSearchParams(cleaned)
  }, [searchForm])

  const handleReset = useCallback(() => {
    searchForm.resetFields()
    setPageNum(1)
    setSearchParams({})
  }, [searchForm])

  const getMessageTypeTag = (type?: string) => {
    if (type === 'user') {
      return <Tag color="blue">用户</Tag>
    }
    if (type === 'assistant') {
      return <Tag color="green">AI</Tag>
    }
    return <Tag>{type || '-'}</Tag>
  }

  const columns: TableProps<ChatHistory>['columns'] = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 120,
      render: (id: number) => <span className={styles.idCell}>{id}</span>,
    },
    {
      title: '消息内容',
      dataIndex: 'message',
      key: 'message',
      ellipsis: true,
      width: 300,
      render: (msg: string) => (
        <span
          className={styles.messageCell}
          style={{ color: 'rgba(0,0,0,0.65)' }}
        >
          {msg || '-'}
        </span>
      ),
    },
    {
      title: '消息类型',
      dataIndex: 'messageType',
      key: 'messageType',
      width: 100,
      render: (type: string) => getMessageTypeTag(type),
    },
    {
      title: '应用ID',
      dataIndex: 'appId',
      key: 'appId',
      width: 140,
      render: (id: number) => (
        <span className={styles.idCell}>{id ?? '-'}</span>
      ),
    },
    {
      title: '用户ID',
      dataIndex: 'userId',
      key: 'userId',
      width: 140,
      render: (id: number) => (
        <span className={styles.idCell}>{id ?? '-'}</span>
      ),
    },
    {
      title: '创建时间',
      dataIndex: 'createTime',
      key: 'createTime',
      width: 170,
      render: (t: string) =>
        t ? (
          <span
            className={styles.timeCell}
            style={{ color: 'rgba(0,0,0,0.65)' }}
          >
            {t.replace('T', ' ').slice(0, 16)}
          </span>
        ) : (
          '-'
        ),
    },
  ]

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div className={styles.titleWrap}>
          <h2 className={styles.title}>对话管理</h2>
          <span className={styles.subtitle}>管理平台的对话历史记录</span>
        </div>
        <Button
          icon={<ReloadOutlined />}
          onClick={() => void loadHistoryList()}
          loading={loading}
        >
          刷新
        </Button>
      </div>

      <Card className={styles.filterCard} variant="borderless">
        <Form
          form={searchForm}
          layout="vertical"
          className={styles.filterForm}
          onFinish={handleSearch}
        >
          <Row gutter={16}>
            <Col xs={24} sm={12} md={6} lg={4}>
              <Form.Item name="id" label="记录ID">
                <Input placeholder="精确匹配" allowClear />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12} md={6} lg={5}>
              <Form.Item name="message" label="消息内容">
                <Input placeholder="模糊搜索" allowClear />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12} md={6} lg={4}>
              <Form.Item name="messageType" label="消息类型">
                <Select
                  placeholder="全部"
                  allowClear
                  options={MESSAGE_TYPE_OPTIONS}
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12} md={6} lg={4}>
              <Form.Item name="appId" label="应用ID">
                <Input placeholder="精确匹配" allowClear />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12} md={6} lg={4}>
              <Form.Item name="userId" label="用户ID">
                <Input placeholder="精确匹配" allowClear />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12} md={6} lg={3}>
              <Form.Item label=" " colon={false}>
                <div className={styles.filterActions}>
                  <Button onClick={handleReset} icon={<ReloadOutlined />}>
                    重置
                  </Button>
                  <Button
                    type="primary"
                    htmlType="submit"
                    icon={<SearchOutlined />}
                  >
                    搜索
                  </Button>
                </div>
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Card>

      <Card className={styles.tableCard} variant="borderless">
        <div className={styles.tableToolbar}>
          <div className={styles.toolbarLeft}>
            <MessageOutlined style={{ color: '#1677ff', marginRight: 8 }} />
            对话列表
            <span className={styles.toolbarCount}>共 {total} 条</span>
          </div>
        </div>
        <Table
          columns={columns}
          dataSource={dataSource}
          rowKey="id"
          loading={loading}
          scroll={{ x: 1100 }}
          pagination={false}
        />
        <div className={styles.paginationBar}>
          <Pagination
            current={pageNum}
            pageSize={pageSize}
            total={total}
            showSizeChanger
            showQuickJumper
            showTotal={t => `共 ${t} 条`}
            onChange={(page, size) => {
              setPageNum(page)
              setPageSize(size)
            }}
          />
        </div>
      </Card>
    </div>
  )
}

export default ChatHistoryManage
