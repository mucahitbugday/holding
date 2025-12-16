'use client';

export default function LoadingScreen() {
  return (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #313131 0%, #414141 100%)',
      width: '100%',
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      zIndex: 9999
    }}>
      <div style={{ 
        textAlign: 'center',
        color: 'white'
      }}>
        <div 
          className="loading-spinner"
          style={{
            width: '60px',
            height: '60px',
            border: '4px solid rgba(255, 255, 255, 0.3)',
            borderTop: '4px solid white',
            borderRadius: '50%',
            margin: '0 auto 1.5rem',
            animation: 'spin 1s linear infinite',
          }}
        ></div>
        <div style={{ 
          fontSize: '1.25rem',
          fontWeight: '500',
          letterSpacing: '0.5px'
        }}>
          Yükleniyor...
        </div>
      </div>
    </div>
  );
}
