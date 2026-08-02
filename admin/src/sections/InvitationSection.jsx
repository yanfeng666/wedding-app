import { useState } from 'react';
import { Card, Button, Input, Form, Space } from 'antd';
import { PlusOutlined, MinusCircleOutlined } from '@ant-design/icons';
import TextColorPicker from '../components/TextColorPicker';

export default function InvitationSection({ config, onSave }) {
  const [form, setForm] = useState({
    label: config.invitation_text?.label || 'You are Invited',
    title: config.invitation_text?.title || '诚挚邀请',
    names: config.invitation_text?.names || '',
    content: config.invitation_text?.content || '',
    details: config.invitation_text?.details || [],
  });
  const [saving, setSaving] = useState(false);
  const sc = config.section_colors || {};
  const [colors, setColors] = useState({
    invitation_label_color: sc.invitation_label_color || '',
    invitation_title_color: sc.invitation_title_color || '',
    invitation_names_color: sc.invitation_names_color || '',
    invitation_content_color: sc.invitation_content_color || '',
    invitation_detail_color: sc.invitation_detail_color || '',
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

  const handleSubmit = () => {
    setSaving(true);
    onSave({ invitation_text: form, section_colors: { ...sc, ...colors } });
    setSaving(false);
  };

  return (
    <div>
      <Card title="文字颜色" style={{ marginBottom: 16 }}>
        <Space direction="vertical" style={{ width: '100%' }} size="middle">
          {[
            { key: 'invitation_label_color', label: '英文标签颜色' },
            { key: 'invitation_title_color', label: '主标题颜色' },
            { key: 'invitation_names_color', label: '新人姓名颜色' },
            { key: 'invitation_content_color', label: '正文内容颜色' },
            { key: 'invitation_detail_color', label: '附加信息颜色' },
          ].map(item => (
            <div key={item.key}>
              <span style={{ marginRight: 12 }}>{item.label}</span>
              <TextColorPicker
                value={colors[item.key]}
                onChange={(v) => setColors(prev => ({ ...prev, [item.key]: v }))}
              />
            </div>
          ))}
        </Space>
      </Card>

      <Card title="邀请函内容" style={{ marginBottom: 16 }}>
        <Form layout="vertical">
          <Space.Compact style={{ width: '100%' }}>
            <Form.Item label="标签文字（英文）" style={{ width: '50%', paddingRight: 8 }}>
              <Input
                placeholder="如：You are Invited"
                value={form.label}
                onChange={(e) => handleChange('label', e.target.value)}
              />
            </Form.Item>
            <Form.Item label="标题" style={{ width: '50%' }}>
              <Input
                placeholder="如：诚挚邀请"
                value={form.title}
                onChange={(e) => handleChange('title', e.target.value)}
              />
            </Form.Item>
          </Space.Compact>
          <Form.Item label="新人姓名">
            <Input
              placeholder="如：张三 & 李四"
              value={form.names}
              onChange={(e) => handleChange('names', e.target.value)}
            />
          </Form.Item>
          <Form.Item label="邀请正文（用换行分段）">
            <Input.TextArea
              placeholder="谨定于2026年10月1日..."
              rows={5}
              value={form.content}
              onChange={(e) => handleChange('content', e.target.value)}
            />
          </Form.Item>
        </Form>
      </Card>

      <Card title="附加信息" style={{ marginBottom: 16 }}>
        {form.details.map((detail, i) => (
          <Space.Compact key={i} style={{ width: '100%', marginBottom: 8 }}>
            <Input
              style={{ width: 'calc(100% - 40px)' }}
              placeholder="如：🕐 17:00 迎宾"
              value={detail}
              onChange={(e) => updateDetail(i, e.target.value)}
            />
            <Button danger icon={<MinusCircleOutlined />} onClick={() => removeDetail(i)} />
          </Space.Compact>
        ))}
        <Button type="dashed" size="small" icon={<PlusOutlined />} onClick={addDetail}>添加信息</Button>
      </Card>

      <Button type="primary" size="large" onClick={handleSubmit} loading={saving}>
        保存邀请函配置
      </Button>
    </div>
  );
}
