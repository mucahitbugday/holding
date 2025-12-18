'use client';

export default function PageLoader() {
  return (
    <div className="page-loader">
      <div className="page-loader-background"></div>
      
      <div className="page-loader-content">
        {/* Logo/Marka alanı */}
        <div className="page-loader-brand">
          <div className="page-loader-logo">
            <div className="page-loader-logo-text">HOLDING</div>
            <div className="page-loader-logo-subtitle">Şirketi</div>
          </div>
        </div>

        {/* Modern loading spinner */}
        <div className="page-loader-spinner">
          <div className="page-loader-ring page-loader-ring-outer"></div>
          <div className="page-loader-ring page-loader-ring-middle"></div>
          <div className="page-loader-ring page-loader-ring-inner"></div>
          <div className="page-loader-center"></div>
        </div>

        {/* Loading metni */}
        <div className="page-loader-text">
          <span className="page-loader-text-main">Yükleniyor</span>
          <div className="page-loader-dots">
            <span className="page-loader-dot"></span>
            <span className="page-loader-dot"></span>
            <span className="page-loader-dot"></span>
          </div>
        </div>

        {/* Progress bar */}
        <div className="page-loader-progress">
          <div className="page-loader-progress-bar"></div>
        </div>
      </div>
    </div>
  );
}
