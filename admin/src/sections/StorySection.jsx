import { useState } from 'react';

export default function StorySection({ config, onSave }) {
  const [items, setItems] = useState(
    config.story_items ? [...config.story_items] : []
  );

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

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({ story_items: items });
  };

  return (
    <div>
      <div className="page-header">
        <h2>我们的故事</h2>
        <p>管理恋爱时间线上的各个故事节点</p>
      </div>
      <form onSubmit={handleSubmit}>
        {items.map((item, i) => (
          <div className="list-item" key={i}>
            <div className="list-item-fields">
              <div className="form-row">
                <div className="form-group">
                  <label>日期</label>
                  <input
                    type="text"
                    value={item.date || ''}
                    onChange={(e) => updateItem(i, 'date', e.target.value)}
                    placeholder="如：2021年3月"
                  />
                </div>
                <div className="form-group">
                  <label>标题</label>
                  <input
                    type="text"
                    value={item.title || ''}
                    onChange={(e) => updateItem(i, 'title', e.target.value)}
                    placeholder="如：初次相遇"
                  />
                </div>
              </div>
              <div className="form-group">
                <label>描述</label>
                <textarea
                  value={item.desc || ''}
                  onChange={(e) => updateItem(i, 'desc', e.target.value)}
                  placeholder="故事描述..."
                />
              </div>
              <div className="form-group">
                <label>图片 URL</label>
                <input
                  type="url"
                  value={item.img || ''}
                  onChange={(e) => updateItem(i, 'img', e.target.value)}
                  placeholder="https://..."
                />
                {item.img && <img src={item.img} alt="" className="image-preview" />}
              </div>
            </div>
            <div className="list-item-actions">
              <button type="button" className="btn btn-sm btn-primary" onClick={() => moveItem(i, -1)} disabled={i === 0}>↑</button>
              <button type="button" className="btn btn-sm btn-primary" onClick={() => moveItem(i, 1)} disabled={i === items.length - 1}>↓</button>
              <button type="button" className="btn btn-sm btn-danger" onClick={() => removeItem(i)}>删除</button>
            </div>
          </div>
        ))}
        <button type="button" className="add-btn" onClick={addItem}>+ 添加故事</button>
        <div style={{ marginTop: 16 }}>
          <button type="submit" className="btn btn-primary btn-save">保存故事配置</button>
        </div>
      </form>
    </div>
  );
}
