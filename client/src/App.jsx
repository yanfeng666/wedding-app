import { useState, useEffect, useCallback } from 'react';
import Navbar from './components/Navbar/Navbar';
import Hero from './components/Hero/Hero';
import Story from './components/Story/Story';
import Gallery from './components/Gallery/Gallery';
import Lightbox from './components/Lightbox/Lightbox';
import WeddingInfo from './components/WeddingInfo/WeddingInfo';
import Invitation from './components/Invitation/Invitation';
import Blessings from './components/Blessings/Blessings';
import BlessingMarquee from './components/BlessingMarquee/BlessingMarquee';
import Footer from './components/Footer/Footer';

const API_BASE = '/api';

export default function App() {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [blessings, setBlessings] = useState([]);

  const fetchBlessings = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/blessings`);
      const data = await res.json();
      setBlessings(data);
    } catch (err) {
      console.error('获取祝福失败:', err);
    }
  }, []);

  useEffect(() => {
    fetchBlessings();
  }, [fetchBlessings]);

  const openLightbox = (index) => {
    setLightboxIndex(index);
    setLightboxOpen(true);
  };

  const closeLightbox = () => setLightboxOpen(false);

  const submitBlessing = async (blessing) => {
    try {
      const res = await fetch(`${API_BASE}/blessings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(blessing),
      });
      if (res.ok) {
        await fetchBlessings();
        return true;
      }
    } catch (err) {
      console.error('提交祝福失败:', err);
    }
    return false;
  };

  return (
    <>
      <BlessingMarquee blessings={blessings} />
      <Navbar />
      <Hero />
      <Story />
      <Gallery images={GALLERY_IMAGES} onImageClick={openLightbox} />
      <WeddingInfo />
      <Invitation />
      <Blessings
        blessings={blessings}
        onSubmit={submitBlessing}
      />
      <Footer />
      {lightboxOpen && (
        <Lightbox
          images={GALLERY_IMAGES}
          currentIndex={lightboxIndex}
          onClose={closeLightbox}
        />
      )}
    </>
  );
}

export const GALLERY_IMAGES = [
  { src: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=800&h=600&fit=crop', label: '幸福时刻' },
  { src: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=800&h=600&fit=crop', label: '甜蜜瞬间' },
  { src: 'https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?w=800&h=600&fit=crop', label: '浪漫时光' },
  { src: 'https://images.unsplash.com/photo-1529636798458-92182e662485?w=800&h=600&fit=crop', label: '携手同行' },
  { src: 'https://images.unsplash.com/photo-1583939003579-730e3918a45a?w=800&h=600&fit=crop', label: '爱的约定' },
  { src: 'https://images.unsplash.com/photo-1606800052052-a08af7148866?w=800&h=600&fit=crop', label: '一生一世' },
];