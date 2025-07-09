'use client';

import React from 'react';
import { twMerge } from 'tailwind-merge';

const Textarea = React.forwardRef(
  ({ className, variant, hasError, rows = 3, ...props }, ref) => {
    const baseClasses =
      'flex w-full rounded-md border-0 bg-light-secondary dark:bg-dark-secondary px-3 py-2 text-sm ring-offset-light-background dark:ring-offset-dark-background placeholder:text-light-text-secondary/70 dark:placeholder:text-dark-text-secondary/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-light-primary dark:focus-visible:ring-dark-primary focus-visible:ring-offset-0 disabled:cursor-not-allowed disabled:opacity-50 resize-y min-h-[60px]'; // Added resize-y and min-h

    const errorClasses =
      hasError ? 'ring-2 ring-red-500 dark:ring-red-600 focus-visible:ring-red-500 dark:focus-visible:ring-red-600' : '';

    // Variant specific classes (can be expanded)
    let variantClasses = '';
    switch (variant) {
      case 'ghost':
        variantClasses = 'bg-transparent dark:bg-transparent hover:bg-light-secondary/50 dark:hover:bg-dark-secondary/50 focus-visible:bg-transparent dark:focus-visible:bg-transparent';
        break;
      default:
        break;
    }

    return (
      <textarea
        className={twMerge(baseClasses, errorClasses, variantClasses, className)}
        ref={ref}
        rows={rows}
        {...props}
      />
    );
  }
);
Textarea.displayName = 'Textarea';

export { Textarea };
