'use client';

import React from 'react';

interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string;
  error?: boolean;
  errorMessage?: string;
}

export default function Checkbox({
  label,
  error = false,
  errorMessage,
  style,
  ...props
}: CheckboxProps) {
  return (
    <div style={{ width: '100%' }}>
      <label
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          cursor: 'pointer',
        }}
      >
        <input
          type="checkbox"
          style={{
            width: '1rem',
            height: '1rem',
            borderRadius: '0.25rem',
            border: `2px solid ${error ? '#dc2626' : '#d1d5db'}`,
            cursor: 'pointer',
            transition: 'all 0.2s',
            ...style,
          }}
          {...props}
        />
        {label && (
          <span
            style={{
              fontSize: '0.875rem',
              fontWeight: 500,
              color: error ? '#dc2626' : '#313131',
            }}
          >
            {label}
          </span>
        )}
      </label>
      {error && errorMessage && (
        <p style={{ marginTop: '0.375rem', fontSize: '0.75rem', color: '#dc2626' }}>
          {errorMessage}
        </p>
      )}
    </div>
  );
}
