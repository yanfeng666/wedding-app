import { useState } from 'react';
import { Form, Input, Button, Card, DatePicker, Space, Typography } from 'antd';
import dayjs from 'dayjs';

const { Text } = Typography;

export default function GeneralSection({ config, onSave }) {
  const [form] = Form.useForm();
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (values) => {
    setSaving(true);
    onSave({
      ...values,
      wedding_date: values.wedding_date ? values.wedding_date.format('YYYY-MM-DDTHH:mm:ss') : '',
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
      </Card>

      <Card title="界面文案" style={{ marginBottom: 16 }}>
        <Form.Item name="navbar_logo" label="导航栏标题">
          <Input placeholder="如：我们结婚啦" />
        </Form.Item>
        <Form.Item name="footer_quote" label="页脚寄语">
          <Input placeholder="如：执子之手，与子偕老" />
        </Form.Item>
      </Card>

      <Button type="primary" htmlType="submit" loading={saving} size="large">
        保存配置
      </Button>
    </Form>
  );
}
