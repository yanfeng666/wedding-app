import { useState } from 'react';
import { Card, Button, Input, Space, Empty, Divider } from 'antd';
import { PlusOutlined, DeleteOutlined, ArrowUpOutlined, ArrowDownOutlined } from '@ant-design/icons';
import ImageUpload from '../components/ImageUpload';
import TextColorPicker from '../components/TextColorPicker';

export default function StorySection({ config, onSave }) {
  const [items, setItems] = useState(
    config.story_items ? [...config.story_items] : []
  );
  const [saving, setSaving] = useState(false);
  const sc = config.section_colors || {};
  const [colors, setColors] = useState({
    story_date_color: sc.story_date_color || '',
    story_title_color: sc.story_title_color || '',
    story_desc_color: sc.story_desc_color || '',
  });

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
    onSave({
      story_items: items,
      section_colors: { ...sc, ...colors },
    });
    setSaving(false);
  };

  return (
    <div>
      <Card title="文字颜色" style={{ marginBottom: 16 }}>
        <Space direction="vertical" style={{ width: '100%' }} size="middle">
          <div>
            <span style={{ marginRight: 12 }}>日期文字颜色</span>
            <TextColorPicker
              value={colors.story_date_color}
              onChange={(v) => setColors(prev => ({ ...prev, story_date_color: v }))}
            />
          </div>
          <div>
            <span style={{ marginRight: 12 }}>标题文字颜色</span>
            <TextColorPicker
              value={colors.story_title_color}
              onChange={(v) => setColors(prev => ({ ...prev, story_title_color: v }))}
            />
          </div>
          <div>
            <span style={{ marginRight: 12 }}>描述文字颜色</span>
            <TextColorPicker
              value={colors.story_desc_color}
              onChange={(v) => setColors(prev => ({ ...prev, story_desc_color: v }))}
            />
          </div>
        </Space>
      </Card>

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
