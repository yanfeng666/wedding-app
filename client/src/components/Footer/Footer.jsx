import './Footer.css';

export default function Footer({ config }) {
  const groom = config?.groom_name || '张三';
  const bride = config?.bride_name || '李四';
  const quote = config?.footer_quote || '执子之手，与子偕老';

  return (
    <footer className="footer">
      <div className="footer-names">{groom} &amp; {bride}</div>
      <p className="footer-quote">「 {quote} 」</p>
      <div className="footer-divider" />
      <p className="copyright">2026 · 感谢你来见证我们的幸福</p>
    </footer>
  );
}
