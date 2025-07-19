'use client';

import { useEffect } from 'react';
import { Locales, Locale } from '../locales';

/**
 * Custom hook that dynamically updates the HTML element's dir attribute
 * based on the current locale direction. Call this hook in your main component
 * or layout to ensure the HTML direction is set correctly.
 */
export const useHtmlDirection = (locale: Locale) => {
  const direction = Locales[locale]?.direction || 'rtl';

  useEffect(() => {
    const htmlElement = document.documentElement;
    if (htmlElement) {
      htmlElement.dir = direction;
      htmlElement.lang = locale;
    }
  }, [direction, locale]);

  return direction;
};
