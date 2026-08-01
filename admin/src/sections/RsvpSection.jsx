import { useState, useEffect, useCallback } from 'react';

export default function RsvpSection({ token }) {
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
      console.error('获取 RSVP 失败');
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchRsvps();
  }, [fetchRsvps]);

  if (loading) return <div className="loading">加载中...</div>;

  return (
    <div>
      <div className="page-header">
        <h2>RSVP 管理</h2>
        <p>查看已确认参加婚礼的嘉宾名单</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="number">{rsvps.length}</div>
          <div className="label">确认人数</div>
        </div>
      </div>

      <div className="card">
        {rsvps.length === 0 ? (
          <div className="loading">暂无 RSVP 记录</div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #f0f0f0' }}>
                <th style={{ textAlign: 'left', padding: '12px 8px', fontSize: 14, color: '#666' }}>姓名</th>
                <th style={{ textAlign: 'left', padding: '12px 8px', fontSize: 14, color: '#666' }}>电话</th>
                <th style={{ textAlign: 'left', padding: '12px 8px', fontSize: 14, color: '#666' }}>时间</th>
              </tr>
            </thead>
            <tbody>
              {rsvps.map(r => (
                <tr key={r.id} style={{ borderBottom: '1px solid #f5f5f5' }}>
                  <td style={{ padding: '12px 8px', fontSize: 14, fontWeight: 500 }}>{r.name}</td>
                  <td style={{ padding: '12px 8px', fontSize: 14, color: '#666' }}>{r.phone || '未提供'}</td>
                  <td style={{ padding: '12px 8px', fontSize: 13, color: '#999' }}>
                    {new Date(r.created_at).toLocaleString('zh-CN')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
