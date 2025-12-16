'use client';

import { useState, useEffect } from 'react';

interface MenuItem {
  _id?: string;
  label: string;
  href: string;
  order: number;
  children?: MenuItem[];
}

export default function Footer() {
  const [footerMenus, setFooterMenus] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFooterMenu();
  }, []);

  const loadFooterMenu = async () => {
    try {
      const response = await fetch('/api/menu?type=footer');
      const data = await response.json();
      if (data.success && data.menus && data.menus.length > 0) {
        // Aktif footer menüsünü bul
        const activeFooterMenu = data.menus.find((menu: any) => menu.isActive) || data.menus[0];
        if (activeFooterMenu && activeFooterMenu.items) {
          // Menü öğelerini sırasına göre sırala
          const sortedItems = [...activeFooterMenu.items].sort((a: MenuItem, b: MenuItem) => a.order - b.order);
          setFooterMenus(sortedItems);
        }
      }
    } catch (error) {
      console.error('Footer menü yüklenemedi:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-content">
          <div className="footer-section">
            <h3>Holding Şirketi</h3>
            <p>Dünya standartlarında hizmet anlayışı ile sektörde öncü konumdayız.</p>
          </div>
          
          {loading ? (
            <div className="footer-section">
              <p>Yükleniyor...</p>
            </div>
          ) : footerMenus.length > 0 ? (
            footerMenus.map((item, index) => (
              <div key={item._id || index} className="footer-section">
                <h4>{item.label}</h4>
                <ul>
                  {item.children && item.children.length > 0 ? (
                    item.children
                      .sort((a, b) => a.order - b.order)
                      .map((child, childIndex) => (
                        <li key={child._id || childIndex}>
                          <a href={child.href}>{child.label}</a>
                        </li>
                      ))
                  ) : (
                    <li>
                      <a href={item.href}>{item.label}</a>
                    </li>
                  )}
                </ul>
              </div>
            ))
          ) : null}

          <div className="footer-section">
            <h4>İletişim</h4>
            <p>+90 0850 466 04 77</p>
            <p>info@holding.com.tr</p>
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy; 2024 Holding Şirketi, Her hakkı saklıdır.</p>
          <p>Web Tasarım MediaClick</p>
        </div>
      </div>
    </footer>
  );
}
