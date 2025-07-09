// app/page.js
'use client'; // This page uses Framer Motion and client-side data fetching/state eventually

import { useTranslations } from 'next-intl';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '../components/ui/Button';
import ProductCard from '../components/products/ProductCard';
import { motion } from 'framer-motion';

// Placeholder images - ensure these exist in public/images or replace with actual URLs
const HERO_IMAGE_URL = '/images/hero-main.jpg'; // Example: A high-quality, inspiring furniture setup
const CATEGORY_LIVING_ROOM_URL = '/images/cat-livingroom.jpg';
const CATEGORY_BEDROOM_URL = '/images/cat-bedroom.jpg';
const CATEGORY_DINING_URL = '/images/cat-dining.jpg';
const PRODUCT_PLACEHOLDER_URL = '/images/placeholder-product.png'; // General product placeholder

// Mock data for featured products (replace with API call later)
const mockFeaturedProducts = [
  { id: '1', name: 'Elegant Velvet Sofa', price: '799.99', imageUrl: PRODUCT_PLACEHOLDER_URL, slug: 'elegant-velvet-sofa' },
  { id: '2', name: 'Oak Wood Coffee Table', price: '249.50', imageUrl: PRODUCT_PLACEHOLDER_URL, slug: 'oak-wood-coffee-table' },
  { id: '3', name: 'Industrial Bookshelf', price: '319.00', imageUrl: PRODUCT_PLACEHOLDER_URL, slug: 'industrial-bookshelf' },
  { id: '4', name: 'Modern Dining Chairs (Set of 2)', price: '199.00', imageUrl: PRODUCT_PLACEHOLDER_URL, slug: 'modern-dining-chairs' },
];

// Mock data for categories (replace with API call later)
const mockCategories = [
  { id: 'cat1', nameKey: 'livingRoom', defaultName: 'Living Room', imageUrl: CATEGORY_LIVING_ROOM_URL, slug: 'living-room' },
  { id: 'cat2', nameKey: 'bedroom', defaultName: 'Bedroom', imageUrl: CATEGORY_BEDROOM_URL, slug: 'bedroom' },
  { id: 'cat3', nameKey: 'dining', defaultName: 'Dining', imageUrl: CATEGORY_DINING_URL, slug: 'dining' },
];

// Animation variants for Framer Motion
const fadeInUp = {
  initial: { opacity: 0, y: 40 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, ease: "easeOut" }
};

const fadeIn = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  transition: { duration: 0.8, ease: "easeOut" }
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.15,
    },
  },
};


export default function HomePage() {
  const t = useTranslations('HomePage');
  const tCommon = useTranslations('Common');

  return (
    <div className="space-y-16 md:space-y-20 lg:space-y-24 pb-16">
      {/* Hero Section */}
      <motion.section
        className="relative min-h-[70vh] md:min-h-[85vh] lg:min-h-[calc(100vh-4rem)] flex items-center justify-center text-center overflow-hidden"
        initial="initial"
        animate="animate"
        variants={staggerContainer}
      >
        <Image
          src={HERO_IMAGE_URL}
          alt={t('hero.alt')}
          fill
          priority
          quality={85}
          className="object-cover absolute inset-0 z-0"
          onError={(e) => { e.currentTarget.src = '/images/placeholder-hero.jpg'; }} // Fallback
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/30 to-black/10 z-10"></div>

        <motion.div
          className="relative z-20 p-6 text-white max-w-3xl"
          variants={staggerContainer}
        >
          <motion.h1
            className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-5 md:mb-7 leading-tight"
            variants={fadeInUp}
          >
            {t('hero.title')}
          </motion.h1>
          <motion.p
            className="text-lg md:text-xl lg:text-2xl mb-8 md:mb-10"
            variants={fadeInUp}
          >
            {t('hero.subtitle')}
          </motion.p>
          <motion.div variants={fadeInUp}>
            <Link href="/products">
              <Button size="lg" variant="default" className="text-lg px-10 py-3 shadow-xl transform hover:scale-105 transition-transform">
                {t('hero.ctaButton')}
              </Button>
            </Link>
          </motion.div>
        </motion.div>
      </motion.section>

      {/* Featured Categories Section */}
      <motion.section
        className="container mx-auto px-4 sm:px-6 lg:px-8"
        initial="initial"
        whileInView="animate"
        viewport={{ once: true, amount: 0.1 }}
        variants={staggerContainer}
      >
        <motion.h2
          className="text-3xl md:text-4xl font-semibold text-center mb-10 md:mb-12 text-light-text dark:text-dark-text"
          variants={fadeInUp}
        >
          {t('categories.title')}
        </motion.h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {mockCategories.map((category, index) => (
            <motion.div
              key={category.id}
              variants={fadeInUp}
            >
              <Link href={`/products?category=${category.slug}`} className="group block rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
                <div className="relative aspect-[4/3] sm:aspect-video">
                  <Image
                    src={category.imageUrl}
                    alt={t(`categories.${category.nameKey}`, {defaultValue: category.defaultName})}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    className="object-cover transition-transform duration-300 group-hover:scale-110"
                    onError={(e) => { e.currentTarget.src = CATEGORY_PLACEHOLDER; }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-80 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <div className="absolute bottom-0 left-0 p-5 sm:p-6">
                    <h3 className="text-xl sm:text-2xl font-semibold text-white shadow-sm">
                      {t(`categories.${category.nameKey}`, {defaultValue: category.defaultName})}
                    </h3>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* Featured Products Section */}
      <motion.section
        className="container mx-auto px-4 sm:px-6 lg:px-8"
        initial="initial"
        whileInView="animate"
        viewport={{ once: true, amount: 0.1 }}
        variants={staggerContainer}
      >
        <motion.h2
          className="text-3xl md:text-4xl font-semibold text-center mb-10 md:mb-12 text-light-text dark:text-dark-text"
          variants={fadeInUp}
        >
          {t('featuredProducts.title')}
        </motion.h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-10">
          {mockFeaturedProducts.map((product, index) => (
             <motion.div
              key={product.id}
              variants={fadeInUp}
            >
              <ProductCard product={product} />
            </motion.div>
          ))}
        </div>
        <motion.div className="text-center mt-12" variants={fadeInUp}>
          <Link href="/products">
            <Button variant="secondary" size="lg" className="px-8 py-3">
              {tCommon('viewAllProducts')}
            </Button>
          </Link>
        </motion.div>
      </motion.section>

      {/* Marquee/Ticker Section */}
      <section className="bg-light-primary dark:bg-dark-primary py-4 text-dark-text dark:text-light-text overflow-hidden">
        <div className="relative flex overflow-x-hidden">
          <motion.div
            className="py-2 whitespace-nowrap flex"
            animate={{ x: ['0%', '-50%'] }} // Adjust based on content width
            transition={{ ease: 'linear', duration: 25, repeat: Infinity }}
          >
            {[...Array(3)].map((_, i) => ( // Repeat content for seamless loop
              <React.Fragment key={i}>
                <span className="mx-6 text-sm">{t('marquee.freeShipping')}</span>
                <span className="mx-6 text-sm font-semibold">{t('marquee.promoCode', {code: 'ONSKSALE25'})}</span>
                <span className="mx-6 text-sm">{t('marquee.newArrivals')}</span>
                <span className="mx-6 text-sm text-opacity-80">{t('marquee.limitedTime')}</span>
              </React.Fragment>
            ))}
          </motion.div>
        </div>
      </section>
    </div>
  );
}
