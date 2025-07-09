// app/register/page.js
'use client';

import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useRouter } from 'next/navigation';
import { AlertTriangle, UserPlus } from 'lucide-react';

import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import useAuthStore from '../../store/useAuthStore'; // To simulate registration or use actual registration function

// Define Zod schema for registration form validation
const registerSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters" }),
  email: z.string().email({ message: "Invalid email address" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }),
  confirmPassword: z.string().min(6, { message: "Please confirm your password" }),
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"], // Path to field to display error
});


export default function RegisterPage() {
  const t = useTranslations('RegisterPage');
  const tCommonErrors = useTranslations('Errors');
  const router = useRouter();
  // const { register: registerUser, isLoading, error: authError } = useAuthStore(); // Assuming registerUser exists in store
  const isLoading = false; // Placeholder
  const authError = null; // Placeholder

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data) => {
    console.log('Registration data:', data);
    // TODO: Implement actual registration API call
    // const success = await registerUser({ name: data.name, email: data.email, password: data.password });
    // if (success) {
    //   router.push('/profile'); // Or to a "please verify your email" page
    // }

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    alert(t('registrationSuccessfulPlaceholder')); // Placeholder
    router.push('/login');
  };

  const getErrorMessage = (fieldError) => {
    if (!fieldError) return null;
    return tCommonErrors(fieldError.message) || fieldError.message;
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-12rem)] py-10 px-4">
      <div className="w-full max-w-md p-6 sm:p-8 bg-light-background dark:bg-dark-secondary shadow-xl rounded-xl border border-light-border dark:border-dark-border">
        <div className="text-center mb-8">
           <Link href="/" className="inline-block mb-4">
             <h1 className="text-3xl font-bold text-light-primary dark:text-dark-primary">ONSKO</h1>
          </Link>
          <h2 className="text-2xl font-semibold text-light-text dark:text-dark-text">{t('title')}</h2>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-light-text dark:text-dark-text mb-1">
              {t('nameLabel')}
            </label>
            <Input
              type="text"
              id="name"
              {...register('name')}
              placeholder={t('namePlaceholder')}
              hasError={!!errors.name}
              className="w-full"
            />
            {errors.name && <p className="mt-1 text-xs text-red-500 dark:text-red-400 flex items-center"><AlertTriangle className="h-3 w-3 mr-1 rtl:ml-1"/>{getErrorMessage(errors.name)}</p>}
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-light-text dark:text-dark-text mb-1">
              {t('emailLabel')}
            </label>
            <Input
              type="email"
              id="email"
              {...register('email')}
              placeholder={t('emailPlaceholder')}
              hasError={!!errors.email}
              className="w-full"
            />
            {errors.email && <p className="mt-1 text-xs text-red-500 dark:text-red-400 flex items-center"><AlertTriangle className="h-3 w-3 mr-1 rtl:ml-1"/>{getErrorMessage(errors.email)}</p>}
          </div>

          <div>
            <label htmlFor="password"className="block text-sm font-medium text-light-text dark:text-dark-text mb-1">
              {t('passwordLabel')}
            </label>
            <Input
              type="password"
              id="password"
              {...register('password')}
              placeholder={t('passwordPlaceholder')}
              hasError={!!errors.password}
              className="w-full"
            />
            {errors.password && <p className="mt-1 text-xs text-red-500 dark:text-red-400 flex items-center"><AlertTriangle className="h-3 w-3 mr-1 rtl:ml-1"/>{getErrorMessage(errors.password)}</p>}
          </div>

          <div>
            <label htmlFor="confirmPassword"className="block text-sm font-medium text-light-text dark:text-dark-text mb-1">
              {t('confirmPasswordLabel')}
            </label>
            <Input
              type="password"
              id="confirmPassword"
              {...register('confirmPassword')}
              placeholder={t('confirmPasswordPlaceholder')}
              hasError={!!errors.confirmPassword}
              className="w-full"
            />
            {errors.confirmPassword && <p className="mt-1 text-xs text-red-500 dark:text-red-400 flex items-center"><AlertTriangle className="h-3 w-3 mr-1 rtl:ml-1"/>{getErrorMessage(errors.confirmPassword)}</p>}
          </div>

          {authError && (
            <div className="p-3 my-3 text-sm text-red-700 bg-red-100 border border-red-300 rounded-md dark:bg-red-900/30 dark:text-red-300 dark:border-red-700/50 flex items-center">
              <AlertTriangle className="h-4 w-4 mr-2 rtl:ml-2 flex-shrink-0" />
              <span>{typeof authError === 'string' ? tCommonErrors(authError) : tCommonErrors('registrationFailedDefault')}</span>
            </div>
          )}

          <Button type="submit" className="w-full text-base py-2.5" isLoading={isSubmitting || isLoading} size="lg">
            <UserPlus className="mr-2 rtl:ml-2 h-5 w-5" />
            {t('registerButton')}
          </Button>
        </form>

        <p className="mt-8 text-sm text-center text-light-text-secondary dark:text-dark-text-secondary">
          {t('alreadyHaveAccountPrompt')}{' '}
          <Link href="/login" className="font-medium text-light-primary dark:text-dark-primary hover:underline">
            {t('loginLink')}
          </Link>
        </p>
      </div>
    </div>
  );
}
