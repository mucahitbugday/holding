'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface MenuItem {
  label: string;
  href: string;
  order: number;
  imageUrl?: string;
  pdfUrl?: string;
  children?: MenuItem[];
}

interface Menu {
  _id: string;
  name: string;
  type: 'main' | 'footer';
  items: MenuItem[];
  isActive: boolean;
}

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeSubmenu, setActiveSubmenu] = useState<string | null>(null);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [settings, setSettings] = useState<{ siteName?: string; siteLogo?: string } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMenu();
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const response = await fetch('/api/settings');
      const data = await response.json();
      if (data.success && data.settings) {
        setSettings(data.settings);
      }
    } catch (error) {
      console.error('Ayarlar yüklenemedi:', error);
    }
  };

  const loadMenu = async () => {
    try {
      const response = await fetch('/api/menu?type=main');
      const data = await response.json();
      if (data.success && data.menus && data.menus.length > 0) {
        // Aktif ana menüyü bul
        const activeMenu = data.menus.find((menu: Menu) => menu.isActive) || data.menus[0];
        if (activeMenu && activeMenu.items) {
          // Menü öğelerini sırala ve imageUrl/pdfUrl alanlarını dahil et
          const sortedItems = [...activeMenu.items].sort((a, b) => a.order - b.order);
          setMenuItems(sortedItems);
        }
      }
    } catch (error) {
      console.error('Menü yüklenemedi:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isMenuOpen) {
      document.body.classList.add('menu-open');
    } else {
      document.body.classList.remove('menu-open');
    }
  }, [isMenuOpen]);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 968) {
        setIsMenuOpen(false);
        setActiveSubmenu(null);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const toggleSubmenu = (id: string) => {
    setActiveSubmenu(activeSubmenu === id ? null : id);
  };

  const handleLinkClick = () => {
    setIsMenuOpen(false);
    setActiveSubmenu(null);
  };

  const renderMenuItem = (item: MenuItem, index: number) => {
    const hasChildren = item.children && item.children.length > 0;
    const itemId = `item-${index}`;
    const isExternalLink = item.href.startsWith('/');
    // Medya dosyası kontrolü - imageUrl/pdfUrl varsa veya href medya dosyası uzantısına sahipse
    const isMediaFile = item.imageUrl || item.pdfUrl || 
      (item.href && (item.href.includes('/uploads/') || 
       item.href.match(/\.(jpg|jpeg|png|gif|pdf)$/i)));

    return (
      <li
        key={index}
        className={hasChildren ? `has-submenu ${activeSubmenu === itemId ? 'active' : ''}` : ''}
      >
        {isExternalLink && !isMediaFile ? (
          <Link
            href={item.href}
            onClick={(e) => {
              if (hasChildren && window.innerWidth <= 968) {
                e.preventDefault();
                toggleSubmenu(itemId);
              } else {
                handleLinkClick();
              }
            }}
          >
            {item.label}
          </Link>
        ) : (
          <a
            href={item.href}
            target={isMediaFile ? "_blank" : undefined}
            rel={isMediaFile ? "noopener noreferrer" : undefined}
            onClick={(e) => {
              if (hasChildren && window.innerWidth <= 968) {
                e.preventDefault();
                toggleSubmenu(itemId);
              } else {
                handleLinkClick();
              }
            }}
          >
            {item.label}
          </a>
        )}
        {hasChildren && (
          <ul className="submenu">
            {item.children
              ?.sort((a, b) => a.order - b.order)
              .map((child, childIndex) => {
                const isChildExternalLink = child.href.startsWith('/');
                // Alt menü medya dosyası kontrolü - imageUrl/pdfUrl varsa veya href medya dosyası uzantısına sahipse
                const isChildMediaFile = child.imageUrl || child.pdfUrl || 
                  (child.href && (child.href.includes('/uploads/') || 
                   child.href.match(/\.(jpg|jpeg|png|gif|pdf)$/i)));
                return (
                  <li key={childIndex}>
                    {isChildExternalLink && !isChildMediaFile ? (
                      <Link href={child.href} onClick={handleLinkClick}>
                        {child.label}
                      </Link>
                    ) : (
                      <a 
                        href={child.href} 
                        target={isChildMediaFile ? "_blank" : undefined}
                        rel={isChildMediaFile ? "noopener noreferrer" : undefined}
                        onClick={handleLinkClick}
                      >
                        {child.label}
                      </a>
                    )}
                  </li>
                );
              })}
          </ul>
        )}
      </li>
    );
  };

  const siteName = settings?.siteName || 'Holding Şirketi';
  const siteLogo = settings?.siteLogo;

  if (loading) {
    return (
      <header className="header">
        <div className="container">
          <div className="header-content">
            <div className="logo">
              {siteLogo ? (
                <Link href="/">
                  <img src={siteLogo} alt={siteName} style={{ height: '40px', width: 'auto' }} />
                </Link>
              ) : (
                <Link href="/">
                  <h1>{siteName}</h1>
                </Link>
              )}
            </div>
            <div>Yükleniyor...</div>
          </div>
        </div>
      </header>
    );
  }

  return (
    <header className="header">
      <div className="container">
        <div className="header-content">
          <div className="logo">
            {siteLogo ? (
              <Link href="/">
                <img src={siteLogo} alt={siteName} style={{ height: '40px', width: 'auto' }} />
              </Link>
            ) : (
              <Link href="/">
                <h1>{siteName}</h1>
              </Link>
            )}
          </div>
          <nav className="nav">
            <ul className={`nav-menu ${isMenuOpen ? 'active' : ''}`}>
              {menuItems.length > 0 ? (
                menuItems.map((item, index) => renderMenuItem(item, index))
              ) : (
                // Fallback: Varsayılan menü
                <>
                  <li>
                    <a href="#kurumsal" onClick={handleLinkClick}>Kurumsal</a>
                  </li>
                  <li>
                    <a href="#hizmetler" onClick={handleLinkClick}>Hizmetlerimiz</a>
                  </li>
                  <li>
                    <a href="#ik" onClick={handleLinkClick}>İ.K</a>
                  </li>
                  <li>
                    <a href="#iletisim" onClick={handleLinkClick}>İletişim</a>
                  </li>
                </>
              )}
            </ul>
          </nav>
          <button
            className={`mobile-menu-toggle ${isMenuOpen ? 'active' : ''}`}
            onClick={toggleMenu}
            aria-label="Menu"
          >
            <span></span>
            <span></span>
            <span></span>
          </button>
        </div>
      </div>
    </header>
  );
}
