import { createEmotionCache } from '@mui/material-nextjs/v15-pagesRouter';
import { prefixer } from 'stylis';
import rtlPlugin from '@mui/stylis-plugin-rtl';
import { Locales, Locale } from '@lems/localization';

export const getEmotionCacheOptions = (dir: 'ltr' | 'rtl') => {
  if (dir === 'rtl') {
    return { key: 'muirtl', stylisPlugins: [prefixer, rtlPlugin] };
  }

  return { key: 'muiltr' };
};

/**
 * Legacy cache configuration for pagesRouter.
 * @param locale
 * @returns
 */
export const createCustomEmotionCache = (locale: Locale = 'he') => {
  const direction = Locales[locale].direction;
  if (direction === 'rtl') {
    return createEmotionCache({ key: 'muirtl', stylisPlugins: [prefixer, rtlPlugin] });
  }
  return createEmotionCache({ key: 'muiltr' });
};
