import { useState, useEffect } from 'react';
import './Navbar.css';

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('home');

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 50);

      const sections = document.querySelectorAll('section[id]');
      let current = 'home';
      sections.forEach((s) => {
        if (window.scrollY >= s.offsetTop - 100) {
          current = s.getAttribute('id');
        }
      });
      setActiveSection(current);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const links = [
    { href: '#home', label: '首页' },
    { href: '#story', label: '我们的故事' },
    { href: '#gallery', label: '婚纱相册' },
    { href: '#info', label: '婚礼信息' },
    { href: '#invitation', label: '电子请帖' },
    { href: '#blessings', label: '祝福留言' },
  ];

  const handleLinkClick = () => setMenuOpen(false);

  return (
    <nav className={`nav${scrolled ? ' scrolled' : ''}`}>
      <div className="container nav-inner">
        <a href="#home" className="nav-logo">我们结婚啦</a>
        <button
          className={`menu-toggle${menuOpen ? ' active' : ''}`}
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="菜单"
        >
          <span /><span /><span />
        </button>
        <ul className={`nav-links${menuOpen ? ' active' : ''}`}>
          {links.map((link) => (
            <li key={link.href}>
              <a
                href={link.href}
                className={activeSection === link.href.slice(1) ? 'active' : ''}
                onClick={handleLinkClick}
              >
                {link.label}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
}