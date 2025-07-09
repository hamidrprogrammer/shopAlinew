// components/SampleZodForm.js
'use client'; // This component uses client-side hooks

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

// Define Zod schema for validation
const formSchema = z.object({
  name: z.string().min(3, { message: "نام باید حداقل ۳ کاراکتر باشد" }).max(50, { message: "نام نمی‌تواند بیشتر از ۵۰ کاراکتر باشد" }),
  email: z.string().email({ message: "ایمیل وارد شده معتبر نیست" }),
  age: z.coerce.number().min(18, { message: "سن باید حداقل ۱۸ سال باشد" }).optional(),
  subscribe: z.boolean().optional(),
});

export default function SampleZodForm() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isValid }
  } = useForm({
    resolver: zodResolver(formSchema),
    mode: 'onChange', // Validate on change for better UX
  });

  const onSubmit = async (data) => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    console.log('Form data submitted:', data);
    alert('فرم با موفقیت ارسال شد:\n' + JSON.stringify(data, null, 2));
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-6 p-8 bg-white dark:bg-gray-800 shadow-lg rounded-xl max-w-lg mx-auto"
      dir="rtl" // For RTL layout
    >
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
          نام و نام خانوادگی
        </label>
        <input
          id="name"
          type="text"
          {...register('name')}
          className={`mt-1 block w-full px-3 py-2 border ${errors.name ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm dark:bg-gray-700 dark:text-white`}
        />
        {errors.name && <p className="mt-2 text-sm text-red-600 dark:text-red-400">{errors.name.message}</p>}
      </div>

      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
          ایمیل
        </label>
        <input
          id="email"
          type="email"
          {...register('email')}
          className={`mt-1 block w-full px-3 py-2 border ${errors.email ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm dark:bg-gray-700 dark:text-white`}
        />
        {errors.email && <p className="mt-2 text-sm text-red-600 dark:text-red-400">{errors.email.message}</p>}
      </div>

      <div>
        <label htmlFor="age" className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
          سن (اختیاری)
        </label>
        <input
          id="age"
          type="number"
          {...register('age')}
          className={`mt-1 block w-full px-3 py-2 border ${errors.age ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm dark:bg-gray-700 dark:text-white`}
        />
        {errors.age && <p className="mt-2 text-sm text-red-600 dark:text-red-400">{errors.age.message}</p>}
      </div>

      <div className="flex items-center">
        <input
          id="subscribe"
          type="checkbox"
          {...register('subscribe')}
          className="h-4 w-4 text-primary-600 border-gray-300 dark:border-gray-600 rounded focus:ring-primary-500 dark:bg-gray-700 dark:checked:bg-primary-500"
        />
        <label htmlFor="subscribe" className="mr-2 block text-sm text-gray-900 dark:text-gray-300">
          اشتراک در خبرنامه
        </label>
      </div>

      <button
        type="submit"
        disabled={isSubmitting || !isValid}
        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-primary-500 dark:hover:bg-primary-600"
      >
        {isSubmitting ? 'در حال ارسال...' : 'ارسال فرم'}
      </button>
    </form>
  );
}
