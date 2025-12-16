'use client';

import { useState, useEffect } from 'react';

interface MenuItem {
  label: string;
  href: string;
  order: number;
  children?: MenuItem[];
}

interface Menu {
  _id: string;
  name: string;
  type: 'main' | 'footer' | 'sidebar';
  items: MenuItem[];
  isActive: boolean;
}

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeSubmenu, setActiveSubmenu] = useState<string | null>(null);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMenu();
  }, []);

  const loadMenu = async () => {
    try {
      const response = await fetch('/api/menu?type=main');
      const data = await response.json();
      if (data.success && data.menus && data.menus.length > 0) {
        // Ana menüyü bul ve öğelerini sırala
        const mainMenu = data.menus[0];
        const sortedItems = [...mainMenu.items].sort((a, b) => a.order - b.order);
        setMenuItems(sortedItems);
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

    return (
      <li
        key={index}
        className={hasChildren ? `has-submenu ${activeSubmenu === itemId ? 'active' : ''}` : ''}
      >
        <a
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
        </a>
        {hasChildren && (
          <ul className="submenu">
            {item.children
              ?.sort((a, b) => a.order - b.order)
              .map((child, childIndex) => (
                <li key={childIndex}>
                  <a href={child.href} onClick={handleLinkClick}>
                    {child.label}
                  </a>
                </li>
              ))}
          </ul>
        )}
      </li>
    );
  };

  if (loading) {
    return (
      <header className="header">
        <div className="container">
          <div className="header-content">
            <div className="logo">
              <h1>Holding Şirketi</h1>
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
            <h1>Holding Şirketi</h1>
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
