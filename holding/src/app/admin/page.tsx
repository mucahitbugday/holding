'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiClient } from '@/lib/api-client';
import LoadingScreen from '@/components/LoadingScreen';

export default function AdminPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const token = apiClient.getToken();
    
    if (token) {
      // Token varsa dashboard'a yönlendir
      router.push('/admin/dashboard');
    } else {
      // Token yoksa login sayfasına yönlendir
      router.push('/admin/login');
    }
  }, [router]);

  // Hydration tamamlanana kadar veya yönlendirme yapılırken loading göster
  if (!mounted) {
    return null;
  }

  return <LoadingScreen />;
}
