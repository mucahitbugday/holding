'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { apiClient } from '@/lib/api-client';

export default function AdminPage() {
  const router = useRouter();

  useEffect(() => {
    const token = apiClient.getToken();
    
    if (token) {
      // Token varsa dashboard'a yönlendir
      router.push('/admin/dashboard');
    } else {
      // Token yoksa login sayfasına yönlendir
      router.push('/admin/login');
    }
  }, [router]);

  // Yönlendirme yapılırken loading göster
  return (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #313131 0%, #414141 100%)'
    }}>
      <div style={{ 
        color: 'white', 
        fontSize: '1.25rem',
        textAlign: 'center'
      }}>
        Yönlendiriliyor...
      </div>
    </div>
  );
}
