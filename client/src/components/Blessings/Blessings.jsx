import { useState, useRef, useEffect } from 'react';
import './Blessings.css';

export default function Blessings({ blessings = [], onSubmit }) {
  const [name, setName] = useState('');
  const [relation, setRelation] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [visibleItems, setVisibleItems] = useState(new Set());
  const listRef = useRef(null);

  useEffect(() => {
    const el = listRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const idx = Number(entry.target.dataset.index);
            setVisibleItems((prev) => new Set(prev).add(idx));
          }
        });
      },
      { threshold: 0.1 }
    );

    el.querySelectorAll('.blessing-item').forEach((item) => observer.observe(item));
    return () => observer.disconnect();
  }, [blessings]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) { alert('请输入您的姓名'); return; }
    if (!message.trim()) { alert('请输入您的祝福'); return; }

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
      alert('感谢您的祝福！💕');
    } else {
      alert('提交失败，请稍后再试');
    }
    setSubmitting(false);
  };

  return (
    <section className="blessings section-padding" id="blessings">
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

        <div className="blessings-list" ref={listRef}>
          {blessings.map((b, i) => (
            <div
              key={b.id || i}
              className={`blessing-item${visibleItems.has(i) ? ' visible' : ''}`}
              data-index={i}
            >
              <div className="blessing-header">
                <span className="blessing-name">{b.name}</span>
                <span className="blessing-time">{b.relation}</span>
              </div>
              <p className="blessing-message">{b.message}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}