import { useState, useEffect, useCallback } from 'react';

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
      setBlessings(prev =>
        prev.map(b => b.id === id ? { ...b, status } : b)
      );
      showToast(status === 'approved' ? '已通过' : status === 'rejected' ? '已拒绝' : '已设为待审核');
    } catch {
      showToast('操作失败', 'error');
    }
  };

  const deleteBlessing = async (id) => {
    if (!confirm('确定要删除这条祝福吗？')) return;
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

  if (loading) return <div className="loading">加载中...</div>;

  return (
    <div>
      <div className="page-header">
        <h2>留言管理</h2>
        <p>审核和管理访客提交的祝福留言</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="number">{stats.total}</div>
          <div className="label">总留言数</div>
        </div>
        <div className="stat-card">
          <div className="number" style={{ color: '#27ae60' }}>{stats.approved}</div>
          <div className="label">已通过</div>
        </div>
        <div className="stat-card">
          <div className="number" style={{ color: '#f39c12' }}>{stats.pending}</div>
          <div className="label">待审核</div>
        </div>
        <div className="stat-card">
          <div className="number" style={{ color: '#e74c3c' }}>{stats.rejected}</div>
          <div className="label">已拒绝</div>
        </div>
      </div>

      <div className="card">
        <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
          {[
            { id: 'all', label: '全部' },
            { id: 'approved', label: '已通过' },
            { id: 'pending', label: '待审核' },
            { id: 'rejected', label: '已拒绝' },
          ].map(tab => (
            <button
              key={tab.id}
              className={`btn btn-sm ${filter === tab.id ? 'btn-primary' : ''}`}
              style={filter === tab.id ? {} : { background: '#f0f0f0', color: '#666' }}
              onClick={() => setFilter(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {filtered.length === 0 ? (
          <div className="loading">暂无留言</div>
        ) : (
          filtered.map(b => (
            <div key={b.id} className={`blessing-card status-${b.status || 'approved'}`}>
              <div className="header">
                <div>
                  <span className="name">{b.name}</span>
                  <span className="meta"> · {b.relation || '亲友'}</span>
                </div>
                <span className={`status-badge ${b.status || 'approved'}`}>
                  {b.status === 'pending' ? '待审核' : b.status === 'rejected' ? '已拒绝' : '已通过'}
                </span>
              </div>
              <div className="meta">
                {new Date(b.created_at).toLocaleString('zh-CN')}
              </div>
              <div className="message">{b.message}</div>
              <div className="actions">
                {b.status !== 'approved' && (
                  <button className="btn btn-sm btn-success" onClick={() => updateStatus(b.id, 'approved')}>
                    通过
                  </button>
                )}
                {b.status !== 'rejected' && (
                  <button className="btn btn-sm btn-warning" onClick={() => updateStatus(b.id, 'rejected')}>
                    拒绝
                  </button>
                )}
                {b.status !== 'pending' && (
                  <button className="btn btn-sm btn-primary" style={{ background: '#999' }} onClick={() => updateStatus(b.id, 'pending')}>
                    设为待审核
                  </button>
                )}
                <button className="btn btn-sm btn-danger" onClick={() => deleteBlessing(b.id)}>
                  删除
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
