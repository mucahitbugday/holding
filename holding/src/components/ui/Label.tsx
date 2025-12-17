'use client';

import React from 'react';

interface LabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
  required?: boolean;
  children: React.ReactNode;
}

export default function Label({
  required = false,
  children,
  style,
  ...props
}: LabelProps) {
  return (
    <label
      style={{
        display: 'block',
        marginBottom: '0.5rem',
        fontSize: '0.875rem',
        fontWeight: 600,
        color: '#313131',
        ...style,
      }}
      {...props}
    >
      {children}
      {required && <span style={{ color: '#dc2626', marginLeft: '0.25rem' }}>*</span>}
    </label>
  );
}
