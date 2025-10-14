import { getRequestConfig } from 'next-intl/server';
import { hasLocale } from 'next-intl';
import { messages as sharedMessages } from '@lems/localization';
import { routing } from './routing';

export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale;
  const locale = hasLocale(routing.locales, requested) ? requested : routing.defaultLocale;

  const messages = (await import(`../../locale/${locale}.json`)).default;

  return {
    locale,
    messages: {
      ...messages,
      shared: { ...sharedMessages[locale] }
    }
  };
});
