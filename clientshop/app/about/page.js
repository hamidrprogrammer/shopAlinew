// app/about/page.js
'use client';

import { useTranslations } from 'next-intl';
import Image from 'next/image';
import { motion } from 'framer-motion';

const ABOUT_IMAGE_PLACEHOLDER = '/images/placeholder-about-us.jpg'; // Ensure this exists or use a real image

// Animation variants
const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5, ease: "easeOut" }
};

export default function AboutPage() {
  const t = useTranslations('AboutPage');

  return (
    <div className="py-12 sm:py-16 lg:py-20 bg-light-background dark:bg-dark-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.header
          className="text-center mb-10 md:mb-12"
          initial="initial"
          animate="animate"
          variants={fadeInUp}
        >
          <h1 className="text-4xl sm:text-5xl font-bold text-light-text dark:text-dark-text tracking-tight">
            {t('title')}
          </h1>
          <p className="mt-3 text-lg sm:text-xl text-light-text-secondary dark:text-dark-text-secondary max-w-2xl mx-auto">
            {t('subtitle')}
          </p>
        </motion.header>

        <motion.div
          className="grid md:grid-cols-2 gap-8 md:gap-12 items-center mb-12 md:mb-16"
          initial="initial"
          whileInView="animate"
          viewport={{ once: true, amount: 0.2 }}
          variants={fadeInUp}
        >
          <div className="prose dark:prose-invert lg:prose-lg max-w-none text-light-text-secondary dark:text-dark-text-secondary">
            <h2 className="text-2xl font-semibold text-light-text dark:text-dark-text mb-4">{t('ourStory.title')}</h2>
            <p>{t('ourStory.paragraph1')}</p>
            <p>{t('ourStory.paragraph2')}</p>
          </div>
          <div className="relative aspect-[4/3] rounded-xl overflow-hidden shadow-xl">
            <Image
              src={t('ourStory.imageUrl', {defaultValue: ABOUT_IMAGE_PLACEHOLDER})}
              alt={t('ourStory.imageAlt')}
              fill
              className="object-cover"
              onError={(e) => { e.currentTarget.src = ABOUT_IMAGE_PLACEHOLDER; }}
            />
          </div>
        </motion.div>

        <motion.div
          initial="initial"
          whileInView="animate"
          viewport={{ once: true, amount: 0.2 }}
          variants={fadeInUp}
          className="prose dark:prose-invert lg:prose-lg max-w-3xl mx-auto text-center mb-12 md:mb-16"
        >
            <h2 className="text-2xl font-semibold text-light-text dark:text-dark-text mb-4">{t('ourMission.title')}</h2>
            <p>{t('ourMission.paragraph')}</p>
        </motion.div>

        {/* Optional: Team Section or Values Section */}
        <motion.div
            initial="initial"
            whileInView="animate"
            viewport={{ once: true, amount: 0.1 }}
            className="text-center"
        >
            <h2 className="text-3xl font-semibold text-light-text dark:text-dark-text mb-8">{t('whyChooseUs.title')}</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {[1, 2, 3].map(item => (
                    <motion.div
                        key={item}
                        variants={fadeInUp}
                        className="p-6 bg-light-secondary dark:bg-dark-secondary rounded-xl shadow-lg"
                    >
                        {/* Icon placeholder, replace with actual icons */}
                        <div className="w-12 h-12 bg-light-primary dark:bg-dark-primary text-dark-text dark:text-light-text rounded-full flex items-center justify-center mx-auto mb-4">
                           {/* <CheckCircle className="w-7 h-7" /> */}
                           <span className="text-2xl font-bold">{item}</span>
                        </div>
                        <h3 className="text-xl font-semibold text-light-text dark:text-dark-text mb-2">{t(`whyChooseUs.item${item}.title`)}</h3>
                        <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary">{t(`whyChooseUs.item${item}.description`)}</p>
                    </motion.div>
                ))}
            </div>
        </motion.div>

      </div>
    </div>
  );
}
