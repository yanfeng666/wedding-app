import { useState } from 'react';
import './Blessings.css';

export default function Blessings({ blessings = [], onSubmit, textColor }) {
  const [name, setName] = useState('');
  const [relation, setRelation] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState('');

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) { showToast('请输入您的姓名'); return; }
    if (!message.trim()) { showToast('请输入您的祝福'); return; }

    setSubmitting(true);
    const success = await onSubmit({
      name: name.trim(),
      relation: relation.trim() || '亲友',
      message: message.trim(),
    });

    if (success) {
      setName('');
      setRelation('');
      setMessage('');
      showToast('感谢您的祝福！💕');
    } else {
      showToast('提交失败，请稍后再试');
    }
    setSubmitting(false);
  };

  const getAvatarColor = (name) => {
    const colors = ['#e91e63', '#9c27b0', '#3f51b5', '#009688', '#ff5722', '#795548', '#607d8b'];
    let hash = 0;
    for (let i = 0; i < (name || '').length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    const now = new Date();
    const diff = (now - date) / 1000;
    if (diff < 60) return '刚刚';
    if (diff < 3600) return `${Math.floor(diff / 60)}分钟前`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}小时前`;
    if (diff < 604800) return `${Math.floor(diff / 86400)}天前`;
    return date.toLocaleDateString('zh-CN');
  };

  const vars = textColor ? { '--text': textColor, '--text-light': textColor, '--heading-color': textColor } : {};

  return (
    <section className="blessings section-padding" id="blessings" style={vars}>
      <div className="container">
        <div className="section-header fade-in-scroll">
          <span className="label">Blessings</span>
          <h2>祝福留言</h2>
          <div className="divider"><span>♥</span></div>
        </div>

        <form className="blessing-form fade-in-scroll" onSubmit={handleSubmit}>
          <div className="form-row">
            <input
              type="text"
              placeholder="您的姓名"
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={20}
            />
            <input
              type="text"
              placeholder="与新人的关系（如：同学、同事）"
              value={relation}
              onChange={(e) => setRelation(e.target.value)}
              maxLength={20}
            />
          </div>
          <textarea
            placeholder="写下您的祝福..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            maxLength={300}
            style={{ marginBottom: 16 }}
          />
          <button type="submit" className="submit-btn" disabled={submitting}>
            {submitting ? '提交中...' : '💝 送上祝福'}
          </button>
        </form>

        {blessings.length > 0 && (
          <div className="blessings-scroll">
            {blessings.map((b, i) => (
              <div key={b.id || i} className="blessing-item">
                <div className="blessing-avatar" style={{ background: getAvatarColor(b.name) }}>
                  {(b.name || '?').charAt(0)}
                </div>
                <div className="blessing-content-wrap">
                  <div className="blessing-header">
                    <span className="blessing-name">{b.name}</span>
                    <span className="blessing-meta">
                      <span className="blessing-relation">{b.relation}</span>
                      <span className="blessing-time">{formatTime(b.created_at)}</span>
                    </span>
                  </div>
                  <p className="blessing-message">{b.message}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {toast && <div className="blessing-toast">{toast}</div>}
    </section>
  );
}
