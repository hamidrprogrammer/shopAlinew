// app/login/page.js
'use client';

import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useRouter } from 'next/navigation';

import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import useAuthStore from '../../store/useAuthStore'; // To simulate login
import { AlertTriangle, LogIn } from 'lucide-react'; // For error icon

// Define Zod schema for login form validation
const loginSchema = z.object({
  email: z.string().email({ message: "Invalid email address" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }),
});

// FormField component (can be reused or defined globally if preferred)
const FormField = ({ name, label, children, error, type, tPlaceholder }) => {
  const { register } = useFormContext() ?? {}; // Use useFormContext if FormProvider is used, else pass register

  if (!register && !React.Children.toArray(children).some(child => child.props.name === name)) {
     // This is a basic check, might need more robust way if children structure varies a lot
     // console.warn(`FormField for "${name}" might not be correctly connected to RHF. Ensure 'register' is passed or useFormContext is available.`);
  }

  return (
    <div>
      <label htmlFor={name} className="block text-sm font-medium text-light-text dark:text-dark-text mb-1">
        {label}
      </label>
      {/* Pass down register and error status to Input/children */}
      {React.isValidElement(children) ?
        React.cloneElement(children, {
          id: name,
          ...(register ? register(name) : {}), // Spread register if available
          hasError: !!error,
          placeholder: tPlaceholder || children.props.placeholder,
          type: type || children.props.type,
         }) : children}
      {error && <p className="mt-1 text-xs text-red-500 dark:text-red-400 flex items-center"><AlertTriangle className="h-3 w-3 mr-1 rtl:ml-1"/>{error.message}</p>}
    </div>
  );
};


export default function LoginPage() {
  const t = useTranslations('LoginPage');
  const tCommonErrors = useTranslations('Errors'); // For common Zod error messages
  const router = useRouter();
  const { login, isLoading, error: authError } = useAuthStore(); // Using Zustand login for now

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data) => {
    console.log('Login data:', data);
    // Simulate API call / Zustand action
    // In a real app, you'd call your actual login function from authService/authStore
    // which would make an API request.
    const success = await login(data.email, data.password); // login from useAuthStore
    if (success) {
      router.push('/profile'); // Redirect to profile on successful login
    }
    // Error handling is done via authError from the store
  };

  // Map Zod error messages if needed, or ensure your Zod messages are translation keys
  const getErrorMessage = (fieldError) => {
    if (!fieldError) return null;
    // If fieldError.message is a key like "Errors.email.invalid", tCommonErrors will translate it.
    // Otherwise, it will return the message itself.
    return tCommonErrors(fieldError.message) || fieldError.message;
  }


  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-12rem)] py-10 px-4">
      <div className="w-full max-w-md p-6 sm:p-8 bg-light-background dark:bg-dark-secondary shadow-xl rounded-xl border border-light-border dark:border-dark-border">
        <div className="text-center mb-8">
          <Link href="/" className="inline-block mb-4">
             {/* <Image src="/logo.svg" alt="ONSKO Logo" width={120} height={40} /> Placeholder */}
             <h1 className="text-3xl font-bold text-light-primary dark:text-dark-primary">ONSKO</h1>
          </Link>
          <h2 className="text-2xl font-semibold text-light-text dark:text-dark-text">{t('title')}</h2>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
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
            <div className="flex justify-between items-center mb-1">
              <label htmlFor="password"className="block text-sm font-medium text-light-text dark:text-dark-text">
                {t('passwordLabel')}
              </label>
              <Link href="/forgot-password" पासclassName="text-xs text-light-primary dark:text-dark-primary hover:underline">
                {t('forgotPasswordLink')}
              </Link>
            </div>
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

          {authError && (
            <div className="p-3 my-3 text-sm text-red-700 bg-red-100 border border-red-300 rounded-md dark:bg-red-900/30 dark:text-red-300 dark:border-red-700/50 flex items-center">
              <AlertTriangle className="h-4 w-4 mr-2 rtl:ml-2 flex-shrink-0" />
              <span>{typeof authError === 'string' ? tCommonErrors(authError) : tCommonErrors('loginFailedDefault')}</span>
            </div>
          )}

          <Button type="submit" className="w-full text-base py-2.5" isLoading={isSubmitting || isLoading} size="lg">
            <LogIn className="mr-2 rtl:ml-2 h-5 w-5" />
            {t('loginButton')}
          </Button>
        </form>

        <p className="mt-8 text-sm text-center text-light-text-secondary dark:text-dark-text-secondary">
          {t('noAccountPrompt')}{' '}
          <Link href="/register" className="font-medium text-light-primary dark:text-dark-primary hover:underline">
            {t('signUpLink')}
          </Link>
        </p>
         {/* Optional: Social Logins */}
        {/* <div className="mt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300 dark:border-gray-600" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-light-background dark:bg-dark-secondary text-light-text-secondary dark:text-dark-text-secondary">
                {t('orContinueWith')}
              </span>
            </div>
          </div>
          <div className="mt-6 grid grid-cols-1 gap-3"> // Or grid-cols-2 for side-by-side
            <Button variant="outline" className="w-full">
              Google Icon Placeholder
              {t('continueWithGoogle')}
            </Button>
          </div>
        </div> */}
      </div>
    </div>
  );
}
