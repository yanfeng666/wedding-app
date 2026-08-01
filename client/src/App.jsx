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
  const [config, setConfig] = useState(null);

  // 获取配置
  useEffect(() => {
    fetch(`${API_BASE}/config`)
      .then(res => res.json())
      .then(data => setConfig(data))
      .catch(err => console.error('获取配置失败:', err));
  }, []);

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

  const galleryImages = config?.gallery_images || [];

  return (
    <>
      <BlessingMarquee blessings={blessings} />
      <Navbar logo={config?.navbar_logo} />
      <Hero config={config} bgImage={config?.hero_bg} />
      <Story config={config} bgImage={config?.story_bg} />
      <Gallery images={galleryImages} onImageClick={openLightbox} bgImage={config?.gallery_bg} />
      <WeddingInfo config={config} bgImage={config?.info_bg} />
      <Invitation config={config} bgImage={config?.invitation_bg} />
      <Blessings blessings={blessings} onSubmit={submitBlessing} />
      <Footer config={config} />
      {lightboxOpen && (
        <Lightbox
          images={galleryImages}
          currentIndex={lightboxIndex}
          onClose={closeLightbox}
        />
      )}
    </>
  );
}
