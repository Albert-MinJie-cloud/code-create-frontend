import { useState, useCallback, useEffect } from 'react'
import {
  Card,
  Table,
  Button,
  Space,
  Form,
  Input,
  message,
  Popconfirm,
  Image,
  Tag,
} from 'antd'
import { EditOutlined, DeleteOutlined, StarOutlined } from '@ant-design/icons'
import type { TableProps } from 'antd'
import {
  listAppVOByPage,
  deleteApp,
  updateApp,
} from '@/api/endpoints/app-controller'
import type { AppVO } from '@/api'

function AppManage() {
  const [searchForm] = Form.useForm()

  const [loading, setLoading] = useState(false)
  const [dataSource, setDataSource] = useState<AppVO[]>([])
  const [total, setTotal] = useState(0)
  const [pageNum, setPageNum] = useState(1)
  const [pageSize, setPageSize] = useState(10)

  const loadAppList = useCallback(async () => {
    setLoading(true)
    try {
      const searchValues = searchForm.getFieldsValue()
      const res = await listAppVOByPage({
        pageNum,
        pageSize,
        ...searchValues,
        id: searchValues.id ? Number(searchValues.id) : undefined,
        userId: searchValues.userId ? Number(searchValues.userId) : undefined,
        priority: searchValues.priority ? Number(searchValues.priority) : undefined,
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
  }, [pageNum, pageSize, searchForm])

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
    setPageNum(1)
    void loadAppList()
  }, [loadAppList])

  const handleReset = useCallback(() => {
    searchForm.resetFields()
    setPageNum(1)
    void loadAppList()
  }, [searchForm, loadAppList])

  const columns: TableProps<AppVO>['columns'] = [
    { title: 'ID', dataIndex: 'id', key: 'id', width: 80 },
    {
      title: '封面',
      dataIndex: 'cover',
      key: 'cover',
      width: 80,
      render: (cover: string) =>
        cover ? <Image src={cover} width={48} height={36} style={{ objectFit: 'cover', borderRadius: 4 }} /> : '-',
    },
    {
      title: '应用名称',
      dataIndex: 'appName',
      key: 'appName',
      ellipsis: true,
    },
    {
      title: '初始提示词',
      dataIndex: 'initPrompt',
      key: 'initPrompt',
      ellipsis: true,
    },
    {
      title: '生成类型',
      dataIndex: 'codeGenType',
      key: 'codeGenType',
      width: 100,
    },
    {
      title: '优先级',
      dataIndex: 'priority',
      key: 'priority',
      width: 80,
      render: (priority: number) =>
        priority >= 99 ? <Tag color="gold">精选({priority})</Tag> : priority ?? '-',
    },
    {
      title: '部署',
      dataIndex: 'deployKey',
      key: 'deployKey',
      width: 80,
      render: (key: string) => key ? <Tag color="green">已部署</Tag> : <Tag>未部署</Tag>,
    },
    {
      title: '创建者',
      dataIndex: 'userVO',
      key: 'userId',
      width: 100,
      render: (_: unknown, record: AppVO) => record.userVO?.userName || record.userId,
    },
    {
      title: '创建时间',
      dataIndex: 'createTime',
      key: 'createTime',
      width: 160,
    },
    {
      title: '操作',
      key: 'action',
      width: 180,
      fixed: 'right',
      render: (_, record) => (
        <Space>
          <Button
            type="link"
            size="small"
            icon={<EditOutlined />}
            onClick={() => window.open(`/app/edit/${record.id}`, '_blank')}
          >
            编辑
          </Button>
          <Popconfirm
            title="确认删除该应用？"
            onConfirm={() => void handleDelete(record.id!)}
            okText="确定"
            cancelText="取消"
          >
            <Button type="link" size="small" danger icon={<DeleteOutlined />}>
              删除
            </Button>
          </Popconfirm>
          <Popconfirm
            title="设为精选应用（优先级 99）？"
            onConfirm={() => void handleFeatured(record)}
            okText="确定"
            cancelText="取消"
          >
            <Button type="link" size="small" icon={<StarOutlined />}>
              精选
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ]

  return (
    <Card>
      <Space size="middle" style={{ width: '100%', display: 'flex', flexDirection: 'column' }}>
        <Form form={searchForm} layout="inline">
          <Form.Item name="id" label="ID">
            <Input placeholder="应用ID" style={{ width: 100 }} allowClear />
          </Form.Item>
          <Form.Item name="appName" label="应用名称">
            <Input placeholder="请输入应用名称" allowClear />
          </Form.Item>
          <Form.Item name="codeGenType" label="生成类型">
            <Input placeholder="生成类型" style={{ width: 120 }} allowClear />
          </Form.Item>
          <Form.Item name="deployKey" label="部署Key">
            <Input placeholder="部署Key" style={{ width: 140 }} allowClear />
          </Form.Item>
          <Form.Item name="userId" label="用户ID">
            <Input placeholder="用户ID" style={{ width: 100 }} allowClear />
          </Form.Item>
          <Form.Item>
            <Space>
              <Button type="primary" onClick={handleSearch}>搜索</Button>
              <Button onClick={handleReset}>重置</Button>
            </Space>
          </Form.Item>
        </Form>

        <Table
          columns={columns}
          dataSource={dataSource}
          rowKey="id"
          loading={loading}
          scroll={{ x: 1200 }}
          pagination={{
            current: pageNum,
            pageSize,
            total,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: t => `共 ${t} 条`,
            onChange: (page, size) => {
              setPageNum(page)
              setPageSize(size)
            },
          }}
        />
      </Space>
    </Card>
  )
}

export default AppManage
