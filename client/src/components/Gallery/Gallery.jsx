import { useState, useEffect, useRef, useCallback } from 'react';
import './Gallery.css';

export default function Gallery({ images = [], onImageClick }) {
  const [current, setCurrent] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [direction, setDirection] = useState(0); // 1=next, -1=prev
  const timerRef = useRef(null);
  const touchRef = useRef({ x: 0 });

  const total = images.length;

  const goTo = useCallback((index) => {
    setDirection(index > current ? 1 : -1);
    setCurrent(((index % total) + total) % total);
  }, [current, total]);

  const next = useCallback(() => {
    setDirection(1);
    setCurrent((prev) => (prev + 1) % total);
  }, [total]);

  const prev = useCallback(() => {
    setDirection(-1);
    setCurrent((prev) => (prev - 1 + total) % total);
  }, [total]);

  // 自动播放
  useEffect(() => {
    if (!isAutoPlaying || total <= 1) return;
    timerRef.current = setInterval(next, 4000);
    return () => clearInterval(timerRef.current);
  }, [isAutoPlaying, next, total]);

  const handleTouchStart = (e) => {
    touchRef.current.x = e.touches[0].clientX;
  };
  const handleTouchEnd = (e) => {
    const diff = touchRef.current.x - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 60) {
      diff > 0 ? next() : prev();
    }
  };

  if (total === 0) {
    return (
      <section className="gallery section-padding" id="gallery">
        <div className="container">
          <div className="section-header">
            <span className="label">Gallery</span>
            <h2>婚纱相册</h2>
            <div className="divider"><span>♥</span></div>
          </div>
          <div className="gallery-empty">
            <p>即将呈现我们的美好瞬间...</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="gallery section-padding" id="gallery">
      <div className="container">
        <div className="section-header">
          <span className="label">Gallery</span>
          <h2>婚纱相册</h2>
          <div className="divider"><span>♥</span></div>
        </div>

        <div
          className="carousel"
          onMouseEnter={() => setIsAutoPlaying(false)}
          onMouseLeave={() => setIsAutoPlaying(true)}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          {/* 主图区域 */}
          <div className="carousel-stage">
            <div className="carousel-viewport">
              {images.map((img, i) => {
                let className = 'carousel-slide';
                if (i === current) className += ' active';
                else if (i === ((current - 1 + total) % total)) className += ' prev';
                else if (i === ((current + 1) % total)) className += ' next';
                return (
                  <div
                    key={i}
                    className={className}
                    onClick={() => i === current && onImageClick && onImageClick(i)}
                  >
                    <img src={img.src} alt={img.label} />
                    <div className="slide-label">{img.label}</div>
                  </div>
                );
              })}
            </div>

            {/* 左右箭头 */}
            <button className="carousel-arrow carousel-arrow-left" onClick={prev} aria-label="上一张">
              <svg viewBox="0 0 24 24" width="28" height="28"><path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z" fill="currentColor"/></svg>
            </button>
            <button className="carousel-arrow carousel-arrow-right" onClick={next} aria-label="下一张">
              <svg viewBox="0 0 24 24" width="28" height="28"><path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z" fill="currentColor"/></svg>
            </button>

            {/* 页数指示 */}
            <div className="carousel-counter">
              <span className="counter-current">{String(current + 1).padStart(2, '0')}</span>
              <span className="counter-sep">/</span>
              <span className="counter-total">{String(total).padStart(2, '0')}</span>
            </div>
          </div>

          {/* 底部缩略图 */}
          <div className="carousel-thumbs">
            {images.map((img, i) => (
              <div
                key={i}
                className={`carousel-thumb${i === current ? ' active' : ''}`}
                onClick={() => goTo(i)}
              >
                <img src={img.src} alt={img.label} />
                <div className="thumb-ring" />
              </div>
            ))}
          </div>

          {/* 圆点指示器 */}
          <div className="carousel-dots">
            {images.map((_, i) => (
              <button
                key={i}
                className={`carousel-dot${i === current ? ' active' : ''}`}
                onClick={() => goTo(i)}
                aria-label={`第 ${i + 1} 张`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}