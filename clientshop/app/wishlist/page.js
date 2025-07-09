// app/wishlist/page.js
'use client';

import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { HeartCrack, ShoppingBag } from 'lucide-react';

import useAuthStore from '../../store/useAuthStore';
import useWishlistStore from '../../store/useWishlistStore';
import ProductCard from '../../components/products/ProductCard'; // Reusing ProductCard
import { Button } from '../../components/ui/Button';
import { SkeletonLoader } from '../../components/ui/SkeletonLoader';

export default function WishlistPage() {
  const t = useTranslations('WishlistPage');
  const router = useRouter();
  const { isAuthenticated, isLoading: authIsLoading } = useAuthStore();
  const { items: wishlistItems, removeFromWishlist, _hasHydrated } = useWishlistStore();
  // const { addToCart } = useCartStore(); // Assuming you have addToCart in useCartStore

  useEffect(() => {
    // Redirect to login if not authenticated and auth state has loaded
    if (!_hasHydrated || authIsLoading) return; // Wait for stores to hydrate/load

    if (!isAuthenticated) {
      router.replace('/login?redirect=/wishlist');
    }
  }, [isAuthenticated, authIsLoading, router, _hasHydrated]);

  const handleAddToCartFromWishlist = (product) => {
    // TODO: Implement addToCart logic from useCartStore
    // addToCart(product);
    // removeFromWishlist(product.id); // Optionally remove from wishlist after adding to cart
    console.log('Added to cart from wishlist (placeholder):', product.name);
    alert(`${product.name} ${t('addedToCartAlert')}`);
  };

  // Show loading skeleton if auth or wishlist store is not ready yet
  if (!_hasHydrated || authIsLoading) {
    return (
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 min-h-[calc(100vh-12rem)]">
        <SkeletonLoader height="h-10" width="w-1/3" className="mb-8 rounded-md" />
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-10">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="space-y-3 p-3 rounded-lg bg-light-secondary dark:bg-dark-secondary shadow-neumo-light dark:shadow-neumo-dark">
              <SkeletonLoader height="h-60" className="rounded-md"/>
              <SkeletonLoader height="h-5" width="w-3/4"/>
              <SkeletonLoader height="h-5" width="w-1/2"/>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    // This will likely not be seen due to the redirect, but as a fallback.
    return (
        <div className="container mx-auto px-4 py-12 text-center min-h-[calc(100vh-20rem)] flex flex-col justify-center items-center">
            <h1 className="text-2xl font-semibold mb-4">{t('authRequired.title')}</h1>
            <p className="mb-6">{t('authRequired.message')}</p>
            <Link href="/login?redirect=/wishlist"><Button>{t('authRequired.loginButton')}</Button></Link>
        </div>
    );
  }


  if (wishlistItems.length === 0) {
    return (
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center min-h-[calc(100vh-20rem)] flex flex-col justify-center items-center">
        <HeartCrack className="w-24 h-24 text-light-text-secondary dark:text-dark-text-secondary mb-6" strokeWidth={1} />
        <h1 className="text-3xl font-semibold text-light-text dark:text-dark-text mb-4">{t('emptyWishlist.title')}</h1>
        <p className="text-light-text-secondary dark:text-dark-text-secondary mb-8">{t('emptyWishlist.message')}</p>
        <Link href="/products">
          <Button size="lg">{t('emptyWishlist.browseProducts')}</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <header className="mb-8 text-center">
        <h1 className="text-3xl sm:text-4xl font-bold text-light-text dark:text-dark-text">
          {t('title')} ({wishlistItems.length})
        </h1>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-10">
        {wishlistItems.map((product) => (
          <div key={product.id} className="relative group/wishlist-item">
            <ProductCard product={product} />
            {/* Add specific actions for wishlist item if ProductCard doesn't cover them */}
            <div className="mt-2 flex flex-col sm:flex-row gap-2 justify-center">
              <Button
                variant="outline"
                size="sm"
                onClick={() => removeFromWishlist(product.id)}
                className="w-full sm:w-auto border-red-500 text-red-500 hover:bg-red-50 dark:border-red-400 dark:text-red-400 dark:hover:bg-red-900/30"
              >
                <Trash2 className="mr-1 rtl:ml-1 h-3.5 w-3.5" /> {t('removeButton')}
              </Button>
              <Button
                variant="default"
                size="sm"
                onClick={() => handleAddToCartFromWishlist(product)}
                className="w-full sm:w-auto"
              >
                <ShoppingCart className="mr-1 rtl:ml-1 h-3.5 w-3.5" /> {t('addToCartButton')}
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
