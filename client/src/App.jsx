import { useState, useEffect, useCallback, useRef } from 'react';
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

// 预加载单张图片
function preloadImage(src) {
  return new Promise((resolve) => {
    if (!src || src.startsWith('data:')) {
      resolve();
      return;
    }
    const img = new Image();
    img.onload = () => resolve();
    img.onerror = () => resolve(); // 出错也继续，不阻塞
    img.src = src;
  });
}

// 收集所有需要预加载的图片 URL
function collectImages(config) {
  const urls = [];
  // 背景图
  ['hero_bg', 'story_bg', 'gallery_bg', 'info_bg', 'invitation_bg'].forEach((key) => {
    if (config[key]) urls.push(config[key]);
  });
  // 故事图片
  (config.story_items || []).forEach((item) => {
    if (item.img) urls.push(item.img);
  });
  // 相册图片
  (config.gallery_images || []).forEach((item) => {
    if (item.src) urls.push(item.src);
  });
  return urls;
}

export default function App() {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [blessings, setBlessings] = useState([]);
  const [config, setConfig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadProgress, setLoadProgress] = useState(0);
  const configRef = useRef(null);

  // 获取配置 + 预加载资源
  useEffect(() => {
    let cancelled = false;
    fetch(`${API_BASE}/config`)
      .then(res => res.json())
      .then(async (data) => {
        if (cancelled) return;
        configRef.current = data;
        setConfig(data);

        // 应用文字颜色
        const root = document.documentElement;
        if (data.text_color) {
          root.style.setProperty('--text', data.text_color);
          root.style.setProperty('--text-light', data.text_color);
        }
        if (data.heading_color) {
          root.style.setProperty('--heading-color', data.heading_color);
        }

        // 预加载图片
        const images = collectImages(data);
        if (images.length === 0) {
          setLoadProgress(100);
          setTimeout(() => !cancelled && setLoading(false), 300);
          return;
        }
        let completed = 0;
        await Promise.all(
          images.map((src) =>
            preloadImage(src).then(() => {
              completed++;
              if (!cancelled) setLoadProgress(Math.round((completed / images.length) * 100));
            })
          )
        );
        if (!cancelled) {
          setLoadProgress(100);
          setTimeout(() => setLoading(false), 400);
        }
      })
      .catch((err) => {
        console.error('获取配置失败:', err);
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
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
      {loading && (
        <div className={`loading-screen${loadProgress >= 100 ? ' hidden' : ''}`}>
          <div className="loading-heart">♥</div>
          <div className="loading-text">正在准备婚礼页面...</div>
          <div className="loading-bar">
            <div className="loading-bar-fill" style={{ width: `${loadProgress}%` }} />
          </div>
          <div className="loading-percent">{loadProgress}%</div>
        </div>
      )}
      <BlessingMarquee blessings={blessings} />
      <Navbar logo={config?.navbar_logo} />
      <Hero config={config} bgImage={config?.hero_bg} />
      <Story config={config} bgImage={config?.story_bg} />
      <Gallery
        images={galleryImages}
        onImageClick={openLightbox}
        bgImage={config?.gallery_bg}
        imgFit={config?.gallery_img_fit}
        bgColor={config?.gallery_bg_color}
        textColor={config?.gallery_text_color}
      />
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
