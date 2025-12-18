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
    };
    document.head.appendChild(link);

    return () => {
      // Cleanup
      const existingLink = document.querySelector('link[href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css"]');
      if (existingLink) {
        existingLink.remove();
      }
    };
  }, []);

  return null;
}
