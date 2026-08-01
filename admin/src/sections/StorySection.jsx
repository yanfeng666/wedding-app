import { useState } from 'react';
import { Card, Button, Input, Space, Empty } from 'antd';
import { PlusOutlined, DeleteOutlined, ArrowUpOutlined, ArrowDownOutlined } from '@ant-design/icons';
import ImageUpload from '../components/ImageUpload';

export default function StorySection({ config, onSave }) {
  const [items, setItems] = useState(
    config.story_items ? [...config.story_items] : []
  );
  const [saving, setSaving] = useState(false);

  const updateItem = (index, field, value) => {
    setItems(prev => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
  };

  const addItem = () => {
    setItems(prev => [...prev, { date: '', title: '', desc: '', img: '' }]);
  };

  const removeItem = (index) => {
    setItems(prev => prev.filter((_, i) => i !== index));
  };

  const moveItem = (index, dir) => {
    setItems(prev => {
      const next = [...prev];
      const target = index + dir;
      if (target < 0 || target >= next.length) return prev;
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  };

  const handleSubmit = () => {
    setSaving(true);
    onSave({ story_items: items });
    setSaving(false);
  };

  return (
    <div>
      {items.length === 0 && (
        <Empty description="暂无故事" style={{ marginBottom: 16 }}>
          <Button type="primary" icon={<PlusOutlined />} onClick={addItem}>添加故事</Button>
        </Empty>
      )}
      {items.map((item, i) => (
        <Card
          key={i}
          style={{ marginBottom: 16 }}
          title={`故事 ${i + 1}`}
          extra={
            <Space>
              <Button size="small" icon={<ArrowUpOutlined />} disabled={i === 0} onClick={() => moveItem(i, -1)} />
              <Button size="small" icon={<ArrowDownOutlined />} disabled={i === items.length - 1} onClick={() => moveItem(i, 1)} />
              <Button size="small" danger icon={<DeleteOutlined />} onClick={() => removeItem(i)} />
            </Space>
          }
        >
          <Space.Compact style={{ width: '100%', marginBottom: 12 }}>
            <Input
              style={{ width: '40%', marginRight: 8 }}
              placeholder="日期，如：2021年3月"
              value={item.date || ''}
              onChange={(e) => updateItem(i, 'date', e.target.value)}
            />
            <Input
              style={{ width: '60%' }}
              placeholder="标题，如：初次相遇"
              value={item.title || ''}
              onChange={(e) => updateItem(i, 'title', e.target.value)}
            />
          </Space.Compact>
          <Input.TextArea
            style={{ marginBottom: 12 }}
            placeholder="故事描述..."
            rows={3}
            value={item.desc || ''}
            onChange={(e) => updateItem(i, 'desc', e.target.value)}
          />
          <label style={{ fontSize: 14, color: '#666', display: 'block', marginBottom: 6 }}>故事图片</label>
          <ImageUpload
            value={item.img || ''}
            onChange={(val) => updateItem(i, 'img', val)}
          />
        </Card>
      ))}
      {items.length > 0 && (
        <>
          <Button type="dashed" icon={<PlusOutlined />} onClick={addItem} block style={{ marginBottom: 16 }}>
            添加故事
          </Button>
          <Button type="primary" size="large" onClick={handleSubmit} loading={saving}>
            保存故事配置
          </Button>
        </>
      )}
    </div>
  );
}
