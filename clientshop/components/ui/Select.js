'use client';

import React from 'react';
import * as SelectPrimitive from '@radix-ui/react-select';
import { Check, ChevronDown, ChevronUp } from 'lucide-react';
import { twMerge } from 'tailwind-merge';
import { cva } from 'class-variance-authority'; // Already planned for Button

// Using cva for potential size variants of the trigger, though not implemented in this example
const selectTriggerVariants = cva(
  'flex h-10 w-full items-center justify-between rounded-md border-0 bg-light-secondary dark:bg-dark-secondary px-3 py-2 text-sm ring-offset-light-background dark:ring-offset-dark-background placeholder:text-light-text-secondary/70 dark:placeholder:text-dark-text-secondary/70 focus:outline-none focus:ring-2 focus:ring-light-primary dark:focus:ring-dark-primary focus:ring-offset-0 disabled:cursor-not-allowed disabled:opacity-50',
  {
    variants: {
      hasError: {
        true: 'ring-2 ring-red-500 dark:ring-red-600 focus:ring-red-500 dark:focus:ring-red-600',
        false: 'border-input', // Assuming border-input or similar is defined or default border is fine
      },
    },
    defaultVariants: {
      hasError: false,
    },
  }
);

const Select = React.forwardRef(
  ({ className, children, hasError, placeholder, ...props }, ref) => (
    <SelectPrimitive.Root {...props}>
      <SelectPrimitive.Trigger
        ref={ref}
        className={twMerge(selectTriggerVariants({ hasError }), className)}
      >
        <SelectPrimitive.Value placeholder={placeholder || "Select an option"} />
        <SelectPrimitive.Icon asChild>
          <ChevronDown className="h-4 w-4 opacity-50" />
        </SelectPrimitive.Icon>
      </SelectPrimitive.Trigger>
      <SelectPrimitive.Portal>
        <SelectPrimitive.Content
          position="popper"
          sideOffset={5}
          className={twMerge(
            'relative z-[9999] min-w-[8rem] overflow-hidden rounded-md border border-light-border dark:border-dark-border bg-light-background dark:bg-dark-background text-light-text dark:text-dark-text shadow-md',
            'data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2',
            // Popper specific styles for width and positioning
            'w-[var(--radix-select-trigger-width)] max-h-[var(--radix-select-content-available-height)]'
          )}
        >
          <SelectPrimitive.ScrollUpButton className="flex cursor-default items-center justify-center py-1">
            <ChevronUp className="h-4 w-4" />
          </SelectPrimitive.ScrollUpButton>
          <SelectPrimitive.Viewport className="p-1">
            {children}
          </SelectPrimitive.Viewport>
          <SelectPrimitive.ScrollDownButton className="flex cursor-default items-center justify-center py-1">
            <ChevronDown className="h-4 w-4" />
          </SelectPrimitive.ScrollDownButton>
        </SelectPrimitive.Content>
      </SelectPrimitive.Portal>
    </SelectPrimitive.Root>
  )
);
Select.displayName = SelectPrimitive.Root.displayName;

const SelectItem = React.forwardRef(
  ({ className, children, ...props }, ref) => (
    <SelectPrimitive.Item
      ref={ref}
      className={twMerge(
        'relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none focus:bg-light-secondary dark:focus:bg-dark-secondary focus:text-light-text dark:focus:text-dark-text data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
        className
      )}
      {...props}
    >
      <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
        <SelectPrimitive.ItemIndicator>
          <Check className="h-4 w-4" />
        </SelectPrimitive.ItemIndicator>
      </span>
      <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
    </SelectPrimitive.Item>
  )
);
SelectItem.displayName = SelectPrimitive.Item.displayName;

const SelectLabel = React.forwardRef(
  ({ className, ...props }, ref) => (
  <SelectPrimitive.Label
    ref={ref}
    className={twMerge('py-1.5 pl-8 pr-2 text-sm font-semibold text-light-text-secondary dark:text-dark-text-secondary', className)}
    {...props}
  />
));
SelectLabel.displayName = SelectPrimitive.Label.displayName;

const SelectSeparator = React.forwardRef(
  ({ className, ...props }, ref) => (
  <SelectPrimitive.Separator
    ref={ref}
    className={twMerge('-mx-1 my-1 h-px bg-light-border dark:bg-dark-border', className)}
    {...props}
  />
));
SelectSeparator.displayName = SelectPrimitive.Separator.displayName;

// Usage Example:
// <Select onValueChange={(value) => console.log(value)} defaultValue="apple">
//   <SelectLabel>Fruits</SelectLabel>
//   <SelectItem value="apple">Apple</SelectItem>
//   <SelectItem value="banana">Banana</SelectItem>
//   <SelectItem value="blueberry">Blueberry</SelectItem>
//   <SelectSeparator />
//   <SelectItem value="grapes">Grapes</SelectItem>
//   <SelectItem value="pineapple">Pineapple</SelectItem>
// </Select>

export { Select, SelectItem, SelectLabel, SelectSeparator };
