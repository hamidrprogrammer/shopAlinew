// app/profile/page.js
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { User, ShoppingBag, MapPin, Settings, LogOut, KeyRound, Edit3, PlusCircle, AlertTriangle } from 'lucide-react';

import useAuthStore from '../../store/useAuthStore';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { SkeletonLoader } from '../../components/ui/SkeletonLoader';

// Mock Data (to be replaced with API calls)
const mockUserOrders = [
  { id: 'ORD12345', date: '2023-10-15', status: 'Delivered', total: 129.99, items: 3 },
  { id: 'ORD12346', date: '2023-11-01', status: 'Processing', total: 75.50, items: 1 },
  { id: 'ORD12347', date: '2023-11-05', status: 'Shipped', total: 210.00, items: 2 },
];

const mockUserAddresses = [
  { id: 'addr1', type: 'Home', address: '123 Main St, Anytown, USA 12345', isDefault: true },
  { id: 'addr2', type: 'Work', address: '456 Business Rd, Anytown, USA 12345', isDefault: false },
];

// Zod schema for password change form
const passwordChangeSchema = z.object({
  currentPassword: z.string().min(6, "Current password is required"),
  newPassword: z.string().min(6, "New password must be at least 6 characters"),
  confirmNewPassword: z.string(),
}).refine(data => data.newPassword === data.confirmNewPassword, {
  message: "New passwords do not match",
  path: ["confirmNewPassword"],
});


