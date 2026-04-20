import { useState, useCallback, useEffect } from 'react'
import {
  Card,
  Table,
  Button,
  Space,
  Modal,
  Form,
  Input,
  Select,
  message,
  Popconfirm,
  Avatar,
} from 'antd'
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  UserOutlined,
} from '@ant-design/icons'
import type { TableProps } from 'antd'
import {
  addUser,
  deleteUser,
  updateUser,
  listUserVOByPage,
} from '@/api/endpoints/user-controller'
import type { UserVO, UserAddRequest, UserUpdateRequest } from '@/api'

interface UserFormData {
  id?: number
  userName: string
  userAccount?: string
  userAvatar?: string
  userProfile?: string
  userRole: string
}

function UserManage() {
  const [form] = Form.useForm<UserFormData>()
  const [searchForm] = Form.useForm()

  const [loading, setLoading] = useState(false)
  const [dataSource, setDataSource] = useState<UserVO[]>([])
  const [total, setTotal] = useState(0)
  const [pageNum, setPageNum] = useState(1)
  const [pageSize, setPageSize] = useState(10)

  const [modalVisible, setModalVisible] = useState(false)
  const [modalType, setModalType] = useState<'add' | 'edit'>('add')
  const [editingUser, setEditingUser] = useState<UserVO | null>(null)

  // 加载用户列表
  const loadUserList = useCallback(async () => {
    setLoading(true)
    try {
      const searchValues = searchForm.getFieldsValue()
      const res = await listUserVOByPage({
        pageNum,
        pageSize,
        ...searchValues,
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
  }, [pageNum, pageSize, searchForm])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadUserList()
  }, [loadUserList])

  // 打开新增弹窗
  const handleAdd = useCallback(() => {
    setModalType('add')
    setEditingUser(null)
    form.resetFields()
    setModalVisible(true)
  }, [form])

  // 打开编辑弹窗
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

  // 删除用户
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

  // 提交表单
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

  // 搜索
  const handleSearch = useCallback(() => {
    setPageNum(1)
    loadUserList()
  }, [loadUserList])

  // 重置搜索
  const handleReset = useCallback(() => {
    searchForm.resetFields()
    setPageNum(1)
    loadUserList()
  }, [searchForm, loadUserList])

  const columns: TableProps<UserVO>['columns'] = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 80,
    },
    {
      title: '头像',
      dataIndex: 'userAvatar',
      key: 'userAvatar',
      width: 80,
      render: (avatar: string) =>
        avatar ? <Avatar src={avatar} /> : <Avatar icon={<UserOutlined />} />,
    },
    {
      title: '用户名',
      dataIndex: 'userName',
      key: 'userName',
    },
    {
      title: '账号',
      dataIndex: 'userAccount',
      key: 'userAccount',
    },
    {
      title: '简介',
      dataIndex: 'userProfile',
      key: 'userProfile',
      ellipsis: true,
    },
    {
      title: '角色',
      dataIndex: 'userRole',
      key: 'userRole',
      render: (role: string) => {
        const roleMap: Record<string, string> = {
          admin: '管理员',
          user: '普通用户',
        }
        return roleMap[role] || role
      },
    },
    {
      title: '创建时间',
      dataIndex: 'createTime',
      key: 'createTime',
      width: 180,
    },
    {
      title: '操作',
      key: 'action',
      width: 150,
      fixed: 'right',
      render: (_, record) => (
        <Space>
          <Button
            type="link"
            size="small"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            编辑
          </Button>
          <Popconfirm
            title="确认删除"
            description="确定要删除该用户吗？"
            onConfirm={() => handleDelete(record.id!)}
            okText="确定"
            cancelText="取消"
          >
            <Button type="link" size="small" danger icon={<DeleteOutlined />}>
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ]

  return (
    <Card>
      <Space
        size="middle"
        style={{ width: '100%', display: 'flex', flexDirection: 'column' }}
      >
        {/* 搜索栏 */}
        <Form form={searchForm} layout="inline">
          <Form.Item name="userName" label="用户名">
            <Input placeholder="请输入用户名" allowClear />
          </Form.Item>
          <Form.Item name="userAccount" label="账号">
            <Input placeholder="请输入账号" allowClear />
          </Form.Item>
          <Form.Item name="userRole" label="角色">
            <Select
              placeholder="请选择角色"
              allowClear
              style={{ width: 120 }}
              options={[
                { label: '管理员', value: 'admin' },
                { label: '普通用户', value: 'user' },
              ]}
            />
          </Form.Item>
          <Form.Item>
            <Space>
              <Button type="primary" onClick={handleSearch}>
                搜索
              </Button>
              <Button onClick={handleReset}>重置</Button>
            </Space>
          </Form.Item>
        </Form>

        {/* 操作按钮 */}
        <div>
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
            新增用户
          </Button>
        </div>

        {/* 表格 */}
        <Table
          columns={columns}
          dataSource={dataSource}
          rowKey="id"
          loading={loading}
          pagination={{
            current: pageNum,
            pageSize,
            total,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: total => `共 ${total} 条`,
            onChange: (page, size) => {
              setPageNum(page)
              setPageSize(size)
            },
          }}
        />
      </Space>

      {/* 新增/编辑弹窗 */}
      <Modal
        title={modalType === 'add' ? '新增用户' : '编辑用户'}
        open={modalVisible}
        onOk={handleSubmit}
        onCancel={() => setModalVisible(false)}
        width={600}
      >
        <Form form={form} layout="vertical" style={{ marginTop: 20 }}>
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
            <Select
              placeholder="请选择角色"
              options={[
                { label: '管理员', value: 'admin' },
                { label: '普通用户', value: 'user' },
              ]}
            />
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  )
}

export default UserManage
