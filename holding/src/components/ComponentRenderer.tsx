'use client';

import { useEffect, useRef, useState } from 'react';

interface ComponentRendererProps {
  html: string;
  css?: string;
  js?: string;
  componentId?: string;
}

export default function ComponentRenderer({ html, css, js, componentId }: ComponentRendererProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [renderKey, setRenderKey] = useState(0);

  useEffect(() => {
    if (!containerRef.current) return;

    // Her render'da temizle
    containerRef.current.innerHTML = '';

    // CSS'i ekle (style tag içinde değilse direkt CSS olarak ekle)
    if (css && css.trim()) {
      const styleId = `component-style-${componentId || 'default'}-${renderKey}`;
      
      // Önceki style'ı temizle
      const existingStyle = document.getElementById(styleId);
      if (existingStyle) {
        existingStyle.remove();
      }
      
      // Yeni style oluştur
      const styleElement = document.createElement('style');
      styleElement.id = styleId;
      
      // CSS içinde <style> tag'i varsa kaldır
      let cleanCss = css.trim();
      if (cleanCss.includes('<style>')) {
        cleanCss = cleanCss.replace(/<style[^>]*>/gi, '').replace(/<\/style>/gi, '');
      }
      
      styleElement.textContent = cleanCss;
      document.head.appendChild(styleElement);
    }

    // HTML'i ekle
    if (html && html.trim()) {
      containerRef.current.innerHTML = html;
    }

    // JavaScript'i çalıştır
    if (js && js.trim()) {
      try {
        // JS içinde <script> tag'i varsa kaldır
        let cleanJs = js.trim();
        if (cleanJs.includes('<script>')) {
          cleanJs = cleanJs.replace(/<script[^>]*>/gi, '').replace(/<\/script>/gi, '');
        }
        
        // Component scope'unda çalıştır
        const scriptFunction = new Function(cleanJs);
        scriptFunction();
      } catch (error) {
        console.error('Component JavaScript hatası:', error);
      }
    }

    // Cleanup
    return () => {
      if (css && css.trim()) {
        const styleId = `component-style-${componentId || 'default'}-${renderKey}`;
        const styleElement = document.getElementById(styleId);
        if (styleElement) {
          styleElement.remove();
        }
      }
    };
  }, [html, css, js, componentId, renderKey]);

  // HTML, CSS veya JS değiştiğinde render key'i güncelle
  useEffect(() => {
    setRenderKey(prev => prev + 1);
  }, [html, css, js]);

  return (
    <div
      ref={containerRef}
      data-component-id={componentId}
      style={{ width: '100%', minHeight: '50px' }}
    />
  );
}

