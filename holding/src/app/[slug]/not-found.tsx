import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function NotFound() {
  return (
    <>
      <Header />
      <main style={{ minHeight: '60vh', padding: '4rem 0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="container" style={{ textAlign: 'center' }}>
          <h1 style={{ fontSize: '4rem', marginBottom: '1rem', color: '#313131' }}>404</h1>
          <h2 style={{ fontSize: '2rem', marginBottom: '1rem', color: '#666' }}>Sayfa Bulunamadı</h2>
          <p style={{ fontSize: '1.2rem', color: '#999', marginBottom: '2rem' }}>
            Aradığınız sayfa mevcut değil veya kaldırılmış olabilir.
          </p>
          <Link 
            href="/"
            style={{
              display: 'inline-block',
              background: 'linear-gradient(135deg, #313131 0%, #414141 100%)',
              color: 'white',
              padding: '0.75rem 2rem',
              borderRadius: '8px',
              textDecoration: 'none',
              fontWeight: '600',
              transition: 'transform 0.2s'
            }}
          >
            Ana Sayfaya Dön
          </Link>
        </div>
      </main>
      <Footer />
    </>
  );
}
