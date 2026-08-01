import { useRef, useEffect, useState } from 'react';
import './Story.css';

const events = [
  {
    date: '2021年3月',
    title: '初次相遇',
    desc: '在一次朋友聚会上，我们第一次见到了彼此。你笑起来的样子，让我一见倾心。',
    img: 'https://images.unsplash.com/photo-1529333166437-7750a6dd5a70?w=400&h=300&fit=crop',
  },
  {
    date: '2022年6月',
    title: '第一次旅行',
    desc: '我们一起去了大理，在洱海边骑行，苍山下看云。那是最美好的夏天。',
    img: 'https://images.unsplash.com/photo-1528164344705-47542687000d?w=400&h=300&fit=crop',
  },
  {
    date: '2023年12月',
    title: '求婚',
    desc: '在初雪的夜晚，你单膝跪地，说出了那句我等待已久的话。Yes, I do.',
    img: 'https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?w=400&h=300&fit=crop',
  },
  {
    date: '2024年2月',
    title: '领证',
    desc: '在一个阳光明媚的早晨，我们成为了彼此生命中最重要的那个人。',
    img: 'https://images.unsplash.com/photo-1583939003579-730e3918a45a?w=400&h=300&fit=crop',
  },
  {
    date: '2026年10月',
    title: '婚礼',
    desc: '终于等到这一天，我们要在所有亲友的见证下，许下一生的承诺。',
    img: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=400&h=300&fit=crop',
  },
];

function TimelineItem({ event, index, isVisible }) {
  const isEven = index % 2 === 1;
  return (
    <div
      className={`timeline-item${isVisible ? ' visible' : ''}`}
      data-index={index}
    >
      <div className="timeline-dot" />
      <div className={`timeline-date${isEven ? ' even' : ''}`}>{event.date}</div>
      <div className={`timeline-card${isEven ? ' even' : ''}`}>
        {event.img && (
          <div className="timeline-card-img">
            <img src={event.img} alt={event.title} loading="lazy" />
          </div>
        )}
        <div className="timeline-card-body">
          <h4>{event.title}</h4>
          <p>{event.desc}</p>
        </div>
      </div>
    </div>
  );
}

export default function Story() {
  const [visibleItems, setVisibleItems] = useState(new Set());
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const items = el.querySelectorAll('.timeline-item');

    // 先让所有已可见的 item 立即显示
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
  }, []);

  return (
    <section className="story section-padding" id="story">
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
            />
          ))}
        </div>
      </div>
    </section>
  );
}