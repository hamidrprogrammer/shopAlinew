// i18n.js
import {getRequestConfig} from 'next-intl/server';

export default getRequestConfig(async ({locale}) => {
  // Validate that the incoming `locale` parameter is valid
  if (!['en', 'fa'].includes(locale)) {
    // Optionally, you can throw an error or fallback to a default locale
    // For now, let's log and potentially fallback might be handled by middleware
    console.warn(`Invalid locale "${locale}" received. Check middleware configuration.`);
  }

  return {
    messages: (await import(`./messages/${locale}.json`)).default
  };
});
