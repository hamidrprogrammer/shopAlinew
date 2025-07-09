// app/checkout/page.js
'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

import useCartStore from '../../store/useCartStore';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
// import { Select, SelectItem } from '../../components/ui/Select'; // If needed for country/state
import { Textarea } from '../../components/ui/Textarea';
import { SkeletonLoader } from '../../components/ui/SkeletonLoader';

const PLACEHOLDER_IMAGE_URL = '/images/placeholder-product.png';

// Define Zod schema for form validation
// This should be adapted based on specific requirements for each field
const checkoutSchema = z.object({
  firstName: z.string().min(1, { message: "First name is required" }),
  lastName: z.string().min(1, { message: "Last name is required" }),
  email: z.string().email({ message: "Invalid email address" }),
  phone: z.string().min(5, { message: "Phone number is required" }), // Basic validation
  address: z.string().min(5, { message: "Street address is required" }),
  city: z.string().min(1, { message: "City is required" }),
  postalCode: z.string().min(3, { message: "Postal code is required" }),
  country: z.string().min(2, { message: "Country is required" }),
  // Optional fields
  apartment: z.string().optional(),
  company: z.string().optional(),
  notes: z.string().max(500, "Order notes cannot exceed 500 characters").optional(),
  // Payment method - for now, just a placeholder or not included in this form directly
  // paymentMethod: z.enum(['creditCard', 'paypal', 'bankTransfer'], {required_error: "Please select a payment method"}),
});

// FormField component for cleaner forms (can be moved to a separate file)
const FormField = ({ name, label, children, error }) => (
  <div>
    <label htmlFor={name} className="block text-sm font-medium text-light-text dark:text-dark-text mb-1">
      {label}
    </label>
    {children}
    {error && <p className="mt-1 text-xs text-red-500 dark:text-red-400">{error.message}</p>}
  </div>
);


