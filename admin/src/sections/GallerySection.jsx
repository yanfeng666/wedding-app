import { useState } from 'react';
import { Card, Button, Input, Space, Empty } from 'antd';
import { PlusOutlined, DeleteOutlined, ArrowUpOutlined, ArrowDownOutlined } from '@ant-design/icons';
import ImageUpload from '../components/ImageUpload';

export default function GallerySection({ config, onSave }) {
  const [images, setImages] = useState(
    config.gallery_images ? [...config.gallery_images] : []
  );
  const [saving, setSaving] = useState(false);

  const updateImage = (index, field, value) => {
    setImages(prev => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
  };

  const addImage = () => {
    setImages(prev => [...prev, { src: '', label: '' }]);
  };

  const removeImage = (index) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const moveImage = (index, dir) => {
    setImages(prev => {
      const next = [...prev];
      const target = index + dir;
      if (target < 0 || target >= next.length) return prev;
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  };

  const handleSubmit = () => {
    setSaving(true);
    onSave({ gallery_images: images });
    setSaving(false);
  };

  return (
    <div>
      {images.length === 0 && (
        <Empty description="暂无相册图片" style={{ marginBottom: 16 }}>
          <Button type="primary" icon={<PlusOutlined />} onClick={addImage}>添加图片</Button>
        </Empty>
      )}
      {images.map((img, i) => (
        <Card
          key={i}
          style={{ marginBottom: 16 }}
          title={`图片 ${i + 1}`}
          extra={
            <Space>
              <Button size="small" icon={<ArrowUpOutlined />} disabled={i === 0} onClick={() => moveImage(i, -1)} />
              <Button size="small" icon={<ArrowDownOutlined />} disabled={i === images.length - 1} onClick={() => moveImage(i, 1)} />
              <Button size="small" danger icon={<DeleteOutlined />} onClick={() => removeImage(i)} />
            </Space>
          }
        >
          <Input
            style={{ marginBottom: 12 }}
            placeholder="图片标签，如：幸福时刻"
            value={img.label || ''}
            onChange={(e) => updateImage(i, 'label', e.target.value)}
          />
          <label style={{ fontSize: 14, color: '#666', display: 'block', marginBottom: 6 }}>相册图片</label>
          <ImageUpload
            value={img.src || ''}
            onChange={(val) => updateImage(i, 'src', val)}
          />
        </Card>
      ))}
      {images.length > 0 && (
        <>
          <Button type="dashed" icon={<PlusOutlined />} onClick={addImage} block style={{ marginBottom: 16 }}>
            添加图片
          </Button>
          <Button type="primary" size="large" onClick={handleSubmit} loading={saving}>
            保存相册配置
          </Button>
        </>
      )}
    </div>
  );
}
