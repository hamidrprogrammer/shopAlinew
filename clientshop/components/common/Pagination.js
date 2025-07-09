'use client';

import React from 'react';
import { ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react';
import { Button } from '../ui/Button'; // Assuming your Button component
import { twMerge } from 'tailwind-merge';
import { useTranslations } from 'next-intl';

const Pagination = ({
  currentPage,
  totalPages,
  onPageChange, // (page: number) => void
  siblings = 1, // Number of page links to show on each side of the current page
  className,
}) => {
  const t = useTranslations('Pagination');

  // Generate page numbers with ellipsis
  const generatePageNumbers = () => {
    const pageNumbers = [];
    const totalPageNumbersToShow = siblings * 2 + 3; // current + 2*siblings + first + last + 2*ellipsis
    const totalNumberedPagesToShow = siblings * 2 + 1; // current + 2*siblings

    if (totalPages <= totalPageNumbersToShow) {
      // Show all pages if total is small enough
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
      }
    } else {
      // Left ellipsis logic
      const leftSiblingIndex = Math.max(currentPage - siblings, 1);
      const rightSiblingIndex = Math.min(currentPage + siblings, totalPages);

      const shouldShowLeftEllipsis = leftSiblingIndex > 2;
      const shouldShowRightEllipsis = rightSiblingIndex < totalPages - 1;

      if (!shouldShowLeftEllipsis && shouldShowRightEllipsis) {
        // No left ellipsis, but right ellipsis: 1, 2, ..., current, ..., last
        for (let i = 1; i < 1 + totalNumberedPagesToShow -1 ; i++) { // -1 because no right ellipsis yet
             if(i <= totalPages) pageNumbers.push(i);
        }
        pageNumbers.push('...');
        pageNumbers.push(totalPages);
      } else if (shouldShowLeftEllipsis && !shouldShowRightEllipsis) {
        // Left ellipsis, but no right ellipsis: 1, ..., current, ..., last-1, last
        pageNumbers.push(1);
        pageNumbers.push('...');
        for (let i = totalPages - (totalNumberedPagesToShow -1 -1) +1 ; i <= totalPages; i++) { // -1 for first, -1 for ellipsis
             if(i > 0) pageNumbers.push(i);
        }
      } else if (shouldShowLeftEllipsis && shouldShowRightEllipsis) {
        // Both ellipsis: 1, ..., current-s, current, current+s, ..., last
        pageNumbers.push(1);
        pageNumbers.push('...');
        for (let i = leftSiblingIndex; i <= rightSiblingIndex; i++) {
          pageNumbers.push(i);
        }
        pageNumbers.push('...');
        pageNumbers.push(totalPages);
      } else {
         // Default to showing pages around current, should ideally not be hit if totalPages > totalPageNumbersToShow
        for (let i = 1; i <= totalPages; i++) {
            pageNumbers.push(i);
        }
      }
    }
    return pageNumbers;
  };

  const pageNumbers = generatePageNumbers();

  if (totalPages <= 1) {
    return null; // Don't render pagination if only one page or less
  }

  return (
    <nav aria-label={t('navigationLabel')} className={twMerge('flex items-center justify-center space-x-2 rtl:space-x-reverse', className)}>
      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        aria-label={t('previousPage')}
      >
        <ChevronLeft className="h-4 w-4" />
        <span className="sr-only sm:not-sr-only ml-1 rtl:mr-1">{t('previous')}</span>
      </Button>

      {pageNumbers.map((page, index) =>
        page === '...' ? (
          <span key={`ellipsis-${index}`} className="px-1.5 py-1.5 text-sm text-light-text-secondary dark:text-dark-text-secondary">
            <MoreHorizontal className="h-5 w-5" />
          </span>
        ) : (
          <Button
            key={page}
            variant={currentPage === page ? 'default' : 'outline'}
            size="sm"
            onClick={() => onPageChange(page)}
            aria-current={currentPage === page ? 'page' : undefined}
            aria-label={`${t('goToPage')} ${page}`}
            className="w-9 h-9 p-0" // Fixed size for page number buttons
          >
            {page}
          </Button>
        )
      )}

      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        aria-label={t('nextPage')}
      >
        <span className="sr-only sm:not-sr-only mr-1 rtl:ml-1">{t('next')}</span>
        <ChevronRight className="h-4 w-4" />
      </Button>
    </nav>
  );
};

export default Pagination;
