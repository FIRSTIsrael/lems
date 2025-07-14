import { useEffect } from 'react';
import { useRouter } from 'next/router';
import Locales, { Locale } from '../locales';

/**
 * Custom hook that dynamically updates the HTML element's dir attribute
 * based on the current locale direction. Call this hook in your main component
 * or layout to ensure the HTML direction is set correctly.
 */
export const useHtmlDirection = () => {
  const router = useRouter();
  const currentLocale = (router.locale ?? 'he') as Locale;
  const direction = Locales[currentLocale]?.direction || 'rtl';

  useEffect(() => {
    const htmlElement = document.documentElement;
    if (htmlElement) {
      htmlElement.dir = direction;
      htmlElement.lang = currentLocale;
    }
  }, [direction, currentLocale]);

  return direction;
};
