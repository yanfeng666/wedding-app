import './Footer.css';

export default function Footer() {
  const handleExport = () => {
    window.open('/api/export', '_blank');
  };

  return (
    <footer className="footer">
      <div className="footer-names">张三 &amp; 李四</div>
      <p className="footer-quote">「 执子之手，与子偕老 」</p>
      <div className="footer-divider" />
      <p className="copyright">2026 · 感谢你来见证我们的幸福</p>
      <button onClick={handleExport} style={{
        marginTop: '12px',
        padding: '6px 16px',
        fontSize: '12px',
        background: 'rgba(255,255,255,0.15)',
        border: '1px solid rgba(255,255,255,0.3)',
        borderRadius: '20px',
        color: '#fff',
        cursor: 'pointer',
        backdropFilter: 'blur(4px)',
      }}>
        📥 导出数据
      </button>
    </footer>
  );
}