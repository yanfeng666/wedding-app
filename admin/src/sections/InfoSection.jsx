import { useState } from 'react';
import { Card, Button, Input, Space, Empty } from 'antd';
import { PlusOutlined, DeleteOutlined, MinusCircleOutlined } from '@ant-design/icons';
import TextColorPicker from '../components/TextColorPicker';

export default function InfoSection({ config, onSave }) {
  const [cards, setCards] = useState(
    config.info_cards ? config.info_cards.map(c => ({ ...c, lines: [...(c.lines || [])] })) : []
  );
  const [saving, setSaving] = useState(false);
  const sc = config.section_colors || {};
  const [colors, setColors] = useState({
    info_title_color: sc.info_title_color || '',
    info_content_color: sc.info_content_color || '',
  });

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

  const handleSubmit = () => {
    setSaving(true);
    onSave({ info_cards: cards, section_colors: { ...sc, ...colors } });
    setSaving(false);
  };

  return (
    <div>
      <Card title="文字颜色" style={{ marginBottom: 16 }}>
        <Space direction="vertical" style={{ width: '100%' }} size="middle">
          <div>
            <span style={{ marginRight: 12 }}>卡片标题颜色</span>
            <TextColorPicker
              value={colors.info_title_color}
              onChange={(v) => setColors(prev => ({ ...prev, info_title_color: v }))}
            />
          </div>
          <div>
            <span style={{ marginRight: 12 }}>卡片内容颜色</span>
            <TextColorPicker
              value={colors.info_content_color}
              onChange={(v) => setColors(prev => ({ ...prev, info_content_color: v }))}
            />
          </div>
        </Space>
      </Card>

      {cards.length === 0 && (
        <Empty description="暂无信息卡片" style={{ marginBottom: 16 }}>
          <Button type="primary" icon={<PlusOutlined />} onClick={addCard}>添加信息卡片</Button>
        </Empty>
      )}
      {cards.map((card, i) => (
        <Card
          key={i}
          style={{ marginBottom: 16 }}
          title={`信息卡片 ${i + 1}`}
          extra={
            <Button size="small" danger icon={<DeleteOutlined />} onClick={() => removeCard(i)}>删除卡片</Button>
          }
        >
          <Space.Compact style={{ width: '100%', marginBottom: 12 }}>
            <Input
              style={{ width: 100, marginRight: 8 }}
              placeholder="图标"
              value={card.icon || ''}
              onChange={(e) => updateCard(i, 'icon', e.target.value)}
            />
            <Input
              style={{ width: 'calc(100% - 108px)' }}
              placeholder="标题，如：婚礼日期"
              value={card.title || ''}
              onChange={(e) => updateCard(i, 'title', e.target.value)}
            />
          </Space.Compact>
          <label style={{ fontSize: 14, color: '#666', display: 'block', marginBottom: 8 }}>内容行</label>
          {card.lines.map((line, j) => (
            <Space.Compact key={j} style={{ width: '100%', marginBottom: 8 }}>
              <Input
                style={{ width: 'calc(100% - 40px)' }}
                placeholder="如：2026年10月1日"
                value={line}
                onChange={(e) => updateLine(i, j, e.target.value)}
              />
              <Button danger icon={<MinusCircleOutlined />} onClick={() => removeLine(i, j)} />
            </Space.Compact>
          ))}
          <Button type="dashed" size="small" icon={<PlusOutlined />} onClick={() => addLine(i)}>添加行</Button>
        </Card>
      ))}
      {cards.length > 0 && (
        <>
          <Button type="dashed" icon={<PlusOutlined />} onClick={addCard} block style={{ marginBottom: 16 }}>
            添加信息卡片
          </Button>
          <Button type="primary" size="large" onClick={handleSubmit} loading={saving}>
            保存信息配置
          </Button>
        </>
      )}
    </div>
  );
}
