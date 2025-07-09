'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { Select, SelectItem, SelectLabel } from '../ui/Select'; // Assuming Select is in ui folder

const Sorting = ({ currentSort, onSortChange, className }) => {
  const t = useTranslations('Sorting'); // Namespace for sorting translations

  const sortOptions = [
    { value: 'default', labelKey: 'default', label: t('options.default') }, // Default (e.g., relevance or manual order)
    { value: 'price-asc', labelKey: 'priceAsc', label: t('options.priceAsc') }, // Price: Low to High
    { value: 'price-desc', labelKey: 'priceDesc', label: t('options.priceDesc') }, // Price: High to Low
    { value: 'name-asc', labelKey: 'nameAsc', label: t('options.nameAsc') }, // Name: A to Z
    { value: 'name-desc', labelKey: 'nameDesc', label: t('options.nameDesc') }, // Name: Z to A
    { value: 'newest', labelKey: 'newest', label: t('options.newest') }, // Newest arrivals
    { value: 'popularity', labelKey: 'popularity', label: t('options.popularity') }, // Popularity / Best Sellers
  ];

  return (
    <div className={`flex items-center space-x-2 rtl:space-x-reverse ${className}`}>
      <label htmlFor="sort-select" className="text-sm text-light-text-secondary dark:text-dark-text-secondary whitespace-nowrap">
        {t('label')}:
      </label>
      <Select
        value={currentSort}
        onValueChange={onSortChange} // This is how Radix Select passes the new value
        // name="sort-select" // Radix Select doesn't use name directly on Root for native form submission
      >
        {/* <SelectLabel>Sort by</SelectLabel> // Optional: if you want a label inside the dropdown */}
        {sortOptions.map(option => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </Select>
    </div>
  );
};

export default Sorting;
