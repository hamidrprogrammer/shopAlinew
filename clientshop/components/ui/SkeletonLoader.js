'use client';

import React from 'react';
import { twMerge } from 'tailwind-merge';

const SkeletonLoader = ({
  className,
  count = 1, // Number of skeleton lines or blocks
  height = 'h-4', // Default height, can be like 'h-4', 'h-20', etc.
  width = 'w-full', // Default width
  variant = 'text', // 'text', 'rect', 'circle'
  circleSize, // e.g., 'h-10 w-10' if variant is 'circle'
  containerClassName = '', // For styling the container of multiple skeleton items
}) => {
  const baseClass = 'animate-pulse bg-light-secondary/50 dark:bg-dark-secondary/50';

  let variantClass = '';
  if (variant === 'circle') {
    variantClass = `rounded-full ${circleSize || 'h-10 w-10'}`;
  } else if (variant === 'rect') {
    variantClass = 'rounded-md'; // Or just rely on height/width for shape
  } else { // 'text' or default
    variantClass = 'rounded'; // Text lines are usually slightly rounded
  }

  const skeletons = Array(count)
    .fill(null)
    .map((_, index) => (
      <div
        key={index}
        className={twMerge(
          baseClass,
          variantClass,
          height, // Height is applied per skeleton item
          width,  // Width is applied per skeleton item
          className // className from props is applied per skeleton item
        )}
      />
    ));

  if (count > 1) {
    return (
      <div className={twMerge('space-y-2', containerClassName)}>
        {skeletons}
      </div>
    );
  }

  return skeletons[0]; // Return single element if count is 1
};

export { SkeletonLoader };
