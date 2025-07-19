import { createEmotionCache } from '@mui/material-nextjs/v15-pagesRouter';
import { prefixer } from 'stylis';
import rtlPlugin from '@mui/stylis-plugin-rtl';
import { Locales, Locale } from '@lems/localization';

export const getEmotionCacheOptions = (locale: Locale) => {
  const dir = Locales[locale].direction as 'ltr' | 'rtl';

  if (dir === 'rtl') {
    return { key: 'muirtl', stylisPlugins: [prefixer, rtlPlugin] };
  }

  return { key: 'muiltr' };
};
