// app/cart/page.js
'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { Plus, Minus, Trash2, ShoppingBag } from 'lucide-react';

import useCartStore from '../../store/useCartStore';
import { Button } from '../../components/ui/Button';

const PLACEHOLDER_IMAGE_URL = '/images/placeholder-product.png';

export default function CartPage() {
  const t = useTranslations('CartPage');
  const tCommon = useTranslations('Common');
  const {
    items,
    removeFromCart,
    updateItemQuantity,
    clearCart, // Optional: if you want a clear cart button
    getTotalPrice,
    getTotalItems
  } = useCartStore();

  const totalPrice = getTotalPrice();
  const totalItems = getTotalItems();

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center min-h-[calc(100vh-20rem)] flex flex-col justify-center items-center">
        <ShoppingBag className="w-24 h-24 text-light-text-secondary dark:text-dark-text-secondary mb-6" strokeWidth={1} />
        <h1 className="text-3xl font-semibold text-light-text dark:text-dark-text mb-4">{t('emptyCart.title')}</h1>
        <p className="text-light-text-secondary dark:text-dark-text-secondary mb-8">{t('emptyCart.message')}</p>
        <Link href="/products">
          <Button size="lg">{t('emptyCart.browseProducts')}</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <header className="mb-8">
        <h1 className="text-3xl sm:text-4xl font-bold text-center text-light-text dark:text-dark-text">
          {t('title')} ({totalItems} {totalItems === 1 ? t('itemSingular') : t('itemPlural')})
        </h1>
      </header>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Cart Items */}
        <div className="lg:w-2/3 space-y-4">
          {items.map((item) => (
            <div
              key={item.id}
              className="flex flex-col sm:flex-row items-center p-4 bg-light-background dark:bg-dark-secondary rounded-lg shadow-md border border-light-border dark:border-dark-border"
            >
              <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-md overflow-hidden flex-shrink-0 mb-4 sm:mb-0 sm:mr-4 rtl:sm:ml-4">
                <Image
                  src={item.imageUrl || PLACEHOLDER_IMAGE_URL}
                  alt={item.name}
                  fill
                  sizes="100px"
                  className="object-cover"
                  onError={(e) => { e.currentTarget.src = PLACEHOLDER_IMAGE_URL; }}
                />
              </div>
              <div className="flex-grow text-center sm:text-left">
                <Link href={`/products/${item.slug || item.id}`}>
                  <h2 className="text-lg font-semibold text-light-text dark:text-dark-text hover:text-light-primary dark:hover:text-dark-primary transition-colors">
                    {item.name}
                  </h2>
                </Link>
                {/* TODO: Display selected variant if applicable */}
                <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary mt-1">
                  {t('unitPrice')}: ${item.price.toFixed(2)} {/* TODO: Currency formatting */}
                </p>
              </div>
              <div className="flex items-center my-3 sm:my-0 sm:mx-4">
                <Button variant="ghost" size="icon" onClick={() => updateItemQuantity(item.id, item.quantity - 1)} disabled={item.quantity <= 1} aria-label={t('decreaseQuantity')}>
                  <Minus className="h-4 w-4" />
                </Button>
                <span className="w-10 text-center font-medium text-light-text dark:text-dark-text" aria-live="polite">{item.quantity}</span>
                <Button variant="ghost" size="icon" onClick={() => updateItemQuantity(item.id, item.quantity + 1)} aria-label={t('increaseQuantity')}>
                  {/* TODO: Disable if quantity exceeds stock */}
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="text-md sm:text-lg font-semibold text-light-text dark:text-dark-text w-24 text-center sm:text-right">
                ${(item.price * item.quantity).toFixed(2)} {/* TODO: Currency formatting */}
              </div>
              <Button variant="ghost" size="icon" onClick={() => removeFromCart(item.id)} className="ml-2 rtl:mr-2 text-red-500 hover:text-red-700 dark:hover:text-red-400" aria-label={t('removeItem')}>
                <Trash2 className="h-5 w-5" />
              </Button>
            </div>
          ))}
           {/* Optional: Clear Cart Button */}
           {items.length > 0 && (
            <div className="mt-6 text-right">
              <Button variant="outline" onClick={clearCart} className="text-red-600 border-red-500 hover:bg-red-50 dark:text-red-400 dark:border-red-400 dark:hover:bg-red-900/30">
                <Trash2 className="mr-2 rtl:ml-2 h-4 w-4" /> {t('clearCart')}
              </Button>
            </div>
          )}
        </div>

        {/* Order Summary */}
        <div className="lg:w-1/3 p-6 bg-light-secondary dark:bg-dark-secondary rounded-lg shadow-lg h-fit lg:sticky lg:top-24">
          <h2 className="text-2xl font-semibold text-light-text dark:text-dark-text mb-6 border-b border-light-border dark:border-dark-border pb-3">
            {t('orderSummary.title')}
          </h2>
          <div className="space-y-3 mb-6">
            <div className="flex justify-between text-light-text-secondary dark:text-dark-text-secondary">
              <span>{t('orderSummary.subtotal', { count: totalItems })}</span>
              <span>${totalPrice.toFixed(2)}</span> {/* TODO: Currency formatting */}
            </div>
            <div className="flex justify-between text-light-text-secondary dark:text-dark-text-secondary">
              <span>{t('orderSummary.shipping')}</span>
              <span>{t('orderSummary.shippingCost')}</span> {/* Or calculated value */}
            </div>
            {/* Optional: Discount/Tax */}
            {/* <div className="flex justify-between text-light-text-secondary dark:text-dark-text-secondary">
              <span>{t('orderSummary.tax')}</span>
              <span>$0.00</span>
            </div> */}
            <div className="border-t border-light-border dark:border-dark-border my-3"></div>
            <div className="flex justify-between text-xl font-bold text-light-text dark:text-dark-text">
              <span>{t('orderSummary.total')}</span>
              <span>${totalPrice.toFixed(2)}</span> {/* TODO: Add shipping/tax to total */}
            </div>
          </div>
          <Link href="/checkout" className="w-full block">
            <Button size="lg" className="w-full">
              {t('orderSummary.proceedToCheckout')}
            </Button>
          </Link>
          <Link href="/products" className="w-full block mt-3">
            <Button variant="outline" size="lg" className="w-full">
              {tCommon('continueShopping')}
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
