'use client';

import { useEffect, useState } from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  size?: 'small' | 'medium' | 'large' | 'xlarge';
}

export default function Modal({ isOpen, onClose, title, children, footer, size = 'medium' }: ModalProps) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
      setIsFullscreen(false);
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const sizeClasses = {
    small: 'max-w-md',
    medium: 'max-w-2xl',
    large: 'max-w-4xl',
    xlarge: 'max-w-6xl',
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: isFullscreen ? 'white' : 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: isFullscreen ? 'stretch' : 'center',
        justifyContent: 'center',
        zIndex: 10000,
        padding: isFullscreen ? '0' : '1rem',
      }}
      onClick={onClose}
    >
      <div
        className={isFullscreen ? '' : sizeClasses[size]}
        style={{
          backgroundColor: 'white',
          borderRadius: isFullscreen ? '0' : '8px',
          width: isFullscreen ? '100%' : '100%',
          height: isFullscreen ? '100%' : 'auto',
          maxHeight: isFullscreen ? '100%' : '95vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: isFullscreen ? 'none' : '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Sabit Header */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '16px 20px',
            borderBottom: '1px solid #e5e7eb',
            backgroundColor: '#ffffff',
            flexShrink: 0,
          }}
        >
          <h2 style={{ 
            fontSize: '18px', 
            fontWeight: '600', 
            color: '#1f2937', 
            margin: 0,
            letterSpacing: '-0.3px'
          }}>
            {title}
          </h2>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              style={{
                background: 'transparent',
                border: 'none',
                fontSize: '16px',
                color: '#6b7280',
                cursor: 'pointer',
                padding: '4px 8px',
                borderRadius: '4px',
                transition: 'all 0.15s',
                lineHeight: '1',
                width: '28px',
                height: '28px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#f3f4f6';
                e.currentTarget.style.color = '#1f2937';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.color = '#6b7280';
              }}
              title={isFullscreen ? 'Küçült' : 'Tam Ekran'}
            >
              {isFullscreen ? '⤓' : '⤢'}
            </button>
            <button
              onClick={onClose}
              style={{
                background: 'transparent',
                border: 'none',
                fontSize: '20px',
                color: '#6b7280',
                cursor: 'pointer',
                padding: '4px 8px',
                borderRadius: '4px',
                transition: 'all 0.15s',
                lineHeight: '1',
                width: '28px',
                height: '28px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#f3f4f6';
                e.currentTarget.style.color = '#1f2937';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.color = '#6b7280';
              }}
            >
              ×
            </button>
          </div>
        </div>
        
        {/* Scroll İçerik Alanı */}
        <div 
          style={{ 
            padding: isFullscreen ? '24px' : '20px',
            overflowY: 'auto',
            flex: 1,
            minHeight: 0,
          }}
        >
          <style>{`
            ::-webkit-scrollbar {
              width: 6px;
            }
            ::-webkit-scrollbar-track {
              background: #f9fafb;
            }
            ::-webkit-scrollbar-thumb {
              background: #d1d5db;
              border-radius: 3px;
            }
            ::-webkit-scrollbar-thumb:hover {
              background: #9ca3af;
            }
          `}</style>
          {children}
        </div>
        
        {/* Sabit Footer */}
        {footer && (
          <div
            style={{
              padding: '16px 20px',
              borderTop: '1px solid #e5e7eb',
              backgroundColor: '#ffffff',
              flexShrink: 0,
            }}
          >
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
