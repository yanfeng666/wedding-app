import { useState, useEffect, useCallback } from 'react';
import { Layout, Menu, Spin, message } from 'antd';
import {
  SettingOutlined, PictureOutlined, BookOutlined,
  CameraOutlined, ProfileOutlined, MailOutlined,
  MessageOutlined, ScheduleOutlined, LogoutOutlined,
} from '@ant-design/icons';
import GeneralSection from './sections/GeneralSection';
import BackgroundSection from './sections/BackgroundSection';
import StorySection from './sections/StorySection';
import GallerySection from './sections/GallerySection';
import InfoSection from './sections/InfoSection';
import InvitationSection from './sections/InvitationSection';
import BlessingsSection from './sections/BlessingsSection';
import RsvpSection from './sections/RsvpSection';

const { Sider, Content, Header } = Layout;

const MENU_ITEMS = [
  { key: 'general', icon: <SettingOutlined />, label: '基本配置' },
  { key: 'background', icon: <PictureOutlined />, label: '背景图片' },
  { key: 'story', icon: <BookOutlined />, label: '我们的故事' },
  { key: 'gallery', icon: <CameraOutlined />, label: '婚礼相册' },
  { key: 'info', icon: <ProfileOutlined />, label: '婚礼信息' },
  { key: 'invitation', icon: <MailOutlined />, label: '诚挚邀请' },
  { key: 'blessings', icon: <MessageOutlined />, label: '留言管理' },
  { key: 'rsvp', icon: <ScheduleOutlined />, label: 'RSVP管理' },
];

export default function Dashboard({ token, onLogout }) {
  const [activeTab, setActiveTab] = useState('general');
  const [config, setConfig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [messageApi, contextHolder] = message.useMessage();

  const showToast = (msg, type = 'success') => {
    messageApi[type](msg);
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

  const renderContent = () => {
    if (loading) return <div style={{ textAlign: 'center', paddingTop: 100 }}><Spin size="large" /></div>;
    switch (activeTab) {
      case 'general': return config && <GeneralSection config={config} onSave={saveConfig} />;
      case 'background': return config && <BackgroundSection config={config} onSave={saveConfig} />;
      case 'story': return config && <StorySection config={config} onSave={saveConfig} />;
      case 'gallery': return config && <GallerySection config={config} onSave={saveConfig} />;
      case 'info': return config && <InfoSection config={config} onSave={saveConfig} />;
      case 'invitation': return config && <InvitationSection config={config} onSave={saveConfig} />;
      case 'blessings': return <BlessingsSection token={token} showToast={showToast} />;
      case 'rsvp': return <RsvpSection token={token} showToast={showToast} />;
      default: return null;
    }
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      {contextHolder}
      <Sider breakpoint="lg" collapsedWidth="0" style={{ background: '#fff' }}>
        <div style={{ height: 64, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, fontWeight: 600, color: '#d4888a', borderBottom: '1px solid #f0f0f0' }}>
          💒 婚礼管理端
        </div>
        <Menu
          mode="inline"
          selectedKeys={[activeTab]}
          items={MENU_ITEMS}
          onClick={({ key }) => setActiveTab(key)}
          style={{ borderRight: 0 }}
        />
        <div style={{ position: 'absolute', bottom: 0, width: '100%', padding: 16, borderTop: '1px solid #f0f0f0' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', color: '#666' }} onClick={onLogout}>
            <LogoutOutlined />
            <span>退出登录</span>
          </div>
        </div>
      </Sider>
      <Layout>
        <Header style={{ background: '#fff', padding: '0 24px', borderBottom: '1px solid #f0f0f0' }}>
          <h2 style={{ margin: 0, fontSize: 18, lineHeight: '64px' }}>
            {MENU_ITEMS.find(m => m.key === activeTab)?.label}
          </h2>
        </Header>
        <Content style={{ margin: 24, padding: 24, background: '#fff', borderRadius: 12, minHeight: 360 }}>
          {renderContent()}
        </Content>
      </Layout>
    </Layout>
  );
}
