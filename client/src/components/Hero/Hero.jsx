import { useState, useEffect } from 'react';
import './Hero.css';

const WEDDING_DATE = new Date('2026-10-01T18:08:00').getTime();

function calcCountdown() {
  const now = Date.now();
  const dist = WEDDING_DATE - now;
  if (dist <= 0) return { days: '00', hours: '00', minutes: '00', seconds: '00' };
  return {
    days: String(Math.floor(dist / 86400000)).padStart(2, '0'),
    hours: String(Math.floor((dist % 86400000) / 3600000)).padStart(2, '0'),
    minutes: String(Math.floor((dist % 3600000) / 60000)).padStart(2, '0'),
    seconds: String(Math.floor((dist % 60000) / 1000)).padStart(2, '0'),
  };
}

export default function Hero() {
  const [countdown, setCountdown] = useState(calcCountdown);

  useEffect(() => {
    const id = setInterval(() => setCountdown(calcCountdown()), 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <section className="hero" id="home">
      <div className="hero-bg-decor circle-1" />
      <div className="hero-bg-decor circle-2" />
      <div className="hero-content">
        <span className="hero-top-text">Save the Date</span>
        <h1 className="hero-names">
          张三<span className="ampersand">&amp;</span>李四
        </h1>
        <p className="hero-date">2026年10月1日 · 星期四</p>
        <div className="hero-divider" />
        <div className="countdown">
          {Object.entries(countdown).map(([key, val]) => (
            <div className="countdown-item" key={key}>
              <span className="number">{val}</span>
              <span className="label">
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