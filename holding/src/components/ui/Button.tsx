'use client';

import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'success' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  children: React.ReactNode;
}

export default function Button({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  children,
  style,
  disabled,
  ...props
}: ButtonProps) {
  const getVariantStyles = () => {
    switch (variant) {
      case 'primary':
        return {
          background: '#313131',
          color: 'white',
          border: 'none',
        };
      case 'secondary':
        return {
          background: '#414141',
          color: 'white',
          border: 'none',
        };
      case 'danger':
        return {
          background: '#dc2626',
          color: 'white',
          border: 'none',
        };
      case 'success':
        return {
          background: '#10b981',
          color: 'white',
          border: 'none',
        };
      case 'outline':
        return {
          background: 'transparent',
          color: '#313131',
          border: '2px solid #313131',
        };
      case 'ghost':
        return {
          background: 'transparent',
          color: '#313131',
          border: 'none',
        };
      default:
        return {
          background: '#313131',
          color: 'white',
          border: 'none',
        };
    }
  };

  const getSizeStyles = () => {
    switch (size) {
      case 'sm':
        return { padding: '0.375rem 0.75rem', fontSize: '0.875rem' };
      case 'md':
        return { padding: '0.5rem 1rem', fontSize: '0.875rem' };
      case 'lg':
        return { padding: '0.75rem 1.5rem', fontSize: '1rem' };
      default:
        return { padding: '0.5rem 1rem', fontSize: '0.875rem' };
    }
  };

  const baseStyle: React.CSSProperties = {
    fontWeight: 500,
    borderRadius: '0.5rem',
    cursor: (disabled || isLoading) ? 'not-allowed' : 'pointer',
    transition: 'all 0.2s',
    opacity: (disabled || isLoading) ? 0.6 : 1,
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.5rem',
    ...getVariantStyles(),
    ...getSizeStyles(),
    ...style,
  };

  const handleMouseEnter = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (disabled || isLoading) return;
    const button = e.currentTarget;
    if (variant === 'primary') {
      button.style.background = '#414141';
    } else if (variant === 'secondary') {
      button.style.background = '#313131';
    } else if (variant === 'danger') {
      button.style.background = '#b91c1c';
    } else if (variant === 'success') {
      button.style.background = '#059669';
    } else if (variant === 'outline') {
      button.style.background = '#313131';
      button.style.color = 'white';
    } else if (variant === 'ghost') {
      button.style.background = '#f3f4f6';
    }
  };

  const handleMouseLeave = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (disabled || isLoading) return;
    const button = e.currentTarget;
    const variantStyles = getVariantStyles();
    button.style.background = variantStyles.background as string;
    button.style.color = variantStyles.color as string;
  };

  return (
    <button
      style={baseStyle}
      disabled={disabled || isLoading}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      {...props}
    >
      {isLoading ? (
        <>
          <svg
            style={{
              width: '16px',
              height: '16px',
              animation: 'spin 1s linear infinite',
            }}
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              style={{ opacity: 0.25 }}
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              style={{ opacity: 0.75 }}
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
          Yükleniyor...
        </>
      ) : (
        children
      )}
    </button>
  );
}
