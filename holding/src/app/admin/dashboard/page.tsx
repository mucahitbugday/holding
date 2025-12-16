'use client';

import Link from 'next/link';

export default function Dashboard() {
  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem', color: '#313131', fontWeight: '700' }}>Dashboard</h1>
        <p style={{ color: '#666', fontSize: '1.1rem' }}>Yönetim paneline hoş geldiniz</p>
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
      </div>
    </div>
  );
}
