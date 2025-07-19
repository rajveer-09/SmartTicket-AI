
import React from 'react';

const Spinner: React.FC<{ size?: 'sm' | 'md' | 'lg' }> = ({ size = 'md' }) => {
  const sizeClasses = {
    sm: 'h-6 w-6',
    md: 'h-12 w-12',
    lg: 'h-24 w-24',
  };

  return (
    <div className={`animate-spin rounded-full border-4 border-slate-700 border-t-sky-500 ${sizeClasses[size]}`}></div>
  );
};

export default Spinner;
