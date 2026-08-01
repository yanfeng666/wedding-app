import { useState, useEffect, useCallback } from 'react';
import { Card, Table, Button, Popconfirm, Statistic, Row, Col, Spin, Space } from 'antd';
import { DeleteOutlined } from '@ant-design/icons';

export default function RsvpSection({ token, showToast }) {
  const [rsvps, setRsvps] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchRsvps = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/rsvps', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('获取失败');
      const data = await res.json();
      setRsvps(data);
    } catch {
      showToast('获取 RSVP 失败', 'error');
    } finally {
      setLoading(false);
    }
  }, [token, showToast]);

  useEffect(() => {
    fetchRsvps();
  }, [fetchRsvps]);

  const deleteRsvp = async (id) => {
    try {
      const res = await fetch(`/api/admin/rsvps/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('删除失败');
      setRsvps(prev => prev.filter(r => r.id !== id));
      showToast('已删除');
    } catch {
      showToast('删除失败', 'error');
    }
  };

  const columns = [
    {
      title: '姓名',
      dataIndex: 'name',
      key: 'name',
      width: 120,
    },
    {
      title: '电话',
      dataIndex: 'phone',
      key: 'phone',
      width: 150,
      render: (v) => v || '未提供',
    },
    {
      title: '提交时间',
      dataIndex: 'created_at',
      key: 'created_at',
      width: 180,
      render: (v) => new Date(v).toLocaleString('zh-CN'),
    },
    {
      title: '操作',
      key: 'actions',
      width: 100,
      render: (_, record) => (
        <Popconfirm title="确定删除此 RSVP？" onConfirm={() => deleteRsvp(record.id)}>
          <Button size="small" danger icon={<DeleteOutlined />}>删除</Button>
        </Popconfirm>
      ),
    },
  ];

  if (loading) return <div style={{ textAlign: 'center', paddingTop: 100 }}><Spin size="large" /></div>;

  return (
    <div>
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={8}>
          <Card><Statistic title="确认人数" value={rsvps.length} /></Card>
        </Col>
      </Row>

      <Card>
        <Table
          dataSource={rsvps}
          columns={columns}
          rowKey="id"
          pagination={{ pageSize: 10 }}
        />
      </Card>
    </div>
  );
}
