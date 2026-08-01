import { Upload, Button, Input, Space } from 'antd';
import { UploadOutlined, LinkOutlined } from '@ant-design/icons';
import { useState } from 'react';

export default function ImageUpload({ value = '', onChange }) {
  const [mode, setMode] = useState(value && value.startsWith('data:') ? 'upload' : 'url');

  const handleUpload = (file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      onChange?.(e.target.result);
    };
    reader.readAsDataURL(file);
    return false; // 阻止自动上传
  };

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
          maxFileSize={2}
        >
          <Button icon={<UploadOutlined />}>选择图片</Button>
        </Upload>
      ) : (
        <Input
          placeholder="https://example.com/image.jpg"
          value={value && !value.startsWith('data:') ? value : ''}
          onChange={(e) => onChange?.(e.target.value)}
        />
      )}
      {value && (
        <div style={{ marginTop: 8 }}>
          <img
            src={value}
            alt="预览"
            style={{ maxWidth: '100%', maxHeight: 200, borderRadius: 8 }}
          />
        </div>
      )}
    </div>
  );
}
