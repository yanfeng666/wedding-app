import { useRef, useEffect, useState } from 'react';
import './WeddingInfo.css';

const cards = [
  { icon: '📅', title: '婚礼日期', lines: ['2026年10月1日', '农历八月廿一', '星期四'] },
  { icon: '📍', title: '婚礼地点', lines: ['XX大酒店 · 宴会厅', 'XX市XX区XX路88号', '3楼百合厅'] },
  { icon: '⏰', title: '时间安排', lines: ['17:00 宾客签到', '18:08 婚礼仪式', '19:00 婚宴开始'] },
];

export default function WeddingInfo() {
  const [visibleItems, setVisibleItems] = useState(new Set());
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const idx = Number(entry.target.dataset.index);
            setVisibleItems((prev) => new Set(prev).add(idx));
          }
        });
      },
      { threshold: 0.2 }
    );

    el.querySelectorAll('.info-card').forEach((item) => observer.observe(item));
    return () => observer.disconnect();
  }, []);

  return (
    <section className="info section-padding" id="info">
      <div className="container">
        <div className="section-header fade-in-scroll">
          <span className="label">Wedding</span>
          <h2>婚礼信息</h2>
          <div className="divider"><span>♥</span></div>
        </div>
        <div className="info-cards" ref={ref}>
          {cards.map((card, i) => (
            <div
              key={i}
              className={`info-card${visibleItems.has(i) ? ' visible' : ''}`}
              data-index={i}
              style={{ transitionDelay: `${i * 0.15}s` }}
            >
              <div className="icon">{card.icon}</div>
              <h3>{card.title}</h3>
              {card.lines.map((line, j) => (
                <p key={j}>{line}</p>
              ))}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}