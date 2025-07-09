'use client';

import React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva } from 'class-variance-authority';
import { Loader2 } from 'lucide-react';
import { twMerge } from 'tailwind-merge';

// Define button variants using cva
const buttonVariants = cva(
  // Base classes applied to all buttons
  'inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-light-background dark:ring-offset-dark-background transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-light-primary dark:focus-visible:ring-dark-primary focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-60',
  {
    variants: {
      variant: {
        default:
          'bg-light-primary text-dark-text hover:bg-light-primary-hover dark:bg-dark-primary dark:text-light-text dark:hover:bg-dark-primary-hover shadow-sm',
        destructive:
          'bg-red-500 text-white hover:bg-red-600 dark:bg-red-700 dark:text-white dark:hover:bg-red-600 shadow-sm',
        outline:
          'border border-light-border dark:border-dark-border bg-transparent hover:bg-light-secondary/70 dark:hover:bg-dark-secondary/70 hover:text-light-text dark:hover:text-dark-text',
        secondary:
          'bg-light-secondary text-light-text dark:bg-dark-secondary dark:text-dark-text hover:bg-light-secondary/80 dark:hover:bg-dark-secondary/80 shadow-sm',
        ghost:
          'hover:bg-light-secondary/70 dark:hover:bg-dark-secondary/70 hover:text-light-text dark:hover:text-dark-text',
        link: 'text-light-primary dark:text-dark-primary underline-offset-4 hover:underline focus-visible:ring-0 focus-visible:ring-offset-0', // No ring for link variant usually
      },
      size: {
        default: 'h-10 px-4 py-2',
        sm: 'h-9 rounded-md px-3',
        lg: 'h-11 rounded-md px-8 text-base', // Slightly larger text for lg
        icon: 'h-10 w-10', // For icon-only buttons
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

const Button = React.forwardRef(
  ({ className, variant, size, asChild = false, isLoading = false, children, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';

    // If isLoading, content should be replaced or prepended by loader
    // For this version, Loader2 prepends children if isLoading.
    // Children are not rendered if isLoading and it's an icon button to prevent weird sizing.
    const showChildren = !isLoading || (size === 'icon' && isLoading) ? children : true;


    return (
      <Comp
        className={twMerge(buttonVariants({ variant, size, className }))}
        ref={ref}
        disabled={isLoading || props.disabled}
        {...props}
      >
        {isLoading && <Loader2 className={`h-4 w-4 animate-spin ${children ? 'mr-2' : ''}`} />}
        {/* Render children only if not loading or if it's not an icon button that's loading */}
        {!(isLoading && size === 'icon') && children}
      </Comp>
    );
  }
);
Button.displayName = 'Button';

export { Button, buttonVariants };
