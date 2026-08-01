import { useState } from 'react';

export default function InfoSection({ config, onSave }) {
  const [cards, setCards] = useState(
    config.info_cards ? config.info_cards.map(c => ({ ...c, lines: [...(c.lines || [])] })) : []
  );

  const updateCard = (index, field, value) => {
    setCards(prev => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
  };

  const updateLine = (cardIndex, lineIndex, value) => {
    setCards(prev => {
      const next = [...prev];
      next[cardIndex] = { ...next[cardIndex] };
      next[cardIndex].lines = [...next[cardIndex].lines];
      next[cardIndex].lines[lineIndex] = value;
      return next;
    });
  };

  const addLine = (cardIndex) => {
    setCards(prev => {
      const next = [...prev];
      next[cardIndex] = { ...next[cardIndex], lines: [...next[cardIndex].lines, ''] };
      return next;
    });
  };

  const removeLine = (cardIndex, lineIndex) => {
    setCards(prev => {
      const next = [...prev];
      next[cardIndex] = { ...next[cardIndex], lines: next[cardIndex].lines.filter((_, i) => i !== lineIndex) };
      return next;
    });
  };

  const addCard = () => {
    setCards(prev => [...prev, { icon: '📋', title: '', lines: [] }]);
  };

  const removeCard = (index) => {
    setCards(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({ info_cards: cards });
  };

  return (
    <div>
      <div className="page-header">
        <h2>婚礼信息</h2>
        <p>管理婚礼日期、地点、时间安排等信息卡片</p>
      </div>
      <form onSubmit={handleSubmit}>
        {cards.map((card, i) => (
          <div className="list-item" key={i}>
            <div className="list-item-fields">
              <div className="form-row">
                <div className="form-group" style={{ maxWidth: 100 }}>
                  <label>图标</label>
                  <input
                    type="text"
                    value={card.icon || ''}
                    onChange={(e) => updateCard(i, 'icon', e.target.value)}
                    placeholder="📅"
                  />
                </div>
                <div className="form-group">
                  <label>标题</label>
                  <input
                    type="text"
                    value={card.title || ''}
                    onChange={(e) => updateCard(i, 'title', e.target.value)}
                    placeholder="如：婚礼日期"
                  />
                </div>
              </div>
              <label style={{ fontSize: 14, color: '#555', marginBottom: 6, display: 'block' }}>内容行</label>
              {card.lines.map((line, j) => (
                <div key={j} style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                  <input
                    type="text"
                    value={line}
                    onChange={(e) => updateLine(i, j, e.target.value)}
                    placeholder="如：2026年10月1日"
                    style={{ flex: 1, padding: '8px 12px', border: '2px solid #e8e8e8', borderRadius: 6, fontSize: 14 }}
                  />
                  <button type="button" className="btn btn-sm btn-danger" onClick={() => removeLine(i, j)}>✕</button>
                </div>
              ))}
              <button type="button" className="btn btn-sm btn-primary" onClick={() => addLine(i)}>+ 添加行</button>
            </div>
            <div className="list-item-actions">
              <button type="button" className="btn btn-sm btn-danger" onClick={() => removeCard(i)}>删除卡片</button>
            </div>
          </div>
        ))}
        <button type="button" className="add-btn" onClick={addCard}>+ 添加信息卡片</button>
        <div style={{ marginTop: 16 }}>
          <button type="submit" className="btn btn-primary btn-save">保存信息配置</button>
        </div>
      </form>
    </div>
  );
}
