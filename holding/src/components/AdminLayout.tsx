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

  const handleLogout = () => {
    apiClient.clearToken();
    router.push('/admin/login');
  };

  if (!user) {
    return <LoadingScreen />;
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc' }}>
      <nav style={{ background: '#313131', color: 'white', padding: '1rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <Link href="/admin/dashboard" style={{ color: 'white', textDecoration: 'none', fontSize: '1.5rem', fontWeight: 'bold' }}>
            Admin Panel
          </Link>
        </div>
        <div style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
          <Link href="/" style={{ color: 'white', textDecoration: 'none' }}>Ana Sayfa</Link>
          <span>{user.email}</span>
          <button
            onClick={handleLogout}
            style={{
              background: 'transparent',
              border: '1px solid white',
              color: 'white',
              padding: '0.5rem 1rem',
              borderRadius: '5px',
              cursor: 'pointer',
            }}
          >
            Çıkış
          </button>
        </div>
      </nav>

      <div style={{ display: 'flex' }}>
        <aside style={{ width: '250px', background: 'white', minHeight: 'calc(100vh - 70px)', padding: '1rem', boxShadow: '2px 0 5px rgba(0,0,0,0.1)' }}>
          <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <Link
              href="/admin/dashboard"
              style={{
                padding: '0.75rem 1rem',
                borderRadius: '5px',
                textDecoration: 'none',
                color: pathname === '/admin/dashboard' ? 'white' : '#313131',
                background: pathname === '/admin/dashboard' ? '#313131' : 'transparent',
              }}
            >
              Dashboard
            </Link>
            <Link
              href="/admin/dashboard/menus"
              style={{
                padding: '0.75rem 1rem',
                borderRadius: '5px',
                textDecoration: 'none',
                color: pathname === '/admin/dashboard/menus' ? 'white' : '#313131',
                background: pathname === '/admin/dashboard/menus' ? '#313131' : 'transparent',
              }}
            >
              Menü Yönetimi
            </Link>
            <Link
              href="/admin/dashboard/contents"
              style={{
                padding: '0.75rem 1rem',
                borderRadius: '5px',
                textDecoration: 'none',
                color: pathname === '/admin/dashboard/contents' ? 'white' : '#313131',
                background: pathname === '/admin/dashboard/contents' ? '#313131' : 'transparent',
              }}
            >
              İçerik Yönetimi
            </Link>
          </nav>
        </aside>

        <main style={{ flex: 1, padding: '2rem' }}>
          {children}
        </main>
      </div>
    </div>
  );
}
