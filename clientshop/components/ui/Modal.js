'use client';

import React, { useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { Button } from './Button'; // Assuming Button component is in the same directory

const Modal = ({
  isOpen,
  onClose,
  title,
  children,
  footerContent, // Optional: ReactNode for custom footer buttons or content
  size = 'md', // sm, md, lg, xl, full
  closeOnOverlayClick = true,
  closeOnEscape = true,
  showCloseButton = true,
  titleClassName = '',
  contentClassName = '',
  dialogClassName = '', // For styling the dialog panel itself
}) => {
  const handleEscapeKey = useCallback(
    (event) => {
      if (event.key === 'Escape' && closeOnEscape) {
        onClose();
      }
    },
    [onClose, closeOnEscape]
  );

  useEffect(() => {
    if (isOpen && closeOnEscape) {
      document.addEventListener('keydown', handleEscapeKey);
    }
    return () => {
      document.removeEventListener('keydown', handleEscapeKey);
    };
  }, [isOpen, handleEscapeKey, closeOnEscape]);

  const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
    '3xl': 'max-w-3xl',
    '4xl': 'max-w-4xl',
    full: 'max-w-full h-full',
  };

  if (!isOpen) {
    return null;
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[999] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
          onClick={closeOnOverlayClick ? onClose : undefined}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 10 }}
            transition={{ duration: 0.2, ease: "circOut" }}
            className={`relative bg-light-background dark:bg-dark-background rounded-lg shadow-xl flex flex-col w-full ${sizeClasses[size] || sizeClasses.md} ${dialogClassName} max-h-[90vh]`}
            onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside modal content
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-light-border dark:border-dark-border">
              {title && (
                <h3 className={`text-lg font-semibold text-light-text dark:text-dark-text ${titleClassName}`}>
                  {title}
                </h3>
              )}
              {showCloseButton && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onClose}
                  className="text-light-text-secondary dark:text-dark-text-secondary hover:bg-light-secondary/50 dark:hover:bg-dark-secondary/50"
                  aria-label="Close modal"
                >
                  <X className="h-5 w-5" />
                </Button>
              )}
            </div>

            {/* Content */}
            <div className={`p-4 sm:p-6 overflow-y-auto flex-grow ${contentClassName}`}>
              {children}
            </div>

            {/* Footer */}
            {footerContent && (
              <div className="flex items-center justify-end p-4 border-t border-light-border dark:border-dark-border space-x-2 space-x-reverse">
                {footerContent}
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export { Modal };
