import { useState } from 'react';
import { Form, Input, Button, Card, DatePicker, Space, Select } from 'antd';
import dayjs from 'dayjs';
import TextColorPicker from '../components/TextColorPicker';

function ColorInput({ label, value, onChange }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
      <span style={{ color: '#666', fontSize: 14, minWidth: 80 }}>{label}</span>
      <TextColorPicker value={value} onChange={onChange} />
    </div>
  );
}

export default function GeneralSection({ config, onSave }) {
  const [form] = Form.useForm();
  const [saving, setSaving] = useState(false);
  const sc = config.section_colors || {};
  const [colors, setColors] = useState({
    groom_name_color: sc.groom_name_color || '',
    bride_name_color: sc.bride_name_color || '',
    date_display_color: sc.date_display_color || '',
    countdown_number_color: sc.countdown_number_color || '',
    countdown_label_color: sc.countdown_label_color || '',
    navbar_logo_color: sc.navbar_logo_color || '',
    footer_quote_color: sc.footer_quote_color || '',
  });

  const handleSubmit = async (values) => {
    setSaving(true);
    onSave({
      ...values,
      wedding_date: values.wedding_date ? values.wedding_date.format('YYYY-MM-DDTHH:mm:ss') : '',
      section_colors: { ...sc, ...colors },
    });
    setSaving(false);
  };

  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={handleSubmit}
      initialValues={{
        groom_name: config.groom_name || '',
        bride_name: config.bride_name || '',
        wedding_date: config.wedding_date ? dayjs(config.wedding_date) : null,
        wedding_date_display: config.wedding_date_display || '',
        navbar_logo: config.navbar_logo || '',
        footer_quote: config.footer_quote || '',
        story_img_fit: config.story_img_fit || 'cover',
        gallery_img_fit: config.gallery_img_fit || 'cover',
      }}
    >
      <Card title="新人姓名" style={{ marginBottom: 16 }}>
        <Space.Compact style={{ width: '100%' }}>
          <Form.Item name="groom_name" label="新郎姓名" style={{ width: '50%', paddingRight: 8 }}>
            <Input placeholder="如：张三" />
          </Form.Item>
          <Form.Item name="bride_name" label="新娘姓名" style={{ width: '50%' }}>
            <Input placeholder="如：李四" />
          </Form.Item>
        </Space.Compact>
        <ColorInput
          label="新郎姓名颜色"
          value={colors.groom_name_color}
          onChange={(v) => setColors(prev => ({ ...prev, groom_name_color: v }))}
        />
        <ColorInput
          label="新娘姓名颜色"
          value={colors.bride_name_color}
          onChange={(v) => setColors(prev => ({ ...prev, bride_name_color: v }))}
        />
      </Card>

      <Card title="婚礼日期" style={{ marginBottom: 16 }}>
        <Form.Item name="wedding_date" label="婚礼日期时间（用于倒计时）">
          <DatePicker
            showTime
            format="YYYY-MM-DD HH:mm:ss"
            style={{ width: '100%' }}
            placeholder="选择婚礼日期和时间"
          />
        </Form.Item>
        <Form.Item name="wedding_date_display" label="日期显示文案">
          <Input placeholder="如：2026年10月1日 · 星期四" />
        </Form.Item>
        <ColorInput
          label="日期文案颜色"
          value={colors.date_display_color}
          onChange={(v) => setColors(prev => ({ ...prev, date_display_color: v }))}
        />
        <ColorInput
          label="倒计时数字颜色"
          value={colors.countdown_number_color}
          onChange={(v) => setColors(prev => ({ ...prev, countdown_number_color: v }))}
        />
        <ColorInput
          label="倒计时标签颜色"
          value={colors.countdown_label_color}
          onChange={(v) => setColors(prev => ({ ...prev, countdown_label_color: v }))}
        />
      </Card>

      <Card title="界面文案" style={{ marginBottom: 16 }}>
        <Form.Item name="navbar_logo" label="导航栏标题">
          <Input placeholder="如：我们结婚啦" />
        </Form.Item>
        <ColorInput
          label="导航栏标题颜色"
          value={colors.navbar_logo_color}
          onChange={(v) => setColors(prev => ({ ...prev, navbar_logo_color: v }))}
        />
        <Form.Item name="footer_quote" label="页脚寄语" style={{ marginTop: 12 }}>
          <Input placeholder="如：执子之手，与子偕老" />
        </Form.Item>
        <ColorInput
          label="页脚寄语颜色"
          value={colors.footer_quote_color}
          onChange={(v) => setColors(prev => ({ ...prev, footer_quote_color: v }))}
        />
      </Card>

      <Card title="图片显示模式" style={{ marginBottom: 16 }}>
        <Space direction="vertical" style={{ width: '100%' }}>
          <Form.Item name="story_img_fit" label="故事图片显示方式">
            <Select
              options={[
                { label: '裁剪填充（cover）- 图片填满区域，可能裁剪', value: 'cover' },
                { label: '完整显示（contain）- 不裁剪，完整展示图片', value: 'contain' },
              ]}
            />
          </Form.Item>
          <Form.Item name="gallery_img_fit" label="相册图片显示方式">
            <Select
              options={[
                { label: '裁剪填充（cover）- 图片填满区域，可能裁剪', value: 'cover' },
                { label: '完整显示（contain）- 不裁剪，完整展示图片', value: 'contain' },
              ]}
            />
          </Form.Item>
        </Space>
      </Card>

      <Button type="primary" htmlType="submit" loading={saving} size="large">
        保存配置
      </Button>
    </Form>
  );
}
