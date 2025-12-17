'use client';

import React from 'react';

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: boolean;
  errorMessage?: string;
  helperText?: string;
  options: { value: string; label: string }[];
}

export default function Select({
  label,
  error = false,
  errorMessage,
  helperText,
  options,
  style,
  required,
  ...props
}: SelectProps) {
  const selectStyle: React.CSSProperties = {
    width: '100%',
    padding: '0.625rem 0.75rem',
    fontSize: '0.875rem',
    border: `2px solid ${error ? '#dc2626' : '#e5e7eb'}`,
    borderRadius: '0.5rem',
    transition: 'all 0.2s',
    cursor: 'pointer',
    ...style,
  };

  const handleFocus = (e: React.FocusEvent<HTMLSelectElement>) => {
    e.currentTarget.style.borderColor = error ? '#dc2626' : '#313131';
    e.currentTarget.style.outline = 'none';
    e.currentTarget.style.boxShadow = `0 0 0 3px ${error ? 'rgba(220, 38, 38, 0.1)' : 'rgba(49, 49, 49, 0.1)'}`;
  };

  const handleBlur = (e: React.FocusEvent<HTMLSelectElement>) => {
    e.currentTarget.style.borderColor = error ? '#dc2626' : '#e5e7eb';
    e.currentTarget.style.boxShadow = 'none';
  };

  return (
    <div style={{ width: '100%' }}>
      {label && (
        <label
          style={{
            display: 'block',
            marginBottom: '0.5rem',
            fontSize: '0.875rem',
            fontWeight: 600,
            color: '#313131',
          }}
        >
          {label}
          {required && <span style={{ color: '#dc2626', marginLeft: '0.25rem' }}>*</span>}
        </label>
      )}
      <select
        style={selectStyle}
        onFocus={handleFocus}
        onBlur={handleBlur}
        {...props}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error && errorMessage && (
        <p style={{ marginTop: '0.375rem', fontSize: '0.75rem', color: '#dc2626' }}>
          {errorMessage}
        </p>
      )}
      {!error && helperText && (
        <p style={{ marginTop: '0.375rem', fontSize: '0.75rem', color: '#6b7280' }}>
          {helperText}
        </p>
      )}
    </div>
  );
}
