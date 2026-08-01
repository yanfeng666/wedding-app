import { useRef, useEffect, useState } from 'react';
import './WeddingInfo.css';

export default function WeddingInfo({ config, bgImage }) {
  const [visibleItems, setVisibleItems] = useState(new Set());
  const ref = useRef(null);

  const cards = config?.info_cards || [];

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
  }, [cards]);

  const sectionStyle = bgImage
    ? { backgroundImage: `url(${bgImage})`, backgroundSize: 'cover', backgroundPosition: 'center', backgroundAttachment: 'fixed' }
    : {};

  return (
    <section className="info section-padding" id="info" style={sectionStyle}>
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
