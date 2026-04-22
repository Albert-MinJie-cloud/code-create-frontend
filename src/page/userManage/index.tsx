import { useState, useCallback, useEffect } from 'react'
import {
  Card,
  Table,
  Button,
  Row,
  Col,
  Form,
  Input,
  Select,
  message,
  Popconfirm,
  Avatar,
  Modal,
  Badge,
  Pagination,
} from 'antd'
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  UserOutlined,
  SearchOutlined,
  ReloadOutlined,
  TeamOutlined,
} from '@ant-design/icons'
import type { TableProps } from 'antd'
import {
  addUser,
  deleteUser,
  updateUser,
  listUserVOByPage,
} from '@/api/endpoints/user-controller'
import type { UserVO, UserAddRequest, UserUpdateRequest } from '@/api'
import styles from './index.module.css'

interface UserFormData {
  id?: number
  userName: string
  userAccount?: string
  userAvatar?: string
  userProfile?: string
  userRole: string
}

const ROLE_OPTIONS = [
  { label: '管理员', value: 'admin' },
  { label: '普通用户', value: 'user' },
]

const ROLE_COLOR: Record<string, 'success' | 'processing'> = {
  admin: 'processing',
  user: 'success',
}

function UserManage() {
  const [form] = Form.useForm<UserFormData>()
  const [searchForm] = Form.useForm()

  const [loading, setLoading] = useState(false)
  const [dataSource, setDataSource] = useState<UserVO[]>([])
  const [total, setTotal] = useState(0)
  const [pageNum, setPageNum] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [searchParams, setSearchParams] = useState<Record<string, unknown>>({})

  const [modalVisible, setModalVisible] = useState(false)
  const [modalType, setModalType] = useState<'add' | 'edit'>('add')
  const [editingUser, setEditingUser] = useState<UserVO | null>(null)

  const loadUserList = useCallback(async () => {
    setLoading(true)
    try {
      const res = await listUserVOByPage({
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
      message.error('加载用户列表失败')
    } finally {
      setLoading(false)
    }
  }, [pageNum, pageSize, searchParams])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void loadUserList()
  }, [loadUserList])

  const handleAdd = useCallback(() => {
    setModalType('add')
    setEditingUser(null)
    form.resetFields()
    setModalVisible(true)
  }, [form])

  const handleEdit = useCallback(
    (record: UserVO) => {
      setModalType('edit')
      setEditingUser(record)
      form.setFieldsValue({
        id: record.id,
        userName: record.userName || '',
        userAvatar: record.userAvatar || '',
        userProfile: record.userProfile || '',
        userRole: record.userRole || 'user',
      })
      setModalVisible(true)
    },
    [form]
  )

  const handleDelete = useCallback(
    async (id: number) => {
      try {
        const res = await deleteUser({ id })
        if (res.code === 0) {
          message.success('删除成功')
          void loadUserList()
        } else {
          message.error(res.message || '删除失败')
        }
      } catch {
        message.error('删除用户失败')
      }
    },
    [loadUserList]
  )

  const handleSubmit = useCallback(async () => {
    try {
      const values = await form.validateFields()
      if (modalType === 'add') {
        const addData: UserAddRequest = {
          userName: values.userName,
          userAccount: values.userAccount,
          userAvatar: values.userAvatar,
          userProfile: values.userProfile,
          userRole: values.userRole,
        }
        const res = await addUser(addData)
        if (res.code === 0) {
          message.success('新增成功')
          setModalVisible(false)
          void loadUserList()
        } else {
          message.error(res.message || '新增失败')
        }
      } else {
        const updateData: UserUpdateRequest = {
          id: editingUser?.id,
          userName: values.userName,
          userAvatar: values.userAvatar,
          userProfile: values.userProfile,
          userRole: values.userRole,
        }
        const res = await updateUser(updateData)
        if (res.code === 0) {
          message.success('更新成功')
          setModalVisible(false)
          void loadUserList()
        } else {
          message.error(res.message || '更新失败')
        }
      }
    } catch {
      // 表单校验失败
    }
  }, [form, modalType, editingUser, loadUserList])

  const handleSearch = useCallback(() => {
    const values = searchForm.getFieldsValue()
    const cleaned: Record<string, unknown> = {}
    Object.entries(values).forEach(([k, v]) => {
      if (v !== '' && v !== undefined && v !== null) cleaned[k] = v
    })
    setPageNum(1)
    setSearchParams(cleaned)
  }, [searchForm])

  const handleReset = useCallback(() => {
    searchForm.resetFields()
    setPageNum(1)
    setSearchParams({})
  }, [searchForm])

  const columns: TableProps<UserVO>['columns'] = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 180,
      render: (id: number) => <span className={styles.idCell}>{id}</span>,
    },
    {
      title: '头像',
      dataIndex: 'userAvatar',
      key: 'userAvatar',
      width: 72,
      render: (avatar: string) =>
        avatar ? (
          <Avatar src={avatar} size={36} />
        ) : (
          <Avatar icon={<UserOutlined />} size={36} />
        ),
    },
    {
      title: '用户名',
      dataIndex: 'userName',
      key: 'userName',
      width: 80,
      render: (name: string) => (
        <span style={{ fontWeight: 500 }}>{name || '-'}</span>
      ),
    },
    {
      title: '账号',
      dataIndex: 'userAccount',
      key: 'userAccount',
      width: 120,
      render: (account: string) => (
        <span style={{ color: 'rgba(0,0,0,0.65)' }}>{account || '-'}</span>
      ),
    },
    {
      title: '角色',
      dataIndex: 'userRole',
      key: 'userRole',
      width: 100,
      render: (role: string) => {
        const label = ROLE_OPTIONS.find(o => o.value === role)?.label || role
        return <Badge status={ROLE_COLOR[role] ?? 'default'} text={label} />
      },
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
            {t.replace('T', ' ').slice(0, 19)}
          </span>
        ) : (
          '-'
        ),
    },
    {
      title: '操作',
      key: 'action',
      width: 130,
      fixed: 'right',
      render: (_, record) => (
        <div className={styles.actionCell}>
          <Button
            type="link"
            size="small"
            className={styles.actionBtn}
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            编辑
          </Button>
          <Popconfirm
            title="确认删除"
            description="确定要删除该用户吗？"
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
          <h2 className={styles.title}>用户管理</h2>
          <span className={styles.subtitle}>管理平台注册用户</span>
        </div>
        <Button
          icon={<ReloadOutlined />}
          onClick={() => void loadUserList()}
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
            <Col xs={24} sm={12} md={6} lg={5}>
              <Form.Item name="userName" label="用户名">
                <Input placeholder="模糊搜索" allowClear />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12} md={6} lg={5}>
              <Form.Item name="userAccount" label="账号">
                <Input placeholder="精确匹配" allowClear />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12} md={6} lg={4}>
              <Form.Item name="userRole" label="角色">
                <Select placeholder="全部" allowClear options={ROLE_OPTIONS} />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12} md={6} lg={4}>
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
            <TeamOutlined style={{ color: '#1677ff', marginRight: 8 }} />
            用户列表
            <span className={styles.toolbarCount}>共 {total} 条</span>
          </div>
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
            新增用户
          </Button>
        </div>
        <Table
          columns={columns}
          dataSource={dataSource}
          rowKey="id"
          loading={loading}
          scroll={{ x: 900 }}
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

      <Modal
        title={modalType === 'add' ? '新增用户' : '编辑用户'}
        open={modalVisible}
        onOk={handleSubmit}
        onCancel={() => setModalVisible(false)}
        width={520}
        okText="确定"
        cancelText="取消"
      >
        <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item
            name="userName"
            label="用户名"
            rules={[{ required: true, message: '请输入用户名' }]}
          >
            <Input placeholder="请输入用户名" />
          </Form.Item>
          {modalType === 'add' && (
            <Form.Item
              name="userAccount"
              label="账号"
              rules={[{ required: true, message: '请输入账号' }]}
            >
              <Input placeholder="请输入账号" />
            </Form.Item>
          )}
          <Form.Item name="userAvatar" label="头像URL">
            <Input placeholder="请输入头像URL" />
          </Form.Item>
          <Form.Item name="userProfile" label="简介">
            <Input.TextArea placeholder="请输入简介" rows={3} />
          </Form.Item>
          <Form.Item
            name="userRole"
            label="角色"
            rules={[{ required: true, message: '请选择角色' }]}
            initialValue="user"
          >
            <Select placeholder="请选择角色" options={ROLE_OPTIONS} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}

export default UserManage
