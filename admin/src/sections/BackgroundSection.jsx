import { useState } from 'react';
import { Card, Button, Form, ColorPicker, Space, Typography } from 'antd';
import ImageUpload from '../components/ImageUpload';

const { Text } = Typography;

const BACKGROUNDS = [
  { key: 'hero_bg', label: '首页背景图', desc: 'Hero 区域', bgColorKey: 'hero_bg_color', textColorKey: 'hero_text_color' },
  { key: 'story_bg', label: '我们的故事背景图', desc: '故事时间线区域', bgColorKey: 'story_bg_color', textColorKey: 'story_text_color' },
  { key: 'gallery_bg', label: '婚礼相册背景图', desc: '相册轮播区域', bgColorKey: 'gallery_bg_color', textColorKey: 'gallery_text_color' },
  { key: 'info_bg', label: '婚礼信息背景图', desc: '信息卡片区域', bgColorKey: 'info_bg_color', textColorKey: 'info_text_color' },
  { key: 'invitation_bg', label: '诚挚邀请背景图', desc: '邀请函区域', bgColorKey: 'invitation_bg_color', textColorKey: 'invitation_text_color' },
  { key: 'blessings_bg', label: '祝福留言背景图', desc: '祝福留言区域', bgColorKey: '', textColorKey: 'blessings_text_color' },
];

function ColorField({ label, value, onChange }) {
  return (
    <Form.Item label={label}>
      <Space>
        <ColorPicker
          value={value || undefined}
          onChange={(color) => onChange(color?.toHexString?.() || '')}
          showText
          format="hex"
          disabledAlpha
        />
        {value && (
          <Button size="small" type="link" onClick={() => onChange('')}>清除</Button>
        )}
      </Space>
    </Form.Item>
  );
}

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

  const handleSubmit = () => {
    setSaving(true);
    onSave(form);
    setTimeout(() => setSaving(false), 500);
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
            {bg.key !== 'blessings_bg' && (
              <Form.Item label="背景图片">
                <ImageUpload
                  value={form[bg.key]}
                  onChange={(val) => handleChange(bg.key, val)}
                />
              </Form.Item>
            )}
            {bg.bgColorKey && (
              <ColorField
                label={<span>背景颜色 <Text type="secondary" style={{ fontSize: 12 }}>（无背景图时生效）</Text></span>}
                value={form[bg.bgColorKey]}
                onChange={(val) => handleChange(bg.bgColorKey, val)}
              />
            )}
            {bg.textColorKey && (
              <ColorField
                label={<span>区域文字颜色 <Text type="secondary" style={{ fontSize: 12 }}>（滑动选择，留空跟随全局）</Text></span>}
                value={form[bg.textColorKey]}
                onChange={(val) => handleChange(bg.textColorKey, val)}
              />
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
