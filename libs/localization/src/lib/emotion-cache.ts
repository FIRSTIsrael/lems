import { createEmotionCache } from '@mui/material-nextjs/v15-pagesRouter';
import { prefixer } from 'stylis';
import rtlPlugin from '@mui/stylis-plugin-rtl';
import { Locales, Locale } from '@lems/localization';

export const ltrEmotionCache = {
  key: 'muiltr'
};

export const rtlEmotionCache = {
  key: 'muirtl',
  stylisPlugins: [prefixer, rtlPlugin]
};

/**
 * Legacy cache configuration for pagesRouter.
 * @param locale
 * @returns
 */
export const createCustomEmotionCache = (locale: Locale = 'he') => {
  const direction = Locales[locale].direction;
  if (direction === 'rtl') {
    return createEmotionCache(rtlEmotionCache);
  }
  return createEmotionCache(ltrEmotionCache);
};
