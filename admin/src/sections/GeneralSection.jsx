import { useState } from 'react';

export default function GeneralSection({ config, onSave }) {
  const [form, setForm] = useState({
    groom_name: config.groom_name || '',
    bride_name: config.bride_name || '',
    wedding_date: config.wedding_date || '',
    wedding_date_display: config.wedding_date_display || '',
    navbar_logo: config.navbar_logo || '',
    footer_quote: config.footer_quote || '',
  });

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
        <h2>基本配置</h2>
        <p>设置新郎新娘姓名、婚礼日期、导航栏标题和页脚文案</p>
      </div>
      <form onSubmit={handleSubmit}>
        <div className="card">
          <h3>新人姓名</h3>
          <div className="form-row">
            <div className="form-group">
              <label>新郎姓名</label>
              <input
                type="text"
                value={form.groom_name}
                onChange={(e) => handleChange('groom_name', e.target.value)}
                placeholder="如：张三"
              />
            </div>
            <div className="form-group">
              <label>新娘姓名</label>
              <input
                type="text"
                value={form.bride_name}
                onChange={(e) => handleChange('bride_name', e.target.value)}
                placeholder="如：李四"
              />
            </div>
          </div>
        </div>

        <div className="card">
          <h3>婚礼日期</h3>
          <div className="form-group">
            <label>婚礼日期时间（用于倒计时）</label>
            <input
              type="text"
              value={form.wedding_date}
              onChange={(e) => handleChange('wedding_date', e.target.value)}
              placeholder="如：2026-10-01T18:08:00"
            />
            <small style={{ color: '#999', fontSize: 12 }}>格式：YYYY-MM-DDTHH:mm:ss</small>
          </div>
          <div className="form-group">
            <label>日期显示文案</label>
            <input
              type="text"
              value={form.wedding_date_display}
              onChange={(e) => handleChange('wedding_date_display', e.target.value)}
              placeholder="如：2026年10月1日 · 星期四"
            />
          </div>
        </div>

        <div className="card">
          <h3>界面文案</h3>
          <div className="form-group">
            <label>导航栏标题</label>
            <input
              type="text"
              value={form.navbar_logo}
              onChange={(e) => handleChange('navbar_logo', e.target.value)}
              placeholder="如：我们结婚啦"
            />
          </div>
          <div className="form-group">
            <label>页脚寄语</label>
            <input
              type="text"
              value={form.footer_quote}
              onChange={(e) => handleChange('footer_quote', e.target.value)}
              placeholder="如：执子之手，与子偕老"
            />
          </div>
        </div>

        <button type="submit" className="btn btn-primary btn-save">保存配置</button>
      </form>
    </div>
  );
}
