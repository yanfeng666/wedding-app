import { useState } from 'react';
import './Invitation.css';

const API_BASE = '/api';

export default function Invitation({ config, bgImage }) {
  const [modalOpen, setModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const inv = config?.invitation_text || {};
  const groom = config?.groom_name || '张三';
  const bride = config?.bride_name || '李四';

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('请输入您的姓名');
      return;
    }
    setError('');
    setSubmitting(true);
    try {
      const res = await fetch(`${API_BASE}/rsvp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), phone: phone.trim() }),
      });
      if (res.ok) {
        setSubmitted(true);
      } else {
        const data = await res.json();
        setError(data.error || '提交失败，请重试');
      }
    } catch {
      setError('网络错误，请重试');
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    setModalOpen(false);
    setName('');
    setPhone('');
    setError('');
    setSubmitted(false);
  };

  const sectionStyle = bgImage
    ? { backgroundImage: `url(${bgImage})`, backgroundSize: 'cover', backgroundPosition: 'center', backgroundAttachment: 'fixed' }
    : {};

  return (
    <section className="invitation section-padding" id="invitation" style={sectionStyle}>
      <div className="container">
        <div className="invitation-card fade-in-scroll">
          <span className="invitation-label">{inv.label || 'You are Invited'}</span>
          <h2>{inv.title || '诚挚邀请'}</h2>
          <div className="invitation-names">{inv.names || `${groom} & ${bride}`}</div>
          <p className="invitation-text">
            {(inv.content || '').split('\n').map((line, i) => (
              <span key={i}>{line}<br /></span>
            ))}
          </p>
          {(inv.details || []).map((detail, i) => (
            <div key={i} className="invitation-detail"><span>{detail}</span></div>
          ))}
          <button className="rsvp-btn" onClick={() => setModalOpen(true)}>确认参加</button>
        </div>
      </div>

      {modalOpen && (
        <div className="rsvp-overlay" onClick={handleClose}>
          <div className="rsvp-modal" onClick={(e) => e.stopPropagation()}>
            <button className="rsvp-modal-close" onClick={handleClose}>&times;</button>

            {!submitted ? (
              <>
                <div className="rsvp-modal-header">
                  <span className="rsvp-modal-icon">💌</span>
                  <h3>确认参加</h3>
                  <p>请填写以下信息，我们期待您的到来</p>
                </div>
                <form className="rsvp-form" onSubmit={handleSubmit}>
                  <div className="rsvp-field">
                    <label htmlFor="rsvp-name">
                      姓名 <span className="rsvp-required">*</span>
                    </label>
                    <input
                      id="rsvp-name"
                      type="text"
                      placeholder="请输入您的姓名"
                      value={name}
                      onChange={(e) => { setName(e.target.value); setError(''); }}
                      autoFocus
                    />
                  </div>
                  <div className="rsvp-field">
                    <label htmlFor="rsvp-phone">手机号 <span className="rsvp-optional">（选填）</span></label>
                    <input
                      id="rsvp-phone"
                      type="tel"
                      placeholder="请输入您的手机号"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                    />
                  </div>
                  {error && <div className="rsvp-error">{error}</div>}
                  <button type="submit" className="rsvp-submit-btn" disabled={submitting}>
                    {submitting ? '提交中...' : '确认参加'}
                  </button>
                </form>
              </>
            ) : (
              <div className="rsvp-success">
                <div className="rsvp-success-icon">🎉</div>
                <h3>回复成功！</h3>
                <p>感谢您的回复，{name || '亲爱的朋友'}！</p>
                <p className="rsvp-success-sub">我们期待在婚礼上与您相见</p>
                <button className="rsvp-submit-btn" onClick={handleClose}>关闭</button>
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
