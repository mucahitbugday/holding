'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { apiClient } from '@/lib/api-client';
import LoadingScreen from '@/components/LoadingScreen';
import Button from '@/components/ui/Button';

export default function Dashboard() {
  const [stats, setStats] = useState({
    menus: 0,
    contents: 0,
    activeContents: 0,
    totalUsers: 0,
    totalVisits: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      setLoading(true);
      const [menusRes, contentsRes, visitsRes] = await Promise.all([
        apiClient.getMenus(),
        apiClient.getContents(),
        apiClient.getVisits().catch(() => ({ totalVisits: 0 })),
      ]);
      
      const menus = menusRes.menus || [];
      const contents = contentsRes.contents || [];
      
      setStats({
        menus: menus.length,
        contents: contents.length,
        activeContents: contents.filter((c: any) => c.isActive).length,
        totalUsers: 0, // API'den gelecek
        totalVisits: visitsRes.totalVisits || 0,
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

  const cardStyle = {
    background: '#ffffff',
    padding: '20px',
    borderRadius: '8px',
    border: '1px solid #e5e7eb',
  };

  const linkCardStyle = {
    ...cardStyle,
    textDecoration: 'none',
    color: '#1f2937',
    display: 'block',
  };

  return (
    <div>
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '24px', marginBottom: '4px', color: '#1f2937', fontWeight: '600' }}>Dashboard</h1>
        <p style={{ color: '#6b7280', fontSize: '14px' }}>Yönetim paneline hoş geldiniz</p>
      </div>

      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
        gap: '16px',
        marginBottom: '32px'
      }}>
        <div style={cardStyle}>
          <div style={{ fontSize: '28px', fontWeight: '600', marginBottom: '4px', color: '#1f2937' }}>{stats.menus}</div>
          <div style={{ fontSize: '13px', color: '#6b7280' }}>Toplam Menü</div>
        </div>
        <div style={cardStyle}>
          <div style={{ fontSize: '28px', fontWeight: '600', marginBottom: '4px', color: '#1f2937' }}>{stats.contents}</div>
          <div style={{ fontSize: '13px', color: '#6b7280' }}>Toplam İçerik</div>
        </div>
        <div style={cardStyle}>
          <div style={{ fontSize: '28px', fontWeight: '600', marginBottom: '4px', color: '#1f2937' }}>{stats.activeContents}</div>
          <div style={{ fontSize: '13px', color: '#6b7280' }}>Aktif İçerik</div>
        </div>
        <div style={cardStyle}>
          <div style={{ fontSize: '28px', fontWeight: '600', marginBottom: '4px', color: '#1f2937' }}>{stats.totalUsers}</div>
          <div style={{ fontSize: '13px', color: '#6b7280' }}>Toplam Kullanıcı</div>
        </div>
        <div style={cardStyle}>
          <div style={{ fontSize: '28px', fontWeight: '600', marginBottom: '4px', color: '#1f2937' }}>{stats.totalVisits.toLocaleString('tr-TR')}</div>
          <div style={{ fontSize: '13px', color: '#6b7280' }}>Toplam Ziyaret</div>
        </div>
      </div>
      
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', 
        gap: '16px' 
      }}>
        <Link href="/admin/dashboard/menus" style={linkCardStyle}>
          <h2 style={{ fontSize: '16px', marginBottom: '8px', fontWeight: '600', color: '#1f2937' }}>Menü Yönetimi</h2>
          <p style={{ color: '#6b7280', lineHeight: '1.5', fontSize: '13px', margin: 0 }}>Ana menü ve footer menülerini düzenleyin.</p>
        </Link>
        <Link href="/admin/dashboard/contents" style={linkCardStyle}>
          <h2 style={{ fontSize: '16px', marginBottom: '8px', fontWeight: '600', color: '#1f2937' }}>İçerik Yönetimi</h2>
          <p style={{ color: '#6b7280', lineHeight: '1.5', fontSize: '13px', margin: 0 }}>Sayfa içeriklerini ve hizmetleri düzenleyin.</p>
        </Link>
        <Link href="/admin/dashboard/users" style={linkCardStyle}>
          <h2 style={{ fontSize: '16px', marginBottom: '8px', fontWeight: '600', color: '#1f2937' }}>Kullanıcı Yönetimi</h2>
          <p style={{ color: '#6b7280', lineHeight: '1.5', fontSize: '13px', margin: 0 }}>Kullanıcıları görüntüleyin ve yönetin.</p>
        </Link>
        <Link href="/admin/dashboard/media" style={linkCardStyle}>
          <h2 style={{ fontSize: '16px', marginBottom: '8px', fontWeight: '600', color: '#1f2937' }}>Medya Yönetimi</h2>
          <p style={{ color: '#6b7280', lineHeight: '1.5', fontSize: '13px', margin: 0 }}>Resim ve PDF dosyalarını yükleyin.</p>
        </Link>
        <Link href="/admin/dashboard/settings" style={linkCardStyle}>
          <h2 style={{ fontSize: '16px', marginBottom: '8px', fontWeight: '600', color: '#1f2937' }}>Ayarlar</h2>
          <p style={{ color: '#6b7280', lineHeight: '1.5', fontSize: '13px', margin: 0 }}>Site ayarlarını yönetin.</p>
        </Link>
      </div>
    </div>
  );
}
