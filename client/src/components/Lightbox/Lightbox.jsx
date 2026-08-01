import { useState, useEffect, useCallback } from 'react';
import './Lightbox.css';

export default function Lightbox({ images, currentIndex, onClose }) {
  const [index, setIndex] = useState(currentIndex);

  const prev = useCallback(() => {
    setIndex((i) => (i - 1 + images.length) % images.length);
  }, [images.length]);

  const next = useCallback(() => {
    setIndex((i) => (i + 1) % images.length);
  }, [images.length]);

  useEffect(() => {
    setIndex(currentIndex);
  }, [currentIndex]);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') prev();
      if (e.key === 'ArrowRight') next();
    };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [onClose, prev, next]);

  return (
    <div className="lightbox active" onClick={onClose}>
      <button className="lightbox-close" onClick={onClose}>✕</button>
      <button className="lightbox-prev" onClick={(e) => { e.stopPropagation(); prev(); }}>‹</button>
      <button className="lightbox-next" onClick={(e) => { e.stopPropagation(); next(); }}>›</button>
      <img
        src={images[index]?.src}
        alt={images[index]?.label}
        onClick={(e) => e.stopPropagation()}
      />
    </div>
  );
}