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
      document.body.style.overflow = 'hidden'; // Body scroll'u engelle
      return () => {
        // Component unmount olduğunda class'ı kaldır
        document.body.classList.remove('admin-panel');
        document.body.style.overflow = '';
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

  const menuItems = [
    { href: '/admin/dashboard', label: 'Dashboard', icon: '◼' },
    { href: '/admin/dashboard/menus', label: 'Menü Yönetimi', icon: '☰' },
    { href: '/admin/dashboard/categories', label: 'Kategori Yönetimi', icon: '📁' },
    { href: '/admin/dashboard/contents', label: 'İçerik Yönetimi', icon: '📄' },
    { href: '/admin/dashboard/components', label: 'Component Yönetimi', icon: '🧩' },
    { href: '/admin/dashboard/homepage', label: 'Anasayfa Ayarları', icon: '⌂' },
    { href: '/admin/dashboard/users', label: 'Kullanıcı Yönetimi', icon: '👤' },
    { href: '/admin/dashboard/media', label: 'Medya Yönetimi', icon: '🖼' },
    { href: '/admin/dashboard/settings', label: 'Ayarlar', icon: '⚙' },
  ];

  return (
    <div style={{ 
      height: '100vh', 
      display: 'flex', 
      flexDirection: 'column',
      background: '#f5f7fa',
      overflow: 'hidden'
    }}>
      {/* Fixed Header */}
      <header style={{ 
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        height: '64px',
        background: '#ffffff', 
        borderBottom: '1px solid #e5e7eb',
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        padding: '0 24px',
        zIndex: 1000,
        boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '32px',
            height: '32px',
            background: 'linear-gradient(135deg, #1f2937 0%, #374151 100%)',
            borderRadius: '6px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontSize: '18px',
            fontWeight: '600'
          }}>
            A
          </div>
          <Link href="/admin/dashboard" style={{ 
            color: '#1f2937', 
            textDecoration: 'none', 
            fontSize: '18px', 
            fontWeight: '600',
            letterSpacing: '-0.5px'
          }}>
            Admin Panel
          </Link>
        </div>
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          <Link 
            href="/" 
            style={{ 
              color: '#6b7280', 
              textDecoration: 'none',
              fontSize: '14px',
              fontWeight: '500',
              padding: '6px 12px',
              borderRadius: '6px',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#f3f4f6';
              e.currentTarget.style.color = '#1f2937';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent';
              e.currentTarget.style.color = '#6b7280';
            }}
          >
            Ana Sayfa
          </Link>
          <div style={{ 
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '6px 12px',
            background: '#f3f4f6',
            borderRadius: '6px',
            fontSize: '14px',
            color: '#374151'
          }}>
            <span style={{ fontSize: '16px' }}>👤</span>
            <span>{user.email}</span>
          </div>
          <button
            onClick={handleLogout}
            style={{
              background: '#f3f4f6',
              border: 'none',
              color: '#374151',
              padding: '6px 12px',
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: '500',
              fontSize: '14px',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#e5e7eb';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = '#f3f4f6';
            }}
          >
            Çıkış
          </button>
        </div>
      </header>

      <div style={{ 
        display: 'flex', 
        flex: 1,
        marginTop: '64px',
        overflow: 'hidden'
      }}>
        {/* Fixed Sidebar */}
        <aside style={{ 
          width: '240px', 
          background: '#ffffff', 
          borderRight: '1px solid #e5e7eb',
          position: 'fixed',
          left: 0,
          top: '64px',
          bottom: 0,
          overflowY: 'auto',
          overflowX: 'hidden',
          zIndex: 999,
          scrollbarWidth: 'thin',
          scrollbarColor: '#d1d5db transparent'
        }}>
          <style>{`
            aside::-webkit-scrollbar {
              width: 6px;
            }
            aside::-webkit-scrollbar-track {
              background: transparent;
            }
            aside::-webkit-scrollbar-thumb {
              background: #d1d5db;
              border-radius: 3px;
            }
            aside::-webkit-scrollbar-thumb:hover {
              background: #9ca3af;
            }
            main::-webkit-scrollbar {
              width: 8px;
            }
            main::-webkit-scrollbar-track {
              background: #f5f7fa;
            }
            main::-webkit-scrollbar-thumb {
              background: #d1d5db;
              border-radius: 4px;
            }
            main::-webkit-scrollbar-thumb:hover {
              background: #9ca3af;
            }
          `}</style>
          <nav style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            gap: '4px', 
            padding: '12px'
          }}>
            {menuItems.map((item) => {
              const isActive = pathname === item.href || 
                (item.href !== '/admin/dashboard' && pathname.startsWith(item.href));
              
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  style={{
                    padding: '10px 12px',
                    borderRadius: '8px',
                    textDecoration: 'none',
                    color: isActive ? '#1f2937' : '#6b7280',
                    background: isActive ? '#f3f4f6' : 'transparent',
                    fontWeight: isActive ? '600' : '500',
                    fontSize: '14px',
                    transition: 'all 0.15s',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    borderLeft: isActive ? '3px solid #1f2937' : '3px solid transparent'
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.background = '#f9fafb';
                      e.currentTarget.style.color = '#1f2937';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.background = 'transparent';
                      e.currentTarget.style.color = '#6b7280';
                    }
                  }}
                >
                  <span style={{ 
                    fontSize: '18px',
                    width: '20px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    {item.icon}
                  </span>
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </aside>

        {/* Scrollable Main Content */}
        <main style={{ 
          flex: 1, 
          marginLeft: '240px',
          overflowY: 'auto',
          overflowX: 'hidden',
          background: '#f5f7fa',
          padding: '24px',
          minHeight: 'calc(100vh - 64px)'
        }}>
          <div style={{ 
            maxWidth: '1400px', 
            margin: '0 auto',
            width: '100%'
          }}>
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
