import { useState } from 'react';

export default function InvitationSection({ config, onSave }) {
  const [form, setForm] = useState({
    label: config.invitation_text?.label || 'You are Invited',
    title: config.invitation_text?.title || '诚挚邀请',
    names: config.invitation_text?.names || '',
    content: config.invitation_text?.content || '',
    details: config.invitation_text?.details || [],
  });

  const handleChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const updateDetail = (index, value) => {
    setForm(prev => {
      const details = [...prev.details];
      details[index] = value;
      return { ...prev, details };
    });
  };

  const addDetail = () => {
    setForm(prev => ({ ...prev, details: [...prev.details, ''] }));
  };

  const removeDetail = (index) => {
    setForm(prev => ({ ...prev, details: prev.details.filter((_, i) => i !== index) }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({ invitation_text: form });
  };

  return (
    <div>
      <div className="page-header">
        <h2>诚挚邀请</h2>
        <p>编辑电子请帖的文案内容</p>
      </div>
      <form onSubmit={handleSubmit}>
        <div className="card">
          <h3>邀请函内容</h3>
          <div className="form-row">
            <div className="form-group">
              <label>标签文字（英文）</label>
              <input
                type="text"
                value={form.label}
                onChange={(e) => handleChange('label', e.target.value)}
                placeholder="如：You are Invited"
              />
            </div>
            <div className="form-group">
              <label>标题</label>
              <input
                type="text"
                value={form.title}
                onChange={(e) => handleChange('title', e.target.value)}
                placeholder="如：诚挚邀请"
              />
            </div>
          </div>
          <div className="form-group">
            <label>新人姓名</label>
            <input
              type="text"
              value={form.names}
              onChange={(e) => handleChange('names', e.target.value)}
              placeholder="如：张三 & 李四"
            />
          </div>
          <div className="form-group">
            <label>邀请正文（用换行分段）</label>
            <textarea
              value={form.content}
              onChange={(e) => handleChange('content', e.target.value)}
              placeholder="谨定于2026年10月1日..."
              rows={5}
            />
          </div>
        </div>

        <div className="card">
          <h3>附加信息</h3>
          {form.details.map((detail, i) => (
            <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
              <input
                type="text"
                value={detail}
                onChange={(e) => updateDetail(i, e.target.value)}
                placeholder="如：🕐 17:00 迎宾"
                style={{ flex: 1, padding: '8px 12px', border: '2px solid #e8e8e8', borderRadius: 6, fontSize: 14 }}
              />
              <button type="button" className="btn btn-sm btn-danger" onClick={() => removeDetail(i)}>✕</button>
            </div>
          ))}
          <button type="button" className="btn btn-sm btn-primary" onClick={addDetail}>+ 添加信息</button>
        </div>

        <button type="submit" className="btn btn-primary btn-save">保存邀请函配置</button>
      </form>
    </div>
  );
}
