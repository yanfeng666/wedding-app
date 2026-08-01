import { useState } from 'react';
import { Card, Button, Form, Input, ColorPicker, Space, Typography } from 'antd';
import ImageUpload from '../components/ImageUpload';

const { Text } = Typography;

const BACKGROUNDS = [
  { key: 'hero_bg', label: '首页背景图', desc: 'Hero 区域', bgColorKey: 'hero_bg_color' },
  { key: 'story_bg', label: '我们的故事背景图', desc: '故事时间线区域', bgColorKey: 'story_bg_color', textColorKey: 'story_text_color' },
  { key: 'gallery_bg', label: '婚礼相册背景图', desc: '相册轮播区域', bgColorKey: 'gallery_bg_color', textColorKey: 'gallery_text_color' },
  { key: 'info_bg', label: '婚礼信息背景图', desc: '信息卡片区域', bgColorKey: 'info_bg_color', textColorKey: 'info_text_color' },
  { key: 'invitation_bg', label: '诚挚邀请背景图', desc: '邀请函区域', bgColorKey: 'invitation_bg_color', textColorKey: 'invitation_text_color' },
];

export default function BackgroundSection({ config, onSave }) {
  const [form, setForm] = useState(() => {
    const initial = {};
    BACKGROUNDS.forEach((bg) => {
      initial[bg.key] = config[bg.key] || '';
      if (bg.bgColorKey) initial[bg.bgColorKey] = config[bg.bgColorKey] || '';
      if (bg.textColorKey) initial[bg.textColorKey] = config[bg.textColorKey] || '';
    });
    return initial;
  });
  const [saving, setSaving] = useState(false);

  const handleChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const handleColorChange = (field, color) => {
    setForm(prev => ({ ...prev, [field]: color?.toHexString?.() || '' }));
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
            <Form.Item label={
              <span>背景颜色 <Text type="secondary" style={{ fontSize: 12 }}>（无背景图时生效）</Text></span>
            }>
              <Space>
                <ColorPicker
                  value={form[bg.bgColorKey] || undefined}
                  onChange={(color) => handleColorChange(bg.bgColorKey, color)}
                  showText
                  format="hex"
                  allowClear
                  onClear={() => handleColorChange(bg.bgColorKey, '')}
                />
                <Input
                  style={{ width: 120 }}
                  placeholder="如 #fdf6f4"
                  value={form[bg.bgColorKey] || ''}
                  onChange={(e) => handleChange(bg.bgColorKey, e.target.value)}
                  allowClear
                />
              </Space>
            </Form.Item>
            {bg.textColorKey && (
              <Form.Item label={
                <span>区域文字颜色 <Text type="secondary" style={{ fontSize: 12 }}>（覆盖全局文字色）</Text></span>
              }>
                <Space>
                  <ColorPicker
                    value={form[bg.textColorKey] || undefined}
                    onChange={(color) => handleColorChange(bg.textColorKey, color)}
                    showText
                    format="hex"
                    allowClear
                    onClear={() => handleColorChange(bg.textColorKey, '')}
                  />
                  <Input
                    style={{ width: 120 }}
                    placeholder="留空跟随全局"
                    value={form[bg.textColorKey] || ''}
                    onChange={(e) => handleChange(bg.textColorKey, e.target.value)}
                    allowClear
                  />
                </Space>
              </Form.Item>
            )}
          </Form>
        </Card>
      ))}
      <Button type="primary" size="large" onClick={handleSubmit} loading={saving}>
        保存背景配置
      </Button>
    </div>
  );
}
