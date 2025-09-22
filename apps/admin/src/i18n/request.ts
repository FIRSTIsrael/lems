import { getRequestConfig } from 'next-intl/server';
import { hasLocale } from 'next-intl';
import { routing } from './routing';

export default getRequestConfig(async ({ requestLocale }) => {
  // Typically corresponds to the `[locale]` segment
  const requested = await requestLocale;
  const locale = hasLocale(routing.locales, requested) ? requested : routing.defaultLocale;

  const messages = (await import(`../../locale/${locale}.json`)).default;
  const sharedMessages = (await import(`@lems/shared/locale/${locale}.json`)).default;

  return {
    locale,
    messages: {
      ...messages,
      shared: { ...sharedMessages }
    }
  };
});
