'use client';

import React from 'react';
import { twMerge } from 'tailwind-merge';

const Input = React.forwardRef(
  ({ className, type, variant, hasError, ...props }, ref) => {
    const baseClasses =
      'flex h-10 w-full rounded-md border-0 bg-light-secondary dark:bg-dark-secondary px-3 py-2 text-sm ring-offset-light-background dark:ring-offset-dark-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-light-text-secondary/70 dark:placeholder:text-dark-text-secondary/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-light-primary dark:focus-visible:ring-dark-primary focus-visible:ring-offset-0 disabled:cursor-not-allowed disabled:opacity-50';

    const errorClasses =
      hasError ? 'ring-2 ring-red-500 dark:ring-red-600 focus-visible:ring-red-500 dark:focus-visible:ring-red-600' : '';

    // Variant specific classes (can be expanded)
    // For now, variant might not change much for a simple input, but the structure is here.
    let variantClasses = '';
    switch (variant) {
      case 'ghost': // Example for a more transparent input
        variantClasses = 'bg-transparent dark:bg-transparent hover:bg-light-secondary/50 dark:hover:bg-dark-secondary/50 focus-visible:bg-transparent dark:focus-visible:bg-transparent';
        break;
      default:
        // Default variant already styled by baseClasses mostly
        break;
    }

    return (
      <input
        type={type}
        className={twMerge(baseClasses, errorClasses, variantClasses, className)}
        ref={ref}
        {...props}
      />
    );
  }
);
Input.displayName = 'Input';

export { Input };
