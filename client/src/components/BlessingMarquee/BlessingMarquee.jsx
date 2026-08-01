import { useEffect, useState, useRef } from 'react';
import './BlessingMarquee.css';

function getRandomTop() {
  // 随机分布在 10% ~ 85% 之间，避免重叠边缘
  return Math.random() * 75 + 10;
}

export default function BlessingMarquee({ blessings = [] }) {
  const [visible, setVisible] = useState(true);
  const lanesRef = useRef([]);

  useEffect(() => {
    if (blessings.length === 0) {
      setVisible(false);
      return;
    }
    setVisible(true);

    // 预分配随机轨道位置和飞行速度
    lanesRef.current = blessings.map(() => ({
      top: getRandomTop(),
      duration: 4 + Math.random() * 2, // 4~6s
    }));

    // 所有消息在 1s 内发出，飞行最长 6s，7s 后隐藏
    const hideAfter = blessings.length * 500 + 6000;
    const timer = setTimeout(() => {
      setVisible(false);
    }, hideAfter + 2000);

    return () => clearTimeout(timer);
  }, [blessings]);

  if (!visible || blessings.length === 0) return null;

  const totalMs = 10000;
  // 每条消息间隔 500ms 以内，确保多条弹幕几乎同时出现
  const stagger = blessings.length > 1 ? Math.min(500, totalMs / blessings.length) : 0;

  return (
    <div className="marquee-container">
      {blessings.map((b, i) => (
        <div
          key={b.id || i}
          className="marquee-item"
          style={{
            top: `${lanesRef.current[i]?.top || 50}%`,
            animationDelay: `${i * stagger}ms`,
            animationDuration: `${lanesRef.current[i]?.duration || 5}s`,
          }}
        >
          <span className="marquee-name">{b.name}</span>
          <span className="marquee-text">{b.message}</span>
        </div>
      ))}
    </div>
  );
}