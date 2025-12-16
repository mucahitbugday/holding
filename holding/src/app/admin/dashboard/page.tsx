'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { apiClient } from '@/lib/api-client';
import LoadingScreen from '@/components/LoadingScreen';

export default function Dashboard() {
  const [stats, setStats] = useState({
    menus: 0,
    contents: 0,
    activeContents: 0,
    totalUsers: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      setLoading(true);
      const [menusRes, contentsRes] = await Promise.all([
        apiClient.getMenus(),
        apiClient.getContents(),
      ]);
      
      const menus = menusRes.menus || [];
      const contents = contentsRes.contents || [];
      
      setStats({
        menus: menus.length,
        contents: contents.length,
        activeContents: contents.filter((c: any) => c.isActive).length,
        totalUsers: 0, // API'den gelecek
      });
    } catch (error) {
      console.error('İstatistikler yüklenemedi:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem', color: '#313131', fontWeight: '700' }}>Dashboard</h1>
        <p style={{ color: '#666', fontSize: '1.1rem' }}>Yönetim paneline hoş geldiniz</p>
      </div>

      {/* İstatistikler */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
        gap: '1.5rem',
        marginBottom: '2rem'
      }}>
        <div style={{
          background: 'linear-gradient(135deg, #313131 0%, #414141 100%)',
          padding: '1.5rem',
          borderRadius: '12px',
          color: 'white',
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
        }}>
          <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📋</div>
          <div style={{ fontSize: '2.5rem', fontWeight: '700', marginBottom: '0.25rem' }}>{stats.menus}</div>
          <div style={{ fontSize: '0.9rem', opacity: 0.9 }}>Toplam Menü</div>
        </div>

        <div style={{
          background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
          padding: '1.5rem',
          borderRadius: '12px',
          color: 'white',
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
        }}>
          <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📝</div>
          <div style={{ fontSize: '2.5rem', fontWeight: '700', marginBottom: '0.25rem' }}>{stats.contents}</div>
          <div style={{ fontSize: '0.9rem', opacity: 0.9 }}>Toplam İçerik</div>
        </div>

        <div style={{
          background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
          padding: '1.5rem',
          borderRadius: '12px',
          color: 'white',
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
        }}>
          <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>✅</div>
          <div style={{ fontSize: '2.5rem', fontWeight: '700', marginBottom: '0.25rem' }}>{stats.activeContents}</div>
          <div style={{ fontSize: '0.9rem', opacity: 0.9 }}>Aktif İçerik</div>
        </div>

        <div style={{
          background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
          padding: '1.5rem',
          borderRadius: '12px',
          color: 'white',
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
        }}>
          <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>👥</div>
          <div style={{ fontSize: '2.5rem', fontWeight: '700', marginBottom: '0.25rem' }}>{stats.totalUsers}</div>
          <div style={{ fontSize: '0.9rem', opacity: 0.9 }}>Toplam Kullanıcı</div>
        </div>
      </div>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
        <Link
          href="/admin/dashboard/menus"
          style={{
            background: 'white',
            padding: '2.5rem',
            borderRadius: '12px',
            boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
            textDecoration: 'none',
            color: '#313131',
            display: 'block',
            transition: 'all 0.3s',
            border: '2px solid transparent',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-5px)';
            e.currentTarget.style.boxShadow = '0 8px 20px rgba(0,0,0,0.15)';
            e.currentTarget.style.borderColor = '#313131';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 2px 10px rgba(0,0,0,0.1)';
            e.currentTarget.style.borderColor = 'transparent';
          }}
        >
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📋</div>
          <h2 style={{ fontSize: '1.75rem', marginBottom: '0.75rem', fontWeight: '600' }}>Menü Yönetimi</h2>
          <p style={{ color: '#666', lineHeight: '1.6', fontSize: '1rem' }}>Ana menü, footer ve sidebar menülerini düzenleyin. Alt menüler ekleyin ve sıralamalarını ayarlayın.</p>
        </Link>

        <Link
          href="/admin/dashboard/contents"
          style={{
            background: 'white',
            padding: '2.5rem',
            borderRadius: '12px',
            boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
            textDecoration: 'none',
            color: '#313131',
            display: 'block',
            transition: 'all 0.3s',
            border: '2px solid transparent',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-5px)';
            e.currentTarget.style.boxShadow = '0 8px 20px rgba(0,0,0,0.15)';
            e.currentTarget.style.borderColor = '#313131';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 2px 10px rgba(0,0,0,0.1)';
            e.currentTarget.style.borderColor = 'transparent';
          }}
        >
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📝</div>
          <h2 style={{ fontSize: '1.75rem', marginBottom: '0.75rem', fontWeight: '600' }}>İçerik Yönetimi</h2>
          <p style={{ color: '#666', lineHeight: '1.6', fontSize: '1rem' }}>Sayfa içeriklerini, hizmetleri, haberleri ve diğer içerikleri düzenleyin.</p>
        </Link>

        <Link
          href="/admin/dashboard/users"
          style={{
            background: 'white',
            padding: '2.5rem',
            borderRadius: '12px',
            boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
            textDecoration: 'none',
            color: '#313131',
            display: 'block',
            transition: 'all 0.3s',
            border: '2px solid transparent',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-5px)';
            e.currentTarget.style.boxShadow = '0 8px 20px rgba(0,0,0,0.15)';
            e.currentTarget.style.borderColor = '#313131';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 2px 10px rgba(0,0,0,0.1)';
            e.currentTarget.style.borderColor = 'transparent';
          }}
        >
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>👥</div>
          <h2 style={{ fontSize: '1.75rem', marginBottom: '0.75rem', fontWeight: '600' }}>Kullanıcı Yönetimi</h2>
          <p style={{ color: '#666', lineHeight: '1.6', fontSize: '1rem' }}>Kullanıcıları görüntüleyin, düzenleyin ve yönetin. Roller ve izinleri ayarlayın.</p>
        </Link>

        <Link
          href="/admin/dashboard/media"
          style={{
            background: 'white',
            padding: '2.5rem',
            borderRadius: '12px',
            boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
            textDecoration: 'none',
            color: '#313131',
            display: 'block',
            transition: 'all 0.3s',
            border: '2px solid transparent',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-5px)';
            e.currentTarget.style.boxShadow = '0 8px 20px rgba(0,0,0,0.15)';
            e.currentTarget.style.borderColor = '#313131';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 2px 10px rgba(0,0,0,0.1)';
            e.currentTarget.style.borderColor = 'transparent';
          }}
        >
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🖼️</div>
          <h2 style={{ fontSize: '1.75rem', marginBottom: '0.75rem', fontWeight: '600' }}>Medya Yönetimi</h2>
          <p style={{ color: '#666', lineHeight: '1.6', fontSize: '1rem' }}>Resim, video ve diğer medya dosyalarını yükleyin ve yönetin.</p>
        </Link>

        <Link
          href="/admin/dashboard/settings"
          style={{
            background: 'white',
            padding: '2.5rem',
            borderRadius: '12px',
            boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
            textDecoration: 'none',
            color: '#313131',
            display: 'block',
            transition: 'all 0.3s',
            border: '2px solid transparent',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-5px)';
            e.currentTarget.style.boxShadow = '0 8px 20px rgba(0,0,0,0.15)';
            e.currentTarget.style.borderColor = '#313131';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 2px 10px rgba(0,0,0,0.1)';
            e.currentTarget.style.borderColor = 'transparent';
          }}
        >
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⚙️</div>
          <h2 style={{ fontSize: '1.75rem', marginBottom: '0.75rem', fontWeight: '600' }}>Ayarlar</h2>
          <p style={{ color: '#666', lineHeight: '1.6', fontSize: '1rem' }}>Site ayarlarını, genel bilgileri ve sistem konfigürasyonlarını yönetin.</p>
        </Link>
      </div>
    </div>
  );
}
