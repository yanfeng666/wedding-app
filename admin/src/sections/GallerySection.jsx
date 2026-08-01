import { useState } from 'react';

export default function GallerySection({ config, onSave }) {
  const [images, setImages] = useState(
    config.gallery_images ? [...config.gallery_images] : []
  );

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

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({ gallery_images: images });
  };

  return (
    <div>
      <div className="page-header">
        <h2>婚礼相册</h2>
        <p>管理相册轮播中的图片</p>
      </div>
      <form onSubmit={handleSubmit}>
        {images.map((img, i) => (
          <div className="list-item" key={i}>
            <div className="list-item-fields">
              <div className="form-group">
                <label>图片标签</label>
                <input
                  type="text"
                  value={img.label || ''}
                  onChange={(e) => updateImage(i, 'label', e.target.value)}
                  placeholder="如：幸福时刻"
                />
              </div>
              <div className="form-group">
                <label>图片 URL</label>
                <input
                  type="url"
                  value={img.src || ''}
                  onChange={(e) => updateImage(i, 'src', e.target.value)}
                  placeholder="https://..."
                />
                {img.src && <img src={img.src} alt="" className="image-preview" />}
              </div>
            </div>
            <div className="list-item-actions">
              <button type="button" className="btn btn-sm btn-primary" onClick={() => moveImage(i, -1)} disabled={i === 0}>↑</button>
              <button type="button" className="btn btn-sm btn-primary" onClick={() => moveImage(i, 1)} disabled={i === images.length - 1}>↓</button>
              <button type="button" className="btn btn-sm btn-danger" onClick={() => removeImage(i)}>删除</button>
            </div>
          </div>
        ))}
        <button type="button" className="add-btn" onClick={addImage}>+ 添加图片</button>
        <div style={{ marginTop: 16 }}>
          <button type="submit" className="btn btn-primary btn-save">保存相册配置</button>
        </div>
      </form>
    </div>
  );
}
