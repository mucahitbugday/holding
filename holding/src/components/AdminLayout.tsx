'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { apiClient } from '@/lib/api-client';
import Link from 'next/link';
import LoadingScreen from '@/components/LoadingScreen';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const token = apiClient.getToken();
    if (!token) {
      router.push('/admin/login');
      return;
    }

    // Token'dan user bilgisini decode et (basit bir yaklaşım)
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      setUser(payload);
    } catch (e) {
      router.push('/admin/login');
    }
  }, [router]);

  useEffect(() => {
    // Admin panelinde body'ye class ekle (sadece client-side)
    if (typeof window !== 'undefined' && user) {
      document.body.classList.add('admin-panel');
      return () => {
        // Component unmount olduğunda class'ı kaldır
        document.body.classList.remove('admin-panel');
      };
    }
  }, [user]);

  const handleLogout = () => {
    apiClient.clearToken();
    router.push('/admin/login');
  };

  if (!user) {
    return <LoadingScreen />;
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc' }}>
      <nav style={{ 
        background: 'linear-gradient(135deg, #313131 0%, #414141 100%)', 
        color: 'white', 
        padding: '1rem 2rem', 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
      }}>
        <div>
          <Link href="/admin/dashboard" style={{ 
            color: 'white', 
            textDecoration: 'none', 
            fontSize: '1.5rem', 
            fontWeight: '700',
            letterSpacing: '0.5px'
          }}>
            Admin Panel
          </Link>
        </div>
        <div style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
          <Link 
            href="/" 
            style={{ 
              color: 'white', 
              textDecoration: 'none',
              fontWeight: '500',
              transition: 'opacity 0.2s'
            }}
            onMouseEnter={(e) => e.currentTarget.style.opacity = '0.8'}
            onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
          >
            Ana Sayfa
          </Link>
          <span style={{ 
            background: 'rgba(255, 255, 255, 0.2)', 
            padding: '0.5rem 1rem', 
            borderRadius: '6px',
            fontSize: '0.9rem'
          }}>
            {user.email}
          </span>
          <button
            onClick={handleLogout}
            style={{
              background: 'rgba(255, 255, 255, 0.2)',
              border: '1px solid rgba(255, 255, 255, 0.3)',
              color: 'white',
              padding: '0.5rem 1rem',
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: '500',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.3)';
              e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.5)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)';
              e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.3)';
            }}
          >
            Çıkış
          </button>
        </div>
      </nav>

      <div style={{ display: 'flex' }}>
        <aside style={{ 
          width: '250px', 
          background: 'white', 
          minHeight: 'calc(100vh - 70px)', 
          padding: '1.5rem 0',
          boxShadow: '2px 0 10px rgba(0,0,0,0.05)',
          borderRight: '1px solid #e2e8f0'
        }}>
          <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', padding: '0 1rem' }}>
            <Link
              href="/admin/dashboard"
              style={{
                padding: '0.875rem 1.25rem',
                borderRadius: '8px',
                textDecoration: 'none',
                color: pathname === '/admin/dashboard' ? 'white' : '#313131',
                background: pathname === '/admin/dashboard' ? 'linear-gradient(135deg, #313131 0%, #414141 100%)' : 'transparent',
                fontWeight: pathname === '/admin/dashboard' ? '600' : '500',
                transition: 'all 0.2s',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}
              onMouseEnter={(e) => {
                if (pathname !== '/admin/dashboard') {
                  e.currentTarget.style.background = '#f8fafc';
                }
              }}
              onMouseLeave={(e) => {
                if (pathname !== '/admin/dashboard') {
                  e.currentTarget.style.background = 'transparent';
                }
              }}
            >
              <span>📊</span> Dashboard
            </Link>
            <Link
              href="/admin/dashboard/menus"
              style={{
                padding: '0.875rem 1.25rem',
                borderRadius: '8px',
                textDecoration: 'none',
                color: pathname === '/admin/dashboard/menus' ? 'white' : '#313131',
                background: pathname === '/admin/dashboard/menus' ? 'linear-gradient(135deg, #313131 0%, #414141 100%)' : 'transparent',
                fontWeight: pathname === '/admin/dashboard/menus' ? '600' : '500',
                transition: 'all 0.2s',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}
              onMouseEnter={(e) => {
                if (pathname !== '/admin/dashboard/menus') {
                  e.currentTarget.style.background = '#f8fafc';
                }
              }}
              onMouseLeave={(e) => {
                if (pathname !== '/admin/dashboard/menus') {
                  e.currentTarget.style.background = 'transparent';
                }
              }}
            >
              <span>📋</span> Menü Yönetimi
            </Link>
            <Link
              href="/admin/dashboard/contents"
              style={{
                padding: '0.875rem 1.25rem',
                borderRadius: '8px',
                textDecoration: 'none',
                color: pathname === '/admin/dashboard/contents' ? 'white' : '#313131',
                background: pathname === '/admin/dashboard/contents' ? 'linear-gradient(135deg, #313131 0%, #414141 100%)' : 'transparent',
                fontWeight: pathname === '/admin/dashboard/contents' ? '600' : '500',
                transition: 'all 0.2s',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}
              onMouseEnter={(e) => {
                if (pathname !== '/admin/dashboard/contents') {
                  e.currentTarget.style.background = '#f8fafc';
                }
              }}
              onMouseLeave={(e) => {
                if (pathname !== '/admin/dashboard/contents') {
                  e.currentTarget.style.background = 'transparent';
                }
              }}
            >
              <span>📝</span> İçerik Yönetimi
            </Link>
            <Link
              href="/admin/dashboard/users"
              style={{
                padding: '0.875rem 1.25rem',
                borderRadius: '8px',
                textDecoration: 'none',
                color: pathname === '/admin/dashboard/users' ? 'white' : '#313131',
                background: pathname === '/admin/dashboard/users' ? 'linear-gradient(135deg, #313131 0%, #414141 100%)' : 'transparent',
                fontWeight: pathname === '/admin/dashboard/users' ? '600' : '500',
                transition: 'all 0.2s',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}
              onMouseEnter={(e) => {
                if (pathname !== '/admin/dashboard/users') {
                  e.currentTarget.style.background = '#f8fafc';
                }
              }}
              onMouseLeave={(e) => {
                if (pathname !== '/admin/dashboard/users') {
                  e.currentTarget.style.background = 'transparent';
                }
              }}
            >
              <span>👥</span> Kullanıcı Yönetimi
            </Link>
            <Link
              href="/admin/dashboard/media"
              style={{
                padding: '0.875rem 1.25rem',
                borderRadius: '8px',
                textDecoration: 'none',
                color: pathname === '/admin/dashboard/media' ? 'white' : '#313131',
                background: pathname === '/admin/dashboard/media' ? 'linear-gradient(135deg, #313131 0%, #414141 100%)' : 'transparent',
                fontWeight: pathname === '/admin/dashboard/media' ? '600' : '500',
                transition: 'all 0.2s',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}
              onMouseEnter={(e) => {
                if (pathname !== '/admin/dashboard/media') {
                  e.currentTarget.style.background = '#f8fafc';
                }
              }}
              onMouseLeave={(e) => {
                if (pathname !== '/admin/dashboard/media') {
                  e.currentTarget.style.background = 'transparent';
                }
              }}
            >
              <span>🖼️</span> Medya Yönetimi
            </Link>
            <Link
              href="/admin/dashboard/settings"
              style={{
                padding: '0.875rem 1.25rem',
                borderRadius: '8px',
                textDecoration: 'none',
                color: pathname === '/admin/dashboard/settings' ? 'white' : '#313131',
                background: pathname === '/admin/dashboard/settings' ? 'linear-gradient(135deg, #313131 0%, #414141 100%)' : 'transparent',
                fontWeight: pathname === '/admin/dashboard/settings' ? '600' : '500',
                transition: 'all 0.2s',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}
              onMouseEnter={(e) => {
                if (pathname !== '/admin/dashboard/settings') {
                  e.currentTarget.style.background = '#f8fafc';
                }
              }}
              onMouseLeave={(e) => {
                if (pathname !== '/admin/dashboard/settings') {
                  e.currentTarget.style.background = 'transparent';
                }
              }}
            >
              <span>⚙️</span> Ayarlar
            </Link>
          </nav>
        </aside>

        <main style={{ flex: 1, padding: '2rem', maxWidth: '1400px', margin: '0 auto', width: '100%' }}>
          {children}
        </main>
      </div>
    </div>
  );
}
