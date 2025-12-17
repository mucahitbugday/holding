'use client';

export default function LoadingScreen() {
  return (
    <div style={{ 
      minHeight: '100vh', 
      width: '100vw',
      display: 'flex', 
      flexDirection: 'column',
      alignItems: 'center', 
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 50%, #1a1a1a 100%)',
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      zIndex: 9999,
      overflow: 'hidden'
    }}>
      {/* Arka plan dekoratif elementler */}
      <div style={{
        position: 'absolute',
        width: '100%',
        height: '100%',
        opacity: 0.1,
        background: 'radial-gradient(circle at 20% 50%, rgba(255,255,255,0.1) 0%, transparent 50%), radial-gradient(circle at 80% 80%, rgba(255,255,255,0.1) 0%, transparent 50%)',
        pointerEvents: 'none'
      }}></div>

      {/* Ana içerik */}
      <div style={{ 
        textAlign: 'center',
        color: 'white',
        zIndex: 1,
        position: 'relative',
        padding: '2rem'
      }}>
        {/* Logo/Marka alanı */}
        <div style={{
          marginBottom: '3rem',
          opacity: 0.95
        }}>
          <div style={{
            fontSize: '2.5rem',
            fontWeight: '700',
            letterSpacing: '2px',
            marginBottom: '0.5rem',
            background: 'linear-gradient(135deg, #ffffff 0%, #e0e0e0 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
          }}>
            HOLDING
          </div>
          <div style={{
            fontSize: '0.875rem',
            fontWeight: '300',
            letterSpacing: '4px',
            color: 'rgba(255, 255, 255, 0.6)',
            textTransform: 'uppercase'
          }}>
            Yönetim Sistemi
          </div>
        </div>

        {/* Modern loading spinner */}
        <div style={{
          position: 'relative',
          width: '120px',
          height: '120px',
          margin: '0 auto 3rem'
        }}>
          {/* Dış halka */}
          <div style={{
            position: 'absolute',
            width: '120px',
            height: '120px',
            border: '3px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '50%',
            top: 0,
            left: 0
          }}></div>
          
          {/* Animasyonlu halka */}
          <div style={{
            position: 'absolute',
            width: '120px',
            height: '120px',
            border: '3px solid transparent',
            borderTop: '3px solid #ffffff',
            borderRight: '3px solid rgba(255, 255, 255, 0.5)',
            borderRadius: '50%',
            top: 0,
            left: 0,
            animation: 'spin 1.2s linear infinite'
          }}></div>

          {/* İç halka */}
          <div style={{
            position: 'absolute',
            width: '80px',
            height: '80px',
            border: '2px solid rgba(255, 255, 255, 0.2)',
            borderRadius: '50%',
            top: '20px',
            left: '20px'
          }}></div>

          {/* Merkez nokta */}
          <div style={{
            position: 'absolute',
            width: '12px',
            height: '12px',
            background: '#ffffff',
            borderRadius: '50%',
            top: '54px',
            left: '54px',
            boxShadow: '0 0 20px rgba(255, 255, 255, 0.5)',
            animation: 'pulse 2s ease-in-out infinite'
          }}></div>
        </div>

        {/* Loading metni */}
        <div style={{ 
          fontSize: '1.125rem',
          fontWeight: '400',
          letterSpacing: '1px',
          color: 'rgba(255, 255, 255, 0.9)',
          marginBottom: '0.5rem'
        }}>
          Yükleniyor
        </div>

        {/* Progress dots */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '0.5rem',
          marginTop: '1rem'
        }}>
          <div style={{
            width: '8px',
            height: '8px',
            background: 'rgba(255, 255, 255, 0.6)',
            borderRadius: '50%',
            animation: 'pulse 1.4s ease-in-out infinite',
            animationDelay: '0s'
          }}></div>
          <div style={{
            width: '8px',
            height: '8px',
            background: 'rgba(255, 255, 255, 0.6)',
            borderRadius: '50%',
            animation: 'pulse 1.4s ease-in-out infinite',
            animationDelay: '0.2s'
          }}></div>
          <div style={{
            width: '8px',
            height: '8px',
            background: 'rgba(255, 255, 255, 0.6)',
            borderRadius: '50%',
            animation: 'pulse 1.4s ease-in-out infinite',
            animationDelay: '0.4s'
          }}></div>
        </div>

        {/* Alt bilgi */}
        <div style={{
          marginTop: '4rem',
          fontSize: '0.75rem',
          fontWeight: '300',
          color: 'rgba(255, 255, 255, 0.4)',
          letterSpacing: '1px'
        }}>
          Lütfen bekleyin...
        </div>
      </div>

      {/* Alt dekoratif çizgi */}
      <div style={{
        position: 'absolute',
        bottom: '3rem',
        left: '50%',
        transform: 'translateX(-50%)',
        width: '200px',
        height: '2px',
        background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.3) 50%, transparent 100%)',
        animation: 'pulse 2s ease-in-out infinite'
      }}></div>

    </div>
  );
}
