'use client';

import React from 'react';
import * as RadioGroupPrimitive from '@radix-ui/react-radio-group';
import { Circle } from 'lucide-react'; // Or a custom dot/circle for the indicator
import { twMerge } from 'tailwind-merge';

const RadioGroup = React.forwardRef(
  ({ className, ...props }, ref) => {
    return (
      <RadioGroupPrimitive.Root
        className={twMerge('grid gap-2', className)}
        {...props}
        ref={ref}
      />
    );
  }
);
RadioGroup.displayName = RadioGroupPrimitive.Root.displayName;

const RadioGroupItem = React.forwardRef(
  ({ className, children, id, ...props }, ref) => {
    const uniqueId = id || React.useId();
    return (
      <div className="flex items-center space-x-2 space-x-reverse">
        <RadioGroupPrimitive.Item
          ref={ref}
          id={uniqueId}
          className={twMerge(
            'aspect-square h-4 w-4 rounded-full border border-light-text-secondary/80 dark:border-dark-text-secondary/80 text-light-primary dark:text-dark-primary ring-offset-light-background dark:ring-offset-dark-background focus:outline-none focus-visible:ring-2 focus-visible:ring-light-primary dark:focus-visible:ring-dark-primary focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
            // Custom styling for the checked state if needed, beyond the indicator
            // 'data-[state=checked]:bg-primary data-[state=checked]:border-primary',
            className
          )}
          {...props}
        >
          <RadioGroupPrimitive.Indicator className="flex items-center justify-center">
            {/* Using a smaller filled circle as the indicator */}
            <Circle className="h-2.5 w-2.5 fill-current text-current" />
          </RadioGroupPrimitive.Indicator>
        </RadioGroupPrimitive.Item>
        {children && ( // Typically label is passed as children here
          <label
            htmlFor={uniqueId}
            className="text-sm font-medium text-light-text dark:text-dark-text leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            {children}
          </label>
        )}
      </div>
    );
  }
);
RadioGroupItem.displayName = RadioGroupPrimitive.Item.displayName;

// Usage example:
// <RadioGroup defaultValue="option-one">
//   <RadioGroupItem value="option-one" id="r1">
//     Option One
//   </RadioGroupItem>
//   <RadioGroupItem value="option-two" id="r2">
//     Option Two
//   </RadioGroupItem>
// </RadioGroup>

export { RadioGroup, RadioGroupItem };
