import { useEffect } from 'react';
import { useRouter } from 'next/router';
import PortalLocales, { Locales } from '../../locale/locales';

/**
 * Custom hook that dynamically updates the HTML element's dir attribute
 * based on the current locale direction
 */
export const useHtmlDirection = () => {
  const router = useRouter();
  const currentLocale = (router.locale ?? 'he') as Locales;
  const direction = PortalLocales[currentLocale]?.direction || 'rtl';

  useEffect(() => {
    const htmlElement = document.documentElement;
    if (htmlElement) {
      htmlElement.dir = direction;
      htmlElement.lang = currentLocale;
    }
  }, [direction, currentLocale]);

  return direction;
};
