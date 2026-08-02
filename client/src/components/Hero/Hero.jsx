import { useState, useEffect } from 'react';
import './Hero.css';

function calcCountdown(weddingDateStr) {
  const weddingDate = new Date(weddingDateStr || '2026-10-01T18:08:00').getTime();
  const now = Date.now();
  const dist = weddingDate - now;
  if (dist <= 0) return { days: '00', hours: '00', minutes: '00', seconds: '00' };
  return {
    days: String(Math.floor(dist / 86400000)).padStart(2, '0'),
    hours: String(Math.floor((dist % 86400000) / 3600000)).padStart(2, '0'),
    minutes: String(Math.floor((dist % 3600000) / 60000)).padStart(2, '0'),
    seconds: String(Math.floor((dist % 60000) / 1000)).padStart(2, '0'),
  };
}

export default function Hero({ config, bgImage }) {
  const [countdown, setCountdown] = useState(() => calcCountdown(config?.wedding_date));

  useEffect(() => {
    setCountdown(calcCountdown(config?.wedding_date));
    const id = setInterval(() => setCountdown(calcCountdown(config?.wedding_date)), 1000);
    return () => clearInterval(id);
  }, [config?.wedding_date]);

  const heroStyle = bgImage
    ? { backgroundImage: `url(${bgImage})`, backgroundSize: 'cover', backgroundPosition: 'center' }
    : config?.hero_bg_color
      ? { background: config.hero_bg_color }
      : {};

  const heroTextColor = config?.hero_text_color;
  const heroVars = heroTextColor ? { '--text': heroTextColor, '--text-light': heroTextColor, '--heading-color': heroTextColor } : {};
  const colors = config?.section_colors || {};

  return (
    <section className="hero" id="home" style={{ ...heroStyle, ...heroVars }}>
      <div className="hero-bg-decor circle-1" />
      <div className="hero-bg-decor circle-2" />
      <div className="hero-content">
        <span className="hero-top-text">Save the Date</span>
        <h1 className="hero-names">
          <span style={{ color: colors.groom_name_color || undefined }}>{config?.groom_name || '张三'}</span>
          <span className="ampersand">&amp;</span>
          <span style={{ color: colors.bride_name_color || undefined }}>{config?.bride_name || '李四'}</span>
        </h1>
        <p className="hero-date" style={{ color: colors.date_display_color || undefined }}>{config?.wedding_date_display || '2026年10月1日 · 星期四'}</p>
        <div className="hero-divider" />
        <div className="countdown">
          {Object.entries(countdown).map(([key, val]) => (
            <div className="countdown-item" key={key}>
              <span className="number" style={{ color: colors.countdown_number_color || undefined }}>{val}</span>
              <span className="label" style={{ color: colors.countdown_label_color || undefined }}>
                {{ days: '天', hours: '时', minutes: '分', seconds: '秒' }[key]}
              </span>
            </div>
          ))}
        </div>
      </div>
      <div className="scroll-indicator">
        <div className="mouse" />
        <span>向下滑动</span>
      </div>
    </section>
  );
}
