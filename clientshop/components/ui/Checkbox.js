'use client';

import React from 'react';
import { Check } from 'lucide-react';
import { twMerge } from 'tailwind-merge';

const Checkbox = React.forwardRef(
  ({ className, id, label, hasError, disabled, ...props }, ref) => {
    const uniqueId = id || React.useId();

    const peerFocusVisibleClasses =
      'peer-focus-visible:ring-2 peer-focus-visible:ring-light-primary dark:peer-focus-visible:ring-dark-primary peer-focus-visible:ring-offset-2 dark:peer-focus-visible:ring-offset-dark-background';

    const errorClasses =
      hasError ? 'border-red-500 dark:border-red-600 data-[state=checked]:bg-red-500 dark:data-[state=checked]:bg-red-600' : 'border-light-text-secondary/80 dark:border-dark-text-secondary/80 data-[state=checked]:bg-light-primary dark:data-[state=checked]:bg-dark-primary data-[state=checked]:border-light-primary dark:data-[state=checked]:border-dark-primary';

    const disabledClasses =
      disabled ? 'disabled:cursor-not-allowed disabled:opacity-50 peer-disabled:cursor-not-allowed peer-disabled:opacity-70' : '';

    return (
      <div className={twMerge('flex items-center space-x-2 space-x-reverse', disabledClasses, className)}>
        <button
          type="button" // Important for not submitting forms if inside one
          role="checkbox"
          aria-checked={props.checked || props['data-state'] === 'checked'}
          data-state={props.checked || props['data-state'] === 'checked' ? 'checked' : 'unchecked'}
          disabled={disabled}
          ref={ref}
          id={uniqueId}
          className={twMerge(
            'peer h-4 w-4 shrink-0 rounded-sm border flex items-center justify-center transition-colors',
            'ring-offset-light-background dark:ring-offset-dark-background',
            peerFocusVisibleClasses,
            errorClasses,
            'data-[state=checked]:text-dark-text dark:data-[state=checked]:text-light-text' // Checkmark color
          )}
          {...props} // onClick, value, etc. should be passed here
        >
          {/* We use a motion div or just conditional rendering for the checkmark for simplicity here */}
          {(props.checked || props['data-state'] === 'checked') && (
            <Check className="h-3.5 w-3.5" strokeWidth={3} />
          )}
        </button>
        {label && (
          <label
            htmlFor={uniqueId}
            className="text-sm font-medium text-light-text dark:text-dark-text leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            {label}
          </label>
        )}
      </div>
    );
  }
);
Checkbox.displayName = 'Checkbox';

// Note: This is a basic custom checkbox. For production apps, especially for accessibility,
// using a headless UI library component like @radix-ui/react-checkbox is recommended as a base.
// This component tries to mimic some of the data-state attributes for styling.
// It expects `checked` and `onCheckedChange` (passed via ...props) to be handled by the parent.

export { Checkbox };
