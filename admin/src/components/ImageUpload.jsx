import { Upload, Button, Input, Space, Image } from 'antd';
import { UploadOutlined, LinkOutlined, DeleteOutlined, SwapOutlined } from '@ant-design/icons';
import { useState } from 'react';

// 压缩图片：限制最大宽度，转换为 JPEG 以减小体积
function compressImage(file, maxWidth = 1920, quality = 0.82) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('读取文件失败'));
    reader.onload = (e) => {
      const img = new Image();
      img.onerror = () => reject(new Error('加载图片失败'));
      img.onload = () => {
        let { width, height } = img;
        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        // PNG 带透明通道时保留 PNG，否则用 JPEG 压缩
        const isPng = file.type === 'image/png';
        const mime = isPng ? 'image/png' : 'image/jpeg';
        resolve(canvas.toDataURL(mime, quality));
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  });
}

export default function ImageUpload({ value = '', onChange }) {
  const [mode, setMode] = useState(value && value.startsWith('data:') ? 'upload' : 'url');
  const [uploading, setUploading] = useState(false);

  const handleUpload = async (file) => {
    setUploading(true);
    try {
      const compressed = await compressImage(file);
      onChange?.(compressed);
    } catch {
      // 压缩失败时回退到原始 base64
      const reader = new FileReader();
      reader.onload = (e) => onChange?.(e.target.result);
      reader.readAsDataURL(file);
    } finally {
      setUploading(false);
    }
    return false; // 阻止自动上传
  };

  const handleRemove = () => {
    onChange?.('');
  };

  const hasImage = !!value;

  return (
    <div>
      <Space.Compact style={{ width: '100%', marginBottom: 8 }}>
        <Button
          type={mode === 'upload' ? 'primary' : 'default'}
          icon={<UploadOutlined />}
          onClick={() => setMode('upload')}
          style={{ marginRight: 4 }}
        >
          本地上传
        </Button>
        <Button
          type={mode === 'url' ? 'primary' : 'default'}
          icon={<LinkOutlined />}
          onClick={() => setMode('url')}
        >
          URL链接
        </Button>
      </Space.Compact>

      {mode === 'upload' ? (
        <Upload
          accept="image/*"
          showUploadList={false}
          beforeUpload={handleUpload}
        >
          <Button
            icon={hasImage ? <SwapOutlined /> : <UploadOutlined />}
            loading={uploading}
          >
            {hasImage ? '重新上传' : '选择图片'}
          </Button>
        </Upload>
      ) : (
        <Input
          placeholder="https://example.com/image.jpg"
          value={value && !value.startsWith('data:') ? value : ''}
          onChange={(e) => onChange?.(e.target.value)}
          allowClear
        />
      )}

      {hasImage && (
        <div style={{ marginTop: 8, position: 'relative', display: 'inline-block' }}>
          <Image
            src={value}
            alt="预览"
            style={{ maxWidth: '100%', maxHeight: 200, borderRadius: 8, objectFit: 'cover' }}
          />
          <Button
            danger
            size="small"
            icon={<DeleteOutlined />}
            onClick={handleRemove}
            style={{ position: 'absolute', top: 8, right: 8 }}
          >
            移除
          </Button>
        </div>
      )}
    </div>
  );
}
