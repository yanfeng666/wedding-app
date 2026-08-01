import { useState, useEffect, useCallback } from 'react';
import {
  Card, Table, Button, Space, Modal, Form, Input, Tag,
  Popconfirm, Typography, Alert,
} from 'antd';
import {
  PlusOutlined, KeyOutlined, DeleteOutlined, UserOutlined,
  ReloadOutlined,
} from '@ant-design/icons';

const { Text, Paragraph } = Typography;

export default function UsersSection({ token, showToast, currentUser }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [pwdModal, setPwdModal] = useState({ open: false, userId: null, username: '' });
  const [sqlModal, setSqlModal] = useState({ open: false, sql: '' });
  const [createForm] = Form.useForm();
  const [pwdForm] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/users', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('获取失败');
      const data = await res.json();
      setUsers(data);
    } catch {
      showToast('获取账号列表失败', 'error');
    } finally {
      setLoading(false);
    }
  }, [token, showToast]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleCreate = async () => {
    try {
      const values = await createForm.validateFields();
      setSubmitting(true);
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(values),
      });
      const data = await res.json();
      if (!res.ok) {
        // 如果返回了 SQL，说明表不存在，弹窗显示建表语句
        if (data.sql) {
          setSqlModal({ open: true, sql: data.sql });
          setCreateModalOpen(false);
          throw new Error(data.error);
        }
        throw new Error(data.error || '创建失败');
      }
      showToast('账号创建成功');
      setCreateModalOpen(false);
      createForm.resetFields();
      fetchUsers();
    } catch (err) {
      if (err.errorFields) return; // 表单校验错误
      showToast(err.message || '创建失败', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleChangePassword = async () => {
    try {
      const values = await pwdForm.validateFields();
      setSubmitting(true);
      const res = await fetch(`/api/admin/users/${pwdModal.userId}/password`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ password: values.password }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || '修改失败');
      }
      showToast('密码修改成功');
      setPwdModal({ open: false, userId: null, username: '' });
      pwdForm.resetFields();
    } catch (err) {
      if (err.errorFields) return;
      showToast(err.message || '修改失败', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      const res = await fetch(`/api/admin/users/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || '删除失败');
      }
      showToast('账号已删除');
      fetchUsers();
    } catch (err) {
      showToast(err.message || '删除失败', 'error');
    }
  };

  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 60,
    },
    {
      title: '用户名',
      dataIndex: 'username',
      key: 'username',
      render: (v, record) => (
        <Space>
          <UserOutlined />
          <Text strong>{v}</Text>
          {record.username === currentUser && <Tag color="pink">当前登录</Tag>}
        </Space>
      ),
    },
    {
      title: '创建时间',
      dataIndex: 'created_at',
      key: 'created_at',
      width: 180,
      render: (v) => (v ? new Date(v).toLocaleString('zh-CN') : '系统账号'),
    },
    {
      title: '操作',
      key: 'actions',
      width: 200,
      render: (_, record) => (
        <Space>
          <Button
            size="small"
            icon={<KeyOutlined />}
            onClick={() => {
              setPwdModal({ open: true, userId: record.id, username: record.username });
              pwdForm.resetFields();
            }}
          >
            修改密码
          </Button>
          <Popconfirm
            title={`确定删除账号「${record.username}」吗？`}
            description="此操作不可恢复"
            onConfirm={() => handleDelete(record.id)}
            okText="删除"
            okButtonProps={{ danger: true }}
            cancelText="取消"
          >
            <Button size="small" danger icon={<DeleteOutlined />}>删除</Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <Alert
        type="info"
        showIcon
        message="账号管理说明"
        description="此处可创建、删除管理端账号，以及修改任意账号的密码。密码使用 SHA-256 加密存储，请妥善保管。"
        style={{ marginBottom: 16 }}
      />

      <Card
        title="管理账号列表"
        extra={
          <Space>
            <Button icon={<ReloadOutlined />} onClick={fetchUsers}>刷新</Button>
            <Button type="primary" icon={<PlusOutlined />} onClick={() => { createForm.resetFields(); setCreateModalOpen(true); }}>
              新建账号
            </Button>
          </Space>
        }
      >
        <Table
          dataSource={users}
          columns={columns}
          rowKey="id"
          loading={loading}
          pagination={false}
          locale={{ emptyText: '暂无账号（使用环境变量中的默认账号登录）' }}
        />
      </Card>

      {/* 创建账号弹窗 */}
      <Modal
        title="新建管理账号"
        open={createModalOpen}
        onOk={handleCreate}
        onCancel={() => { setCreateModalOpen(false); createForm.resetFields(); }}
        confirmLoading={submitting}
        okText="创建"
        cancelText="取消"
      >
        <Form form={createForm} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item
            name="username"
            label="用户名"
            rules={[
              { required: true, message: '请输入用户名' },
              { min: 2, message: '用户名至少 2 个字符' },
            ]}
          >
            <Input prefix={<UserOutlined />} placeholder="请输入用户名" autoComplete="off" />
          </Form.Item>
          <Form.Item
            name="password"
            label="密码"
            rules={[
              { required: true, message: '请输入密码' },
              { min: 6, message: '密码至少 6 个字符' },
            ]}
          >
            <Input.Password placeholder="请输入密码" autoComplete="new-password" />
          </Form.Item>
        </Form>
      </Modal>

      {/* 修改密码弹窗 */}
      <Modal
        title={`修改密码 · ${pwdModal.username}`}
        open={pwdModal.open}
        onOk={handleChangePassword}
        onCancel={() => { setPwdModal({ open: false, userId: null, username: '' }); pwdForm.resetFields(); }}
        confirmLoading={submitting}
        okText="保存"
        cancelText="取消"
      >
        <Form form={pwdForm} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item
            name="password"
            label="新密码"
            rules={[
              { required: true, message: '请输入新密码' },
              { min: 6, message: '密码至少 6 个字符' },
            ]}
          >
            <Input.Password placeholder="请输入新密码" autoComplete="new-password" />
          </Form.Item>
          <Form.Item
            name="confirm"
            label="确认新密码"
            dependencies={['password']}
            rules={[
              { required: true, message: '请确认密码' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('password') === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error('两次输入的密码不一致'));
                },
              }),
            ]}
          >
            <Input.Password placeholder="请再次输入新密码" autoComplete="new-password" />
          </Form.Item>
        </Form>
      </Modal>

      {/* 建表 SQL 弹窗 */}
      <Modal
        title="需要初始化数据表"
        open={sqlModal.open}
        onCancel={() => setSqlModal({ open: false, sql: '' })}
        footer={[
          <Button key="copy" type="primary" onClick={() => { navigator.clipboard?.writeText(sqlModal.sql); showToast('SQL 已复制到剪贴板'); }}>
            复制 SQL
          </Button>,
          <Button key="close" onClick={() => setSqlModal({ open: false, sql: '' })}>关闭</Button>,
        ]}
      >
        <Alert
          type="warning"
          showIcon
          message="admin_users 表尚未创建"
          description="请前往 Supabase 控制台 → SQL Editor，粘贴并执行以下 SQL，然后重新创建账号。"
          style={{ marginBottom: 16 }}
        />
        <Paragraph>
          <Input.TextArea value={sqlModal.sql} rows={6} readOnly style={{ fontFamily: 'monospace', fontSize: 12 }} />
        </Paragraph>
      </Modal>
    </div>
  );
}
