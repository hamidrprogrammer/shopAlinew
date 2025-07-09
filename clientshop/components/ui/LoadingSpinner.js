'use client';

import React from 'react';
import { Loader2 } from 'lucide-react';
import { twMerge } from 'tailwind-merge';

const LoadingSpinner = ({ size = 'default', className, ...props }) => {
  const sizeClasses = {
    sm: 'h-4 w-4',
    default: 'h-6 w-6',
    lg: 'h-8 w-8',
    xl: 'h-12 w-12',
  };

  return (
    <Loader2
      className={twMerge('animate-spin text-light-primary dark:text-dark-primary', sizeClasses[size] || sizeClasses.default, className)}
      {...props}
    />
  );
};

export { LoadingSpinner };
