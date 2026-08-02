import { useRef, useEffect, useState } from 'react';
import './Story.css';

function TimelineItem({ event, index, isVisible, imgFit, colors }) {
  const isEven = index % 2 === 1;
  return (
    <div
      className={`timeline-item${isVisible ? ' visible' : ''}`}
      data-index={index}
    >
      <div className="timeline-dot" />
      <div className={`timeline-date${isEven ? ' even' : ''}`} style={{ color: colors.story_date_color || undefined }}>{event.date}</div>
      <div className={`timeline-card${isEven ? ' even' : ''}`}>
        {event.img && (
          <div className="timeline-card-img">
            <img src={event.img} alt={event.title} loading="lazy" style={{ objectFit: imgFit }} />
          </div>
        )}
        <div className="timeline-card-body">
          <h4 style={{ color: colors.story_title_color || undefined }}>{event.title}</h4>
          <p style={{ color: colors.story_desc_color || undefined }}>{event.desc}</p>
        </div>
      </div>
    </div>
  );
}

export default function Story({ config, bgImage }) {
  const [visibleItems, setVisibleItems] = useState(new Set());
  const ref = useRef(null);

  const events = config?.story_items || [];

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const items = el.querySelectorAll('.timeline-item');

    const checkVisible = () => {
      items.forEach((item) => {
        const idx = Number(item.dataset.index);
        const rect = item.getBoundingClientRect();
        if (rect.top < window.innerHeight && rect.bottom > 0) {
          setVisibleItems((prev) => new Set(prev).add(idx));
        }
      });
    };
    checkVisible();

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const idx = Number(entry.target.dataset.index);
            setVisibleItems((prev) => new Set(prev).add(idx));
          }
        });
      },
      { threshold: 0.15 }
    );

    items.forEach((item) => observer.observe(item));
    return () => observer.disconnect();
  }, [events]);

  const sectionStyle = bgImage
    ? { backgroundImage: `url(${bgImage})`, backgroundSize: 'cover', backgroundPosition: 'center' }
    : config?.story_bg_color
      ? { background: config.story_bg_color }
      : {};

  const imgFit = config?.story_img_fit || 'cover';
  const textColor = config?.story_text_color;
  const colors = config?.section_colors || {};
  const vars = textColor ? { '--text': textColor, '--text-light': textColor, '--heading-color': textColor } : {};

  return (
    <section className="story section-padding" id="story" style={{ ...sectionStyle, ...vars }}>
      <div className="container">
        <div className="section-header fade-in-scroll">
          <span className="label">Our Story</span>
          <h2>我们的故事</h2>
          <div className="divider"><span>♥</span></div>
        </div>
        <div className="timeline" ref={ref}>
          {events.map((event, i) => (
            <TimelineItem
              key={i}
              event={event}
              index={i}
              isVisible={visibleItems.has(i)}
              imgFit={imgFit}
              colors={colors}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
