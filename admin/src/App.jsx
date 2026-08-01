import { useState, useEffect } from 'react';
import { Spin } from 'antd';
import Login from './Login';
import Dashboard from './Dashboard';
import './App.css';

export default function App() {
  const [token, setToken] = useState(() => localStorage.getItem('admin_token'));
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    if (!token) { setChecking(false); return; }
    fetch('/api/admin/verify', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => {
        if (!res.ok) { localStorage.removeItem('admin_token'); setToken(null); }
      })
      .catch(() => { localStorage.removeItem('admin_token'); setToken(null); })
      .finally(() => setChecking(false));
  }, [token]);

  if (checking) {
    return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}><Spin size="large" /></div>;
  }

  if (!token) {
    return <Login onLogin={setToken} />;
  }

  return <Dashboard token={token} onLogout={() => { localStorage.removeItem('admin_token'); setToken(null); }} />;
}
