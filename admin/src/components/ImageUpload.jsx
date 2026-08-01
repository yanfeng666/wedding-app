import { Upload, Button, Input, Space, Image, Segmented, Typography } from 'antd';
import { UploadOutlined, LinkOutlined, DeleteOutlined, SwapOutlined } from '@ant-design/icons';
import { useState } from 'react';

const { Text } = Typography;

// 压缩质量预设
const QUALITY_PRESETS = {
  none: { label: '不压缩', maxWidth: 0, quality: 1 },
  hd: { label: '高清', maxWidth: 2560, quality: 0.92 },
  standard: { label: '标准', maxWidth: 1920, quality: 0.82 },
  compressed: { label: '压缩', maxWidth: 1280, quality: 0.68 },
};

const MAX_FILE_SIZE = 30 * 1024 * 1024; // 30MB

function formatSize(bytes) {
  if (bytes < 1024) return `${bytes}B`;
  if (bytes < 1048576) return `${(bytes / 1024).toFixed(0)}KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
}

// 优先使用 createImageBitmap（比 Image 快很多），降级到 Image
async function loadImage(file) {
  if (typeof createImageBitmap === 'function') {
    try {
      const bitmap = await createImageBitmap(file);
      return { width: bitmap.width, height: bitmap.height, source: bitmap, isBitmap: true };
    } catch {
      // 降级到 Image
    }
  }
  // 降级方案：FileReader + Image
  const dataUrl = await new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target.result);
    reader.onerror = () => reject(new Error('读取文件失败'));
    reader.readAsDataURL(file);
  });
  const img = await new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error('图片加载失败'));
    image.src = dataUrl;
  });
  return { width: img.width, height: img.height, source: img, isBitmap: false };
}

// 压缩图片
async function compressImage(file, preset = 'standard') {
  const config = QUALITY_PRESETS[preset] || QUALITY_PRESETS.standard;

  // 不压缩：直接读取为 base64
  if (config.maxWidth === 0) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target.result);
      reader.onerror = () => reject(new Error('读取文件失败'));
      reader.readAsDataURL(file);
    });
  }

  const { maxWidth, quality } = config;
  const { width: imgW, height: imgH, source, isBitmap } = await loadImage(file);

  let width = imgW;
  let height = imgH;
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
  ctx.drawImage(source, 0, 0, width, height);

  // 释放 bitmap 资源
  if (isBitmap && source.close) source.close();

  const isPng = file.type === 'image/png';
  const mime = isPng ? 'image/png' : 'image/jpeg';
  const result = canvas.toDataURL(mime, quality);
  if (!result || result === 'data:,') throw new Error('图片压缩失败');
  return result;
}

export default function ImageUpload({ value = '', onChange }) {
  const [mode, setMode] = useState(value && value.startsWith('data:') ? 'upload' : 'url');
  const [uploading, setUploading] = useState(false);
  const [quality, setQuality] = useState('standard');
  const [info, setInfo] = useState(null);

  const handleUpload = (file) => {
    if (file.size > MAX_FILE_SIZE) {
      setInfo({ error: `文件过大（${formatSize(file.size)}），最大支持 ${formatSize(MAX_FILE_SIZE)}` });
      return false;
    }
    setInfo(null);
    setUploading(true);

    const originalSize = file.size;
    let timer = setTimeout(() => {
      setUploading(false);
      setInfo({ error: '处理超时，请尝试"不压缩"模式或更换较小图片' });
    }, 15000);

    compressImage(file, quality)
      .then((compressed) => {
        clearTimeout(timer);
        onChange?.(compressed);
        const base64Len = compressed.split(',')[1]?.length || 0;
        const compressedSize = Math.round(base64Len * 0.75);
        setInfo({ originalSize, compressedSize });
      })
      .catch((err) => {
        clearTimeout(timer);
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

    return false;
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
                { label: '不压缩', value: 'none' },
                { label: '高清', value: 'hd' },
                { label: '标准', value: 'standard' },
                { label: '压缩', value: 'compressed' },
              ]}
            />
          </Space>
          {info && !info.error && (
            <div style={{ marginBottom: 8 }}>
              <Text type="secondary" style={{ fontSize: 12 }}>
                {info.fallback ? '⚠️ 压缩失败，已使用原图' : '✅ 完成'}
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
