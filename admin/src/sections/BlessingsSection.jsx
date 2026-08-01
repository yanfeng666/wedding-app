import { useState, useEffect, useCallback } from 'react';
import { Card, Table, Tag, Button, Space, Segmented, Popconfirm, Statistic, Row, Col, Spin } from 'antd';
import { CheckOutlined, CloseOutlined, DeleteOutlined, ClockCircleOutlined } from '@ant-design/icons';

export default function BlessingsSection({ token, showToast }) {
  const [blessings, setBlessings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  const fetchBlessings = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/blessings', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('获取失败');
      const data = await res.json();
      setBlessings(data);
    } catch {
      showToast('获取祝福列表失败', 'error');
    } finally {
      setLoading(false);
    }
  }, [token, showToast]);

  useEffect(() => {
    fetchBlessings();
  }, [fetchBlessings]);

  const updateStatus = async (id, status) => {
    try {
      const res = await fetch(`/api/admin/blessings/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error('操作失败');
      setBlessings(prev => prev.map(b => b.id === id ? { ...b, status } : b));
      showToast(status === 'approved' ? '已通过' : status === 'rejected' ? '已拒绝' : '已设为待审核');
    } catch {
      showToast('操作失败', 'error');
    }
  };

  const deleteBlessing = async (id) => {
    try {
      const res = await fetch(`/api/admin/blessings/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('删除失败');
      setBlessings(prev => prev.filter(b => b.id !== id));
      showToast('已删除');
    } catch {
      showToast('删除失败', 'error');
    }
  };

  const filtered = filter === 'all'
    ? blessings
    : blessings.filter(b => (b.status || 'approved') === filter);

  const stats = {
    total: blessings.length,
    approved: blessings.filter(b => (b.status || 'approved') === 'approved').length,
    pending: blessings.filter(b => b.status === 'pending').length,
    rejected: blessings.filter(b => b.status === 'rejected').length,
  };

  const statusTag = (status) => {
    const s = status || 'approved';
    const config = {
      approved: { color: 'green', text: '已通过' },
      pending: { color: 'orange', text: '待审核' },
      rejected: { color: 'red', text: '已拒绝' },
    };
    const c = config[s] || config.approved;
    return <Tag color={c.color}>{c.text}</Tag>;
  };

  const columns = [
    {
      title: '姓名',
      dataIndex: 'name',
      key: 'name',
      width: 100,
    },
    {
      title: '关系',
      dataIndex: 'relation',
      key: 'relation',
      width: 80,
      render: (v) => v || '亲友',
    },
    {
      title: '留言',
      dataIndex: 'message',
      key: 'message',
      ellipsis: true,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 90,
      render: statusTag,
    },
    {
      title: '时间',
      dataIndex: 'created_at',
      key: 'created_at',
      width: 160,
      render: (v) => new Date(v).toLocaleString('zh-CN'),
    },
    {
      title: '操作',
      key: 'actions',
      width: 240,
      render: (_, record) => (
        <Space>
          {record.status !== 'approved' && (
            <Button size="small" type="primary" icon={<CheckOutlined />} onClick={() => updateStatus(record.id, 'approved')}>
              通过
            </Button>
          )}
          {record.status !== 'rejected' && (
            <Button size="small" icon={<CloseOutlined />} onClick={() => updateStatus(record.id, 'rejected')}>
              拒绝
            </Button>
          )}
          <Popconfirm title="确定删除？" onConfirm={() => deleteBlessing(record.id)}>
            <Button size="small" danger icon={<DeleteOutlined />}>删除</Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  if (loading) return <div style={{ textAlign: 'center', paddingTop: 100 }}><Spin size="large" /></div>;

  return (
    <div>
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={6}>
          <Card><Statistic title="总留言数" value={stats.total} /></Card>
        </Col>
        <Col span={6}>
          <Card><Statistic title="已通过" value={stats.approved} valueStyle={{ color: '#52c41a' }} /></Card>
        </Col>
        <Col span={6}>
          <Card><Statistic title="待审核" value={stats.pending} valueStyle={{ color: '#faad14' }} /></Card>
        </Col>
        <Col span={6}>
          <Card><Statistic title="已拒绝" value={stats.rejected} valueStyle={{ color: '#ff4d4f' }} /></Card>
        </Col>
      </Row>

      <Card>
        <Segmented
          value={filter}
          onChange={setFilter}
          options={[
            { label: '全部', value: 'all' },
            { label: '已通过', value: 'approved' },
            { label: '待审核', value: 'pending' },
            { label: '已拒绝', value: 'rejected' },
          ]}
          style={{ marginBottom: 16 }}
        />
        <Table
          dataSource={filtered}
          columns={columns}
          rowKey="id"
          pagination={{ pageSize: 10 }}
          scroll={{ x: 800 }}
        />
      </Card>
    </div>
  );
}
