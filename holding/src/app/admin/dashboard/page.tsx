'use client';

import Link from 'next/link';

export default function Dashboard() {
  return (
    <div>
      <h1 style={{ fontSize: '2rem', marginBottom: '2rem', color: '#313131' }}>Dashboard</h1>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem' }}>
        <Link
          href="/admin/dashboard/menus"
          style={{
            background: 'white',
            padding: '2rem',
            borderRadius: '10px',
            boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
            textDecoration: 'none',
            color: '#313131',
            display: 'block',
            transition: 'transform 0.2s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-5px)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
          }}
        >
          <h2 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>Menü Yönetimi</h2>
          <p style={{ color: '#666' }}>Ana menü ve alt menüleri düzenleyin</p>
        </Link>

        <Link
          href="/admin/dashboard/contents"
          style={{
            background: 'white',
            padding: '2rem',
            borderRadius: '10px',
            boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
            textDecoration: 'none',
            color: '#313131',
            display: 'block',
            transition: 'transform 0.2s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-5px)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
          }}
        >
          <h2 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>İçerik Yönetimi</h2>
          <p style={{ color: '#666' }}>Sayfa içeriklerini düzenleyin</p>
        </Link>
      </div>
    </div>
  );
}
