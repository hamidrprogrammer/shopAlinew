import './globals.css'
import { Inter, IranYekanX } from 'next/font/google' // Assuming IranYekanX can be imported this way or needs local setup

// Configure Inter font
const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter', // CSS variable for Inter
  display: 'swap',
})

// Configure IranYekanX font (this might need local font setup if not available via next/font/google)
// For demonstration, let's assume it's available. If not, we'll adjust later.
// const iranYekanX = IranYekanX({ // Commenting out as it will likely cause an error
//   subsets: ['arabic', 'latin'],
//   variable: '--font-iranyekanx',
//   display: 'swap',
// })

// i18n imports
import {NextIntlClientProvider} from 'next-intl';
import {getLocale, getMessages} from 'next-intl/server'; // Use server functions

// i18n imports
import {NextIntlClientProvider} from 'next-intl';
import {getLocale, getMessages} from 'next-intl/server'; // Use server functions

import Header from '../components/Header'; // Import Header component
import Footer from '../components/Footer'; // Import Footer component
import AuthInitializer from '../components/AuthInitializer'; // Import AuthInitializer
import ThemeManager from '../components/ThemeManager'; // Import ThemeManager

// Metadata can also be localized if needed, but keeping it simple for now.
export const metadata = {
  title: 'فروشگاه مبلمان آنلاین',
  description: 'فروشگاه آنلاین مبلمان با طراحی مدرن و محصولات با کیفیت',
};

export default async function RootLayout({ children }) { // Make RootLayout async
  const locale = await getLocale();
  const messages = await getMessages();

  return (
    <html lang={locale} dir={locale === 'fa' ? 'rtl' : 'ltr'} className={`${inter.variable} font-inter`}>
      <head>
        {/* Add any other head elements here, like favicons, meta tags etc. */}
        {/* We will add local font loading for IranYekanX here if needed */}
      </head>
      <body className="bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-100 flex flex-col min-h-screen">
        <NextIntlClientProvider locale={locale} messages={messages}>
          <AuthInitializer />
          <ThemeManager /> {/* Manages applying 'dark' class to HTML based on store */}
          <Header />
          <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {children}
          </main>
          <Footer />
        </NextIntlClientProvider>
      </body>
    </html>
  )
}
