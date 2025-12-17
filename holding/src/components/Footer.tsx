'use client';

import { useState, useEffect } from 'react';

interface MenuItem {
  _id?: string;
  label: string;
  href: string;
  order: number;
  imageUrl?: string;
  pdfUrl?: string;
  children?: MenuItem[];
}

interface Settings {
  siteName?: string;
  siteDescription?: string;
  companyName?: string;
  companyPhone?: string;
  companyEmail?: string;
  socialMedia?: {
    facebook?: string;
    twitter?: string;
    instagram?: string;
    linkedin?: string;
    youtube?: string;
  };
}

export default function Footer() {
  const [footerMenus, setFooterMenus] = useState<MenuItem[]>([]);
  const [settings, setSettings] = useState<Settings | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFooterMenu();
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

  const currentYear = new Date().getFullYear();
  const siteName = settings?.siteName || settings?.companyName || 'Holding Şirketi';
  const siteDescription = settings?.siteDescription || 'Dünya standartlarında hizmet anlayışı ile sektörde öncü konumdayız.';
  const companyPhone = settings?.companyPhone || '+90 0850 466 04 77';
  const companyEmail = settings?.companyEmail || 'info@holding.com.tr';

  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-content">
          <div className="footer-section">
            <h3>{siteName}</h3>
            <p>{siteDescription}</p>
            {settings?.socialMedia && (
              <div style={{ display: 'flex', gap: '12px', marginTop: '12px', flexWrap: 'wrap' }}>
                {settings.socialMedia.facebook && (
                  <a href={settings.socialMedia.facebook} target="_blank" rel="noopener noreferrer" style={{ color: '#fff', fontSize: '20px' }}>📘</a>
                )}
                {settings.socialMedia.twitter && (
                  <a href={settings.socialMedia.twitter} target="_blank" rel="noopener noreferrer" style={{ color: '#fff', fontSize: '20px' }}>🐦</a>
                )}
                {settings.socialMedia.instagram && (
                  <a href={settings.socialMedia.instagram} target="_blank" rel="noopener noreferrer" style={{ color: '#fff', fontSize: '20px' }}>📷</a>
                )}
                {settings.socialMedia.linkedin && (
                  <a href={settings.socialMedia.linkedin} target="_blank" rel="noopener noreferrer" style={{ color: '#fff', fontSize: '20px' }}>💼</a>
                )}
                {settings.socialMedia.youtube && (
                  <a href={settings.socialMedia.youtube} target="_blank" rel="noopener noreferrer" style={{ color: '#fff', fontSize: '20px' }}>📺</a>
                )}
              </div>
            )}
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
                      .map((child, childIndex) => {
                        const isChildMediaFile = child.imageUrl || child.pdfUrl || 
                          (child.href && (child.href.includes('/uploads/') || 
                           child.href.match(/\.(jpg|jpeg|png|gif|pdf)$/i)));
                        return (
                          <li key={child._id || childIndex}>
                            <a 
                              href={child.href}
                              target={isChildMediaFile ? "_blank" : undefined}
                              rel={isChildMediaFile ? "noopener noreferrer" : undefined}
                            >
                              {child.label}
                            </a>
                          </li>
                        );
                      })
                  ) : (
                    <li>
                      <a 
                        href={item.href}
                        target={(item.imageUrl || item.pdfUrl || 
                          (item.href && (item.href.includes('/uploads/') || 
                           item.href.match(/\.(jpg|jpeg|png|gif|pdf)$/i)))) ? "_blank" : undefined}
                        rel={(item.imageUrl || item.pdfUrl || 
                          (item.href && (item.href.includes('/uploads/') || 
                           item.href.match(/\.(jpg|jpeg|png|gif|pdf)$/i)))) ? "noopener noreferrer" : undefined}
                      >
                        {item.label}
                      </a>
                    </li>
                  )}
                </ul>
              </div>
            ))
          ) : null}

          <div className="footer-section">
            <h4>İletişim</h4>
            {companyPhone && <p>{companyPhone}</p>}
            {companyEmail && <p><a href={`mailto:${companyEmail}`} style={{ color: 'inherit', textDecoration: 'none' }}>{companyEmail}</a></p>}
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy; {currentYear} {siteName}, Her hakkı saklıdır.</p>
          <p>Web Tasarım MediaClick</p>
        </div>
      </div>
    </footer>
  );
}
