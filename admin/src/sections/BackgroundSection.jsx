import { useState } from 'react';

const BACKGROUNDS = [
  { key: 'hero_bg', label: '首页背景图', desc: 'Hero 区域的背景图' },
  { key: 'story_bg', label: '我们的故事背景图', desc: '故事时间线区域背景' },
  { key: 'gallery_bg', label: '婚礼相册背景图', desc: '相册轮播区域背景' },
  { key: 'info_bg', label: '婚礼信息背景图', desc: '信息卡片区域背景' },
  { key: 'invitation_bg', label: '诚挚邀请背景图', desc: '邀请函区域背景' },
];

export default function BackgroundSection({ config, onSave }) {
  const [form, setForm] = useState(
    BACKGROUNDS.reduce((acc, bg) => {
      acc[bg.key] = config[bg.key] || '';
      return acc;
    }, {})
  );

  const handleChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(form);
  };

  return (
    <div>
      <div className="page-header">
        <h2>背景图片</h2>
        <p>为各个页面区域设置背景图片（留空则使用默认渐变背景）</p>
      </div>
      <form onSubmit={handleSubmit}>
        {BACKGROUNDS.map(bg => (
          <div className="card" key={bg.key}>
            <h3>{bg.label}</h3>
            <p style={{ color: '#999', fontSize: 13, marginBottom: 12 }}>{bg.desc}</p>
            <div className="form-group">
              <label>图片 URL</label>
              <input
                type="url"
                value={form[bg.key]}
                onChange={(e) => handleChange(bg.key, e.target.value)}
                placeholder="https://example.com/image.jpg"
              />
            </div>
            {form[bg.key] && (
              <img src={form[bg.key]} alt={bg.label} className="image-preview" />
            )}
          </div>
        ))}
        <button type="submit" className="btn btn-primary btn-save">保存背景配置</button>
      </form>
    </div>
  );
}
