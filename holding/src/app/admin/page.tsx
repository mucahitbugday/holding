'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { apiClient } from '@/lib/api-client';
import LoadingScreen from '@/components/LoadingScreen';

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
  return <LoadingScreen />;
}