export default function ProfilePage() {
  const t = useTranslations('ProfilePage');
  const tCommonErrors = useTranslations('Errors');
  const router = useRouter();
  const { user, isAuthenticated, logout, isLoading: authLoading } = useAuthStore();
  const [activeTab, setActiveTab] = useState('orders'); // 'orders', 'addresses', 'settings'

  const { register, handleSubmit, formState: { errors, isSubmitting: isPasswordSubmitting }, reset } = useForm({
    resolver: zodResolver(passwordChangeSchema),
  });

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.replace('/login');
    }
  }, [isAuthenticated, authLoading, router]);

  if (authLoading || !isAuthenticated || !user) {
    return ( // Basic page skeleton while loading or redirecting
      <div className="container mx-auto px-4 py-8 min-h-[calc(100vh-12rem)]">
        <SkeletonLoader height="h-10" width="w-1/3" className="mb-8 rounded-md" />
        <div className="grid lg:grid-cols-4 gap-8">
          <div className="lg:col-span-1 space-y-3">
            <SkeletonLoader height="h-10" className="rounded-md" />
            <SkeletonLoader height="h-10" className="rounded-md" />
            <SkeletonLoader height="h-10" className="rounded-md" />
          </div>
          <div className="lg:col-span-3 space-y-4">
            <SkeletonLoader height="h-40" className="rounded-lg" />
            <SkeletonLoader height="h-20" className="rounded-lg" />
          </div>
        </div>
      </div>
    );
  }

  const handlePasswordChangeSubmit = async (data) => {
    console.log("Password change data:", data);
    // TODO: Implement API call for password change
    // await authService.changePassword(data.currentPassword, data.newPassword);
    alert(t('accountSettings.passwordChangeSuccessPlaceholder')); // Placeholder
    reset(); // Reset form after submission
  };

  const tabs = [
    { id: 'orders', label: t('tabs.myOrders'), icon: ShoppingBag },
    { id: 'addresses', label: t('tabs.myAddresses'), icon: MapPin },
    { id: 'settings', label: t('tabs.accountSettings'), icon: Settings },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'orders':
        return (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-light-text dark:text-dark-text mb-4">{t('orders.title')}</h2>
            {mockUserOrders.length > 0 ? mockUserOrders.map(order => (
              <div key={order.id} className="p-4 border border-light-border dark:border-dark-border rounded-lg bg-light-background dark:bg-dark-secondary/50">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-semibold text-light-primary dark:text-dark-primary">#{order.id}</span>
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${order.status === 'Delivered' ? 'bg-green-100 text-green-700 dark:bg-green-700/30 dark:text-green-300' : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-700/30 dark:text-yellow-300'}`}>
                    {t(`orders.status.${order.status.toLowerCase()}`, {defaultValue: order.status})}
                  </span>
                </div>
                <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary">{t('orders.date')}: {new Date(order.date).toLocaleDateString()}</p>
                <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary">{t('orders.total')}: ${order.total.toFixed(2)}</p>
                <Button variant="link" size="sm" className="mt-2 px-0">{t('orders.viewDetails')}</Button>
              </div>
            )) : <p>{t('orders.noOrders')}</p>}
          </div>
        );
      case 'addresses':
        return (
          <div className="space-y-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-light-text dark:text-dark-text">{t('addresses.title')}</h2>
              <Button size="sm" variant="outline"><PlusCircle className="mr-2 rtl:ml-2 h-4 w-4"/>{t('addresses.addNew')}</Button>
            </div>
            {mockUserAddresses.map(addr => (
              <div key={addr.id} className="p-4 border border-light-border dark:border-dark-border rounded-lg bg-light-background dark:bg-dark-secondary/50">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold text-light-text dark:text-dark-text">{addr.type} {addr.isDefault && <span className="text-xs text-green-600 dark:text-green-400">({t('addresses.default')})</span>}</h3>
                    <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary">{addr.address}</p>
                  </div>
                  <Button variant="ghost" size="icon" className="text-light-text-secondary dark:text-dark-text-secondary"><Edit3 className="h-4 w-4"/></Button>
                </div>
              </div>
            ))}
          </div>
        );
      case 'settings':
        return (
          <div>
            <h2 className="text-xl font-semibold text-light-text dark:text-dark-text mb-6">{t('accountSettings.title')}</h2>
            <div className="p-6 border border-light-border dark:border-dark-border rounded-lg bg-light-background dark:bg-dark-secondary/50">
              <h3 className="text-lg font-medium text-light-text dark:text-dark-text mb-1">{t('accountSettings.profileInfo')}</h3>
              <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary mb-1">{t('accountSettings.name')}: {user.name || 'N/A'}</p>
              <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary mb-4">{t('accountSettings.email')}: {user.email}</p>
              {/* <Button variant="outline" size="sm">{t('accountSettings.editProfile')}</Button> */}

              <h3 className="text-lg font-medium text-light-text dark:text-dark-text mt-6 mb-3 pt-4 border-t border-light-border dark:border-dark-border">{t('accountSettings.changePasswordTitle')}</h3>
              <form onSubmit={handleSubmit(handlePasswordChangeSubmit)} className="space-y-4">
                <div>
                  <label htmlFor="currentPassword">{t('accountSettings.currentPassword')}</label>
                  <Input type="password" id="currentPassword" {...register("currentPassword")} hasError={!!errors.currentPassword} />
                  {errors.currentPassword && <p className="text-xs text-red-500 mt-1">{tCommonErrors(errors.currentPassword.message)}</p>}
                </div>
                <div>
                  <label htmlFor="newPassword">{t('accountSettings.newPassword')}</label>
                  <Input type="password" id="newPassword" {...register("newPassword")} hasError={!!errors.newPassword} />
                  {errors.newPassword && <p className="text-xs text-red-500 mt-1">{tCommonErrors(errors.newPassword.message)}</p>}
                </div>
                <div>
                  <label htmlFor="confirmNewPassword">{t('accountSettings.confirmNewPassword')}</label>
                  <Input type="password" id="confirmNewPassword" {...register("confirmNewPassword")} hasError={!!errors.confirmNewPassword} />
                  {errors.confirmNewPassword && <p className="text-xs text-red-500 mt-1">{tCommonErrors(errors.confirmNewPassword.message)}</p>}
                </div>
                <Button type="submit" isLoading={isPasswordSubmitting}><KeyRound className="mr-2 rtl:ml-2 h-4 w-4"/>{t('accountSettings.updatePasswordButton')}</Button>
              </form>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <header className="mb-8">
        <h1 className="text-3xl sm:text-4xl font-bold text-light-text dark:text-dark-text">{t('title')}</h1>
      </header>
      <div className="flex flex-col md:flex-row gap-8">
        {/* Sidebar Navigation */}
        <aside className="md:w-1/4 lg:w-1/5">
          <div className="p-4 bg-light-secondary dark:bg-dark-secondary rounded-lg shadow-md md:sticky md:top-24">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 rounded-full bg-light-primary dark:bg-dark-primary flex items-center justify-center text-xl font-semibold text-white dark:text-dark-text mr-3 rtl:ml-3">
                {user.name ? user.name.charAt(0).toUpperCase() : <User />}
              </div>
              <div>
                <h2 className="text-lg font-semibold text-light-text dark:text-dark-text">{user.name || t('guest')}</h2>
                <p className="text-xs text-light-text-secondary dark:text-dark-text-secondary truncate">{user.email}</p>
              </div>
            </div>
            <nav className="space-y-1.5">
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center space-x-2 rtl:space-x-reverse px-3 py-2.5 rounded-md text-sm font-medium transition-colors
                    ${activeTab === tab.id
                      ? 'bg-light-primary dark:bg-dark-primary text-dark-text dark:text-light-text shadow-sm'
                      : 'text-light-text-secondary dark:text-dark-text-secondary hover:bg-light-background dark:hover:bg-dark-background/50 hover:text-light-text dark:hover:text-dark-text'
                    }`}
                >
                  <tab.icon className="h-5 w-5" />
                  <span>{tab.label}</span>
                </button>
              ))}
              <Button variant="ghost" onClick={logout} className="w-full justify-start text-red-600 dark:text-red-400 hover:bg-red-500/10">
                <LogOut className="mr-2 rtl:ml-2 h-5 w-5"/> {t('logoutButton')}
              </Button>
            </nav>
          </div>
        </aside>

        {/* Content Area */}
        <main className="md:w-3/4 lg:w-4/5">
          {renderTabContent()}
        </main>
      </div>
    </div>
  );
}
