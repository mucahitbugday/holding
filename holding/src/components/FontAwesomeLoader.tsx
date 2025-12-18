'use client';

import { useEffect } from 'react';

export default function FontAwesomeLoader() {
  useEffect(() => {
    // Font Awesome'u async yükle
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css';
    link.media = 'print';
    link.onload = () => {
      if (link.media !== 'all') {
        link.media = 'all';
      }
      
      // Inject font-display: swap override for FontAwesome fonts
      const style = document.createElement('style');
      style.id = 'fontawesome-font-display-override';
      style.textContent = `
        @font-face {
          font-family: 'Font Awesome 6 Free';
          font-style: normal;
          font-weight: 900;
          font-display: swap;
          src: url('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/webfonts/fa-solid-900.woff2') format('woff2');
        }
        @font-face {
          font-family: 'Font Awesome 6 Brands';
          font-style: normal;
          font-weight: 400;
          font-display: swap;
          src: url('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/webfonts/fa-brands-400.woff2') format('woff2');
        }
        @font-face {
          font-family: 'Font Awesome 6 Regular';
          font-style: normal;
          font-weight: 400;
          font-display: swap;
          src: url('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/webfonts/fa-regular-400.woff2') format('woff2');
        }
      `;
      document.head.appendChild(style);
    };
    document.head.appendChild(link);

    return () => {
      // Cleanup
      const existingLink = document.querySelector('link[href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css"]');
      if (existingLink) {
        existingLink.remove();
      }
      const existingStyle = document.getElementById('fontawesome-font-display-override');
      if (existingStyle) {
        existingStyle.remove();
      }
    };
  }, []);

  return null;
}