export default function CheckoutPage() {
  const t = useTranslations('CheckoutPage');
  const tCommon = useTranslations('Common');
  const router = useRouter();

  const { items, getTotalPrice, getTotalItems, clearCart } = useCartStore();
  const totalPrice = getTotalPrice();
  const totalItems = getTotalItems();

  const methods = useForm({
    resolver: zodResolver(checkoutSchema),
    defaultValues: { // Pre-fill if user is logged in and has address info
      firstName: '', lastName: '', email: '', phone: '',
      address: '', city: '', postalCode: '', country: '',
      apartment: '', company: '', notes: '',
    }
  });
  const { register, handleSubmit, formState: { errors, isSubmitting } } = methods;

  useEffect(() => {
    if (items.length === 0 && !isSubmitting) { // Check !isSubmitting to avoid redirect during form submission
      router.replace('/cart'); // Redirect to cart if empty
    }
  }, [items, router, isSubmitting]);

  const onSubmit = async (data) => {
    console.log('Checkout data:', data);
    // TODO:
    // 1. Create order object with cart items and form data.
    // 2. Send order to backend API (e.g., /api/v1/orders).
    // 3. On successful order creation, redirect to payment gateway or order confirmation page.
    // 4. Handle API errors.
    // 5. Clear cart on successful order.

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    alert(t('orderPlacedSuccessfully')); // Placeholder
    // clearCart(); // Uncomment after successful order placement
    // router.push('/profile/orders'); // Redirect to order history or a thank you page
  };

  if (items.length === 0 && typeof window !== 'undefined') { // Check window to avoid SSR issues with redirect
     // This check is mainly for client-side, useEffect handles the redirect more gracefully
    return (
      <div className="container mx-auto px-4 py-12 text-center min-h-[calc(100vh-20rem)] flex flex-col justify-center items-center">
        <h1 className="text-2xl font-semibold mb-4">{t('cartEmptyRedirect.title')}</h1>
        <p className="mb-6">{t('cartEmptyRedirect.message')}</p>
        <Link href="/cart"><Button>{t('cartEmptyRedirect.returnToCart')}</Button></Link>
      </div>
    );
  }


  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <header className="mb-8 text-center">
        <h1 className="text-3xl sm:text-4xl font-bold text-light-text dark:text-dark-text">
          {t('title')}
        </h1>
      </header>

      <FormProvider {...methods}> {/* Provide form methods to context for nested components if any */}
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col lg:flex-row gap-8 lg:gap-12">
          {/* Shipping & Contact Details Form */}
          <div className="lg:w-2/3 p-6 bg-light-background dark:bg-dark-secondary rounded-lg shadow-lg border border-light-border dark:border-dark-border">
            <h2 className="text-xl font-semibold text-light-text dark:text-dark-text mb-6">{t('shippingDetails.title')}</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
              <FormField label={t('shippingDetails.firstName')} name="firstName" error={errors.firstName}>
                <Input {...register('firstName')} hasError={!!errors.firstName} />
              </FormField>
              <FormField label={t('shippingDetails.lastName')} name="lastName" error={errors.lastName}>
                <Input {...register('lastName')} hasError={!!errors.lastName} />
              </FormField>
              <FormField label={t('shippingDetails.email')} name="email" error={errors.email}>
                <Input type="email" {...register('email')} hasError={!!errors.email} />
              </FormField>
              <FormField label={t('shippingDetails.phone')} name="phone" error={errors.phone}>
                <Input type="tel" {...register('phone')} hasError={!!errors.phone} />
              </FormField>
              <div className="sm:col-span-2">
                <FormField label={t('shippingDetails.address')} name="address" error={errors.address}>
                  <Input {...register('address')} placeholder={t('shippingDetails.addressPlaceholder')} hasError={!!errors.address} />
                </FormField>
              </div>
              <FormField label={t('shippingDetails.apartment')} name="apartment" error={errors.apartment}>
                <Input {...register('apartment')} placeholder={t('shippingDetails.apartmentPlaceholder')} />
              </FormField>
              <FormField label={t('shippingDetails.city')} name="city" error={errors.city}>
                <Input {...register('city')} hasError={!!errors.city} />
              </FormField>
              <FormField label={t('shippingDetails.postalCode')} name="postalCode" error={errors.postalCode}>
                <Input {...register('postalCode')} hasError={!!errors.postalCode} />
              </FormField>
              <FormField label={t('shippingDetails.country')} name="country" error={errors.country}>
                {/* TODO: Replace with a Select component for countries */}
                <Input {...register('country')} hasError={!!errors.country} />
              </FormField>
              <div className="sm:col-span-2">
                <FormField label={t('shippingDetails.company')} name="company" error={errors.company}>
                  <Input {...register('company')} placeholder={t('shippingDetails.companyPlaceholder')} />
                </FormField>
              </div>
              <div className="sm:col-span-2">
                <FormField label={t('shippingDetails.orderNotes')} name="notes" error={errors.notes}>
                  <Textarea {...register('notes')} rows={3} placeholder={t('shippingDetails.orderNotesPlaceholder')} />
                </FormField>
              </div>
            </div>

            {/* Payment Method Section - Placeholder */}
            <h2 className="text-xl font-semibold text-light-text dark:text-dark-text mt-8 mb-6 pt-6 border-t border-light-border dark:border-dark-border">{t('payment.title')}</h2>
            <div className="space-y-4">
              <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary">{t('payment.placeholder')}</p>
              {/* TODO: Implement payment method selection (e.g., Stripe Elements, PayPal button) */}
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:w-1/3 p-6 bg-light-secondary dark:bg-dark-secondary rounded-lg shadow-lg h-fit lg:sticky lg:top-24">
            <h2 className="text-xl font-semibold text-light-text dark:text-dark-text mb-6 border-b border-light-border dark:border-dark-border pb-3">
              {t('orderSummary.title')}
            </h2>
            <div className="space-y-3 mb-4 max-h-60 overflow-y-auto pr-2">
              {items.map(item => (
                <div key={item.id} className="flex justify-between items-center text-sm">
                  <div className="flex items-center">
                    <div className="relative w-10 h-10 rounded-md overflow-hidden mr-3 rtl:ml-3 flex-shrink-0">
                      <Image src={item.imageUrl || PLACEHOLDER_IMAGE_URL} alt={item.name} fill className="object-cover" onError={(e)=>{e.currentTarget.src=PLACEHOLDER_IMAGE_URL}}/>
                    </div>
                    <div>
                      <p className="text-light-text dark:text-dark-text font-medium truncate max-w-[150px]">{item.name}</p>
                      <p className="text-light-text-secondary dark:text-dark-text-secondary">Qty: {item.quantity}</p>
                    </div>
                  </div>
                  <p className="text-light-text dark:text-dark-text font-medium">${(item.price * item.quantity).toFixed(2)}</p>
                </div>
              ))}
            </div>
            <div className="space-y-2 py-4 border-t border-b border-light-border dark:border-dark-border">
              <div className="flex justify-between text-light-text-secondary dark:text-dark-text-secondary">
                <span>{t('orderSummary.subtotal', { count: totalItems })}</span>
                <span>${totalPrice.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-light-text-secondary dark:text-dark-text-secondary">
                <span>{t('orderSummary.shipping')}</span>
                <span>{t('orderSummary.shippingCost')}</span>
              </div>
            </div>
            <div className="flex justify-between text-lg font-bold text-light-text dark:text-dark-text mt-4 mb-6">
              <span>{t('orderSummary.total')}</span>
              <span>${totalPrice.toFixed(2)}</span> {/* TODO: Add shipping/tax to total */}
            </div>
            <Button type="submit" size="lg" className="w-full" isLoading={isSubmitting} disabled={isSubmitting}>
              {isSubmitting ? tCommon('processing') : t('orderSummary.placeOrderButton')}
            </Button>
          </div>
        </form>
      </FormProvider>
    </div>
  );
}
