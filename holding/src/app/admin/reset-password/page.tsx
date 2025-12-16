'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { apiClient } from '@/lib/api-client';
import Link from 'next/link';
import LoadingScreen from '@/components/LoadingScreen';

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const emailParam = searchParams.get('email');
    if (emailParam) {
      setEmail(emailParam);
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (newPassword !== confirmPassword) {
      setError('Şifreler eşleşmiyor');
      return;
    }

    if (newPassword.length < 6) {
      setError('Şifre en az 6 karakter olmalıdır');
      return;
    }

    setLoading(true);

    try {
      const response = await apiClient.resetPassword(email, code, newPassword);
      if (response.success) {
        setSuccess(true);
        setTimeout(() => {
          router.push('/admin/login');
        }, 2000);
      }
    } catch (err: any) {
      setError(err.message || 'Bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #313131 0%, #414141 100%)' }}>
      <div style={{ background: 'white', padding: '2rem', borderRadius: '10px', boxShadow: '0 10px 25px rgba(0,0,0,0.2)', width: '100%', maxWidth: '400px' }}>
        <h1 style={{ fontSize: '2rem', marginBottom: '1.5rem', textAlign: 'center', color: '#313131' }}>
          Şifre Sıfırla
        </h1>
        
        {error && (
          <div style={{ background: '#fee', color: '#c33', padding: '1rem', borderRadius: '5px', marginBottom: '1rem' }}>
            {error}
          </div>
        )}

        {success && (
          <div style={{ background: '#efe', color: '#3c3', padding: '1rem', borderRadius: '5px', marginBottom: '1rem' }}>
            Şifre başarıyla sıfırlandı. Giriş sayfasına yönlendiriliyorsunuz...
          </div>
        )}

        {!success && (
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                style={{ width: '100%', padding: '0.75rem', border: '2px solid #e2e8f0', borderRadius: '5px', fontSize: '1rem' }}
              />
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                Doğrulama Kodu
              </label>
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                required
                maxLength={6}
                placeholder="6 haneli kod"
                style={{ width: '100%', padding: '0.75rem', border: '2px solid #e2e8f0', borderRadius: '5px', fontSize: '1rem', letterSpacing: '0.5rem', textAlign: 'center' }}
              />
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                Yeni Şifre
              </label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                minLength={6}
                style={{ width: '100%', padding: '0.75rem', border: '2px solid #e2e8f0', borderRadius: '5px', fontSize: '1rem' }}
              />
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                Yeni Şifre (Tekrar)
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={6}
                style={{ width: '100%', padding: '0.75rem', border: '2px solid #e2e8f0', borderRadius: '5px', fontSize: '1rem' }}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                padding: '0.75rem',
                background: '#313131',
                color: 'white',
                border: 'none',
                borderRadius: '5px',
                fontSize: '1rem',
                fontWeight: '600',
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.6 : 1,
              }}
            >
              {loading ? 'Sıfırlanıyor...' : 'Şifreyi Sıfırla'}
            </button>
          </form>
        )}

        <div style={{ marginTop: '1rem', textAlign: 'center' }}>
          <Link href="/admin/login" style={{ color: '#313131', textDecoration: 'none' }}>
            ← Giriş Sayfasına Dön
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function ResetPassword() {
  return (
    <Suspense fallback={<LoadingScreen />}>
      <ResetPasswordForm />
    </Suspense>
  );
}
