import { useState, useEffect, useCallback } from 'react';
import GeneralSection from './sections/GeneralSection';
import BackgroundSection from './sections/BackgroundSection';
import StorySection from './sections/StorySection';
import GallerySection from './sections/GallerySection';
import InfoSection from './sections/InfoSection';
import InvitationSection from './sections/InvitationSection';
import BlessingsSection from './sections/BlessingsSection';
import RsvpSection from './sections/RsvpSection';

const TABS = [
  { id: 'general', label: '基本配置', icon: '⚙️' },
  { id: 'background', label: '背景图片', icon: '🖼️' },
  { id: 'story', label: '我们的故事', icon: '📖' },
  { id: 'gallery', label: '婚礼相册', icon: '📸' },
  { id: 'info', label: '婚礼信息', icon: '📋' },
  { id: 'invitation', label: '诚挚邀请', icon: '✉️' },
  { id: 'blessings', label: '留言管理', icon: '💬' },
  { id: 'rsvp', label: 'RSVP管理', icon: '📝' },
];

export default function Dashboard({ token, onLogout }) {
  const [activeTab, setActiveTab] = useState('general');
  const [config, setConfig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchConfig = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/config', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('获取失败');
      const data = await res.json();
      setConfig(data);
    } catch {
      showToast('获取配置失败', 'error');
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchConfig();
  }, [fetchConfig]);

  const saveConfig = async (updates) => {
    try {
      const res = await fetch('/api/admin/config', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updates),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || '保存失败');
      }
      const data = await res.json();
      setConfig(data.config);
      showToast('保存成功！');
    } catch (err) {
      showToast(err.message || '保存失败', 'error');
    }
  };

  if (loading) {
    return <div className="loading">加载配置中...</div>;
  }

  return (
    <div className="dashboard">
      <aside className="sidebar">
        <div className="sidebar-logo">💒 婚礼管理端</div>
        <nav>
          {TABS.map(tab => (
            <button
              key={tab.id}
              className={activeTab === tab.id ? 'active' : ''}
              onClick={() => setActiveTab(tab.id)}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </nav>
        <button className="logout-btn" onClick={onLogout}>
          退出登录
        </button>
      </aside>

      <main className="main-content">
        {activeTab === 'general' && config && (
          <GeneralSection config={config} onSave={saveConfig} />
        )}
        {activeTab === 'background' && config && (
          <BackgroundSection config={config} onSave={saveConfig} />
        )}
        {activeTab === 'story' && config && (
          <StorySection config={config} onSave={saveConfig} />
        )}
        {activeTab === 'gallery' && config && (
          <GallerySection config={config} onSave={saveConfig} />
        )}
        {activeTab === 'info' && config && (
          <InfoSection config={config} onSave={saveConfig} />
        )}
        {activeTab === 'invitation' && config && (
          <InvitationSection config={config} onSave={saveConfig} />
        )}
        {activeTab === 'blessings' && (
          <BlessingsSection token={token} showToast={showToast} />
        )}
        {activeTab === 'rsvp' && (
          <RsvpSection token={token} />
        )}
      </main>

      {toast && (
        <div className={`toast ${toast.type}`}>{toast.msg}</div>
      )}
    </div>
  );
}
