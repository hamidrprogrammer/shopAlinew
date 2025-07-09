'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Heart, Eye, ShoppingCart } from 'lucide-react';
import { Button } from '../ui/Button'; // Assuming Button component is in ui folder
import { useTranslations } from 'next-intl';
import { twMerge } from 'tailwind-merge';

// Placeholder image if actual product image is missing
const PLACEHOLDER_IMAGE_URL = '/images/placeholder-product.png'; // Ensure this exists in public/images

const ProductCard = ({ product, className }) => {
  // const t = useTranslations('ProductCard'); // For translations like "Add to cart", "Quick View"
  // For now, using static text. Add translations if needed.

  const handleAddToCart = (e) => {
    e.preventDefault(); // Prevent link navigation if button is inside Link
    e.stopPropagation();
    console.log('Add to cart:', product.id);
    // TODO: Implement add to cart logic using Zustand store
  };

  const handleQuickView = (e) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('Quick view:', product.id);
    // TODO: Implement quick view modal logic
  };

  const handleToggleWishlist = (e) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('Toggle wishlist:', product.id);
    // TODO: Implement wishlist logic using Zustand store
  };

  const productUrl = `/products/${product.slug || product.id}`;

  return (
    <Link href={productUrl} className={twMerge("group block overflow-hidden rounded-lg", className)}>
      <div className="relative bg-light-secondary dark:bg-dark-secondary p-4 transition-all duration-300 ease-in-out shadow-neumo-light hover:shadow-neumo-light-inset dark:shadow-neumo-dark dark:hover:shadow-neumo-dark-inset">
        {/* Image Container */}
        <div className="relative aspect-[3/4] w-full overflow-hidden rounded-md mb-3">
          <Image
            src={product.imageUrl || PLACEHOLDER_IMAGE_URL}
            alt={product.name || 'Product Image'}
            fill // Use fill to make image responsive to parent aspect ratio
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" // Example sizes
            className="object-cover transition-transform duration-300 ease-in-out group-hover:scale-105"
            onError={(e) => { e.currentTarget.src = PLACEHOLDER_IMAGE_URL; }} // Fallback to placeholder
          />
          {/* Overlay for actions - appears on hover */}
          <div className="absolute inset-0 bg-black/20 dark:bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 ease-in-out">
            <div className="flex space-x-2">
              <Button
                size="icon"
                variant="secondary"
                onClick={handleAddToCart}
                aria-label="Add to cart"
                className="bg-light-background/80 dark:bg-dark-background/80 hover:bg-light-background dark:hover:bg-dark-background"
              >
                <ShoppingCart className="h-5 w-5" />
              </Button>
              <Button
                size="icon"
                variant="secondary"
                onClick={handleQuickView}
                aria-label="Quick view"
                className="bg-light-background/80 dark:bg-dark-background/80 hover:bg-light-background dark:hover:bg-dark-background"
              >
                <Eye className="h-5 w-5" />
              </Button>
            </div>
          </div>
          {/* Wishlist button positioned top-right */}
          <Button
            size="icon"
            variant="ghost"
            onClick={handleToggleWishlist}
            aria-label="Add to wishlist"
            className="absolute top-2 right-2 bg-light-background/50 dark:bg-dark-background/50 hover:bg-light-background/80 dark:hover:bg-dark-background/80 text-light-primary dark:text-dark-primary"
          >
            {/* TODO: Change icon based on wishlist state */}
            <Heart className="h-5 w-5" />
          </Button>
        </div>

        {/* Product Info */}
        <div>
          <h3 className="text-sm font-medium text-light-text dark:text-dark-text truncate" title={product.name}>
            {product.name || 'Unnamed Product'}
          </h3>
          {/* Optional: Short description or category */}
          {/* <p className="text-xs text-light-text-secondary dark:text-dark-text-secondary mt-0.5 truncate">
            {product.category || 'Furniture'}
          </p> */}
          <p className="mt-1 text-md font-semibold text-light-text dark:text-dark-text">
            ${product.price ? parseFloat(product.price).toFixed(2) : '0.00'}
          </p>
          {/* Optional: Sale price / Discount */}
          {/* {product.salePrice && (
            <p className="text-sm line-through text-light-text-secondary dark:text-dark-text-secondary">
              ${parseFloat(product.originalPrice).toFixed(2)}
            </p>
          )} */}
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;
