import { Upload, Button, Input, Space, Image, Segmented, Typography } from 'antd';
import { UploadOutlined, LinkOutlined, DeleteOutlined, SwapOutlined } from '@ant-design/icons';
import { useState } from 'react';

const { Text } = Typography;

// 压缩质量预设
const QUALITY_PRESETS = {
  hd: { label: '高清', maxWidth: 2560, quality: 0.92 },
  standard: { label: '标准', maxWidth: 1920, quality: 0.82 },
  compressed: { label: '压缩', maxWidth: 1280, quality: 0.68 },
};

const MAX_FILE_SIZE = 30 * 1024 * 1024; // 30MB 限制

// 格式化文件大小
function formatSize(bytes) {
  if (bytes < 1024) return `${bytes}B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)}KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
}

// 压缩图片：限制最大宽度，转换为 JPEG 以减小体积
// 带超时保护，防止大图片导致无限等待
function compressImage(file, preset = 'standard') {
  const { maxWidth, quality } = QUALITY_PRESETS[preset] || QUALITY_PRESETS.standard;
  return new Promise((resolve, reject) => {
    let settled = false;
    const timer = setTimeout(() => {
      if (!settled) {
        settled = true;
        reject(new Error('图片处理超时，请尝试使用压缩模式或更换较小图片'));
      }
    }, 20000); // 20 秒超时

    const reader = new FileReader();
    reader.onerror = () => {
      if (!settled) { settled = true; clearTimeout(timer); reject(new Error('读取文件失败')); }
    };
    reader.onload = (e) => {
      const img = new Image();
      img.onerror = () => {
        if (!settled) { settled = true; clearTimeout(timer); reject(new Error('图片加载失败')); }
      };
      img.onload = () => {
        if (settled) return;
        try {
          let { width, height } = img;
          // 限制最大尺寸，防止 canvas 超出浏览器限制
          const MAX_CANVAS = 4096;
          if (width > maxWidth || height > MAX_CANVAS) {
            const ratio = Math.min(maxWidth / width, MAX_CANVAS / height);
            width = Math.round(width * ratio);
            height = Math.round(height * ratio);
          }
          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          // 白底，防止 PNG 透明通道在 JPEG 下变黑
          if (file.type !== 'image/png') {
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(0, 0, width, height);
          }
          ctx.drawImage(img, 0, 0, width, height);
          const isPng = file.type === 'image/png';
          const mime = isPng ? 'image/png' : 'image/jpeg';
          const result = canvas.toDataURL(mime, quality);
          if (!result || result === 'data:,') {
            throw new Error('图片压缩失败');
          }
          settled = true;
          clearTimeout(timer);
          resolve(result);
        } catch (err) {
          if (!settled) { settled = true; clearTimeout(timer); reject(err); }
        }
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  });
}

export default function ImageUpload({ value = '', onChange }) {
  const [mode, setMode] = useState(value && value.startsWith('data:') ? 'upload' : 'url');
  const [uploading, setUploading] = useState(false);
  const [quality, setQuality] = useState('standard');
  const [info, setInfo] = useState(null); // { originalSize, compressedSize }

  const handleUpload = (file) => {
    // 文件大小校验
    if (file.size > MAX_FILE_SIZE) {
      setInfo({ error: `文件过大（${formatSize(file.size)}），最大支持 ${formatSize(MAX_FILE_SIZE)}` });
      return false;
    }
    setInfo(null);
    setUploading(true);

    const originalSize = file.size;
    compressImage(file, quality)
      .then((compressed) => {
        onChange?.(compressed);
        // 估算压缩后大小（base64 去掉前缀后解码）
        const base64Len = compressed.split(',')[1]?.length || 0;
        const compressedSize = Math.round(base64Len * 0.75);
        setInfo({ originalSize, compressedSize });
      })
      .catch((err) => {
        // 压缩失败时回退到原始 base64
        const reader = new FileReader();
        reader.onload = (e) => {
          onChange?.(e.target.result);
          setInfo({ originalSize, compressedSize: originalSize, fallback: true });
        };
        reader.onerror = () => {
          setInfo({ error: err.message || '上传失败，请重试' });
        };
        reader.readAsDataURL(file);
      })
      .finally(() => setUploading(false));

    return false; // 同步返回 false，阻止 Ant Design 自动上传
  };

  const handleRemove = () => {
    onChange?.('');
    setInfo(null);
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
        <div>
          <Space style={{ marginBottom: 8 }} wrap>
            <Upload
              accept="image/*"
              showUploadList={false}
              beforeUpload={handleUpload}
            >
              <Button
                icon={hasImage ? <SwapOutlined /> : <UploadOutlined />}
                loading={uploading}
              >
                {uploading ? '处理中...' : hasImage ? '重新上传' : '选择图片'}
              </Button>
            </Upload>
            <Segmented
              size="small"
              value={quality}
              onChange={setQuality}
              options={[
                { label: '高清', value: 'hd' },
                { label: '标准', value: 'standard' },
                { label: '压缩', value: 'compressed' },
              ]}
            />
          </Space>
          {info && !info.error && (
            <div style={{ marginBottom: 8 }}>
              <Text type="secondary" style={{ fontSize: 12 }}>
                {info.fallback ? '⚠️ 压缩失败，已使用原图' : '✅ 压缩完成'}
                {` · 原始 ${formatSize(info.originalSize)}`}
                {info.compressedSize !== info.originalSize && ` → 压缩后 ${formatSize(info.compressedSize)}`}
              </Text>
            </div>
          )}
          {info?.error && (
            <div style={{ marginBottom: 8 }}>
              <Text type="danger" style={{ fontSize: 12 }}>{info.error}</Text>
            </div>
          )}
        </div>
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
