import { useState, useCallback, useEffect, useMemo } from 'react'
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
  Popconfirm,
  Image,
  Tag,
  Tooltip,
  Avatar,
  Badge,
  Pagination,
} from 'antd'
import {
  EditOutlined,
  DeleteOutlined,
  StarFilled,
  StarOutlined,
  SearchOutlined,
  ReloadOutlined,
  PictureOutlined,
  UserOutlined,
  RocketOutlined,
} from '@ant-design/icons'
import type { TableProps } from 'antd'
import {
  listAppVOByPage,
  deleteApp,
  updateApp,
} from '@/api/endpoints/app-controller'
import type { AppVO } from '@/api'
import styles from './index.module.css'

const CODE_GEN_TYPE_OPTIONS = [
  { label: '单文件 HTML', value: 'html' },
  { label: '多文件', value: 'multi_file' },
]

const cleanParams = (obj: Record<string, unknown>) => {
  const result: Record<string, unknown> = {}
  Object.entries(obj).forEach(([key, value]) => {
    if (value === '' || value === undefined || value === null) return
    result[key] = value
  })
  return result
}

function AppManage() {
  const [searchForm] = Form.useForm()

  const [loading, setLoading] = useState(false)
  const [dataSource, setDataSource] = useState<AppVO[]>([])
  const [total, setTotal] = useState(0)
  const [pageNum, setPageNum] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [searchParams, setSearchParams] = useState<Record<string, unknown>>({})

  const loadAppList = useCallback(async () => {
    setLoading(true)
    try {
      const res = await listAppVOByPage({
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
      message.error('加载应用列表失败')
    } finally {
      setLoading(false)
    }
  }, [pageNum, pageSize, searchParams])

  useEffect(() => {
    void loadAppList()
  }, [loadAppList])

  const handleDelete = useCallback(
    async (id: number) => {
      try {
        const res = await deleteApp({ id })
        if (res.code === 0) {
          message.success('删除成功')
          void loadAppList()
        } else {
          message.error(res.message || '删除失败')
        }
      } catch {
        message.error('删除失败')
      }
    },
    [loadAppList]
  )

  const handleFeatured = useCallback(
    async (record: AppVO) => {
      try {
        const res = await updateApp({
          id: record.id,
          appName: record.appName,
          cover: record.cover,
          priority: 99,
        })
        if (res.code === 0) {
          message.success('已设为精选')
          void loadAppList()
        } else {
          message.error(res.message || '操作失败')
        }
      } catch {
        message.error('操作失败')
      }
    },
    [loadAppList]
  )

  const handleSearch = useCallback(() => {
    const values = searchForm.getFieldsValue()
    const cleaned = cleanParams({
      ...values,
      id: values.id ? Number(values.id) : undefined,
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

  const columns: TableProps<AppVO>['columns'] = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 160,
      render: (id: number) => <span className={styles.idCell}>{id}</span>,
    },
    {
      title: '封面',
      dataIndex: 'cover',
      key: 'cover',
      width: 80,
      render: (cover: string) => (
        <div className={styles.coverBox}>
          {cover ? (
            <Image
              src={cover}
              width={56}
              height={40}
              style={{ objectFit: 'cover' }}
              preview={{ mask: null }}
            />
          ) : (
            <PictureOutlined className={styles.coverPlaceholder} />
          )}
        </div>
      ),
    },
    {
      title: '应用',
      dataIndex: 'appName',
      key: 'appName',
      width: 200,
      ellipsis: true,
      render: (_: unknown, record: AppVO) => (
        <div className={styles.appNameCell}>
          <span className={styles.appName}>{record.appName || '-'}</span>
          {record.initPrompt ? (
            <Tooltip title={record.initPrompt} placement="topLeft">
              <span className={styles.appMeta}>{record.initPrompt}</span>
            </Tooltip>
          ) : null}
        </div>
      ),
    },
    {
      title: '生成类型',
      dataIndex: 'codeGenType',
      key: 'codeGenType',
      width: 80,
      render: (type: string) => {
        const label = CODE_GEN_TYPE_OPTIONS.find(o => o.value === type)?.label
        if (!type) return <span style={{ color: 'rgba(0,0,0,0.25)' }}>-</span>
        return (
          <Tag color={type === 'html' ? 'blue' : 'purple'} variant="filled">
            {label || type}
          </Tag>
        )
      },
    },
    {
      title: '优先级',
      dataIndex: 'priority',
      key: 'priority',
      width: 80,
      render: (priority: number) =>
        priority >= 99 ? (
          <Tag icon={<StarFilled />} className={styles.priorityFeatured}>
            精选 {priority}
          </Tag>
        ) : (
          <span style={{ color: 'rgba(0,0,0,0.65)' }}>{priority ?? '-'}</span>
        ),
    },
    {
      title: '部署',
      dataIndex: 'deployKey',
      key: 'deployKey',
      width: 96,
      render: (key: string) =>
        key ? (
          <Tooltip title={`Key: ${key}`}>
            <Badge status="success" text="已部署" />
          </Tooltip>
        ) : (
          <Badge status="default" text="未部署" />
        ),
    },
    {
      title: '创建者',
      key: 'userId',
      width: 70,
      render: (_: unknown, record: AppVO) => (
        <span className={styles.userCell}>
          {record.userVO?.userAvatar ? (
            <Avatar size={22} src={record.userVO.userAvatar} />
          ) : (
            <Avatar size={22} icon={<UserOutlined />} />
          )}
          <span>{record.userVO?.userName || record.userId || '-'}</span>
        </span>
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
    {
      title: '操作',
      key: 'action',
      width: 160,
      fixed: 'right',
      render: (_, record) => (
        <div className={styles.actionCell}>
          <Button
            type="link"
            size="small"
            className={styles.actionBtn}
            icon={<EditOutlined />}
            onClick={() => window.open(`/app/edit/${record.id}`, '_blank')}
          >
            编辑
          </Button>
          <Popconfirm
            title="设为精选应用"
            description="将优先级设置为 99"
            onConfirm={() => void handleFeatured(record)}
            okText="确定"
            cancelText="取消"
          >
            <Button
              type="link"
              size="small"
              className={styles.actionBtn}
              icon={
                (record.priority ?? 0) >= 99 ? (
                  <StarFilled style={{ color: '#faad14' }} />
                ) : (
                  <StarOutlined />
                )
              }
            >
              精选
            </Button>
          </Popconfirm>
          <Popconfirm
            title="确认删除该应用？"
            description="删除后不可恢复"
            onConfirm={() => void handleDelete(record.id!)}
            okText="确定"
            cancelText="取消"
          >
            <Button
              type="link"
              size="small"
              danger
              className={styles.actionBtn}
              icon={<DeleteOutlined />}
            >
              删除
            </Button>
          </Popconfirm>
        </div>
      ),
    },
  ]

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div className={styles.titleWrap}>
          <h2 className={styles.title}>应用管理</h2>
          <span className={styles.subtitle}>管理平台已创建的 AI 应用</span>
        </div>
        <Button
          icon={<ReloadOutlined />}
          onClick={() => void loadAppList()}
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
              <Form.Item name="id" label="应用ID">
                <Input placeholder="精确匹配" allowClear />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12} md={6} lg={5}>
              <Form.Item name="appName" label="应用名称">
                <Input placeholder="模糊搜索" allowClear />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12} md={6} lg={4}>
              <Form.Item name="codeGenType" label="生成类型">
                <Select
                  placeholder="全部"
                  allowClear
                  options={CODE_GEN_TYPE_OPTIONS}
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12} md={6} lg={5}>
              <Form.Item name="deployKey" label="部署 Key">
                <Input placeholder="精确匹配" allowClear />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12} md={6} lg={3}>
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
            <RocketOutlined style={{ color: '#1677ff', marginRight: 8 }} />
            应用列表
            <span className={styles.toolbarCount}>共 {total} 条</span>
          </div>
        </div>
        <Table
          columns={columns}
          dataSource={dataSource}
          rowKey="id"
          loading={loading}
          scroll={{ x: 1280 }}
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

export default AppManage
