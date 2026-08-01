import { useState } from 'react';
import { Card, Button, Form, Input } from 'antd';
import ImageUpload from '../components/ImageUpload';

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
  const [saving, setSaving] = useState(false);

  const handleChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = () => {
    setSaving(true);
    onSave(form);
    setSaving(false);
  };

  return (
    <div>
      {BACKGROUNDS.map(bg => (
        <Card
          key={bg.key}
          title={bg.label}
          style={{ marginBottom: 16 }}
          extra={<span style={{ color: '#999', fontSize: 13 }}>{bg.desc}</span>}
        >
          <Form layout="vertical">
            <Form.Item label="背景图片">
              <ImageUpload
                value={form[bg.key]}
                onChange={(val) => handleChange(bg.key, val)}
              />
            </Form.Item>
          </Form>
        </Card>
      ))}
      <Button type="primary" size="large" onClick={handleSubmit} loading={saving}>
        保存背景配置
      </Button>
    </div>
  );
}
