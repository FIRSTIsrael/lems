import { createEmotionCache } from '@mui/material-nextjs/v15-pagesRouter';
import { prefixer } from 'stylis';
import rtlPlugin from '@mui/stylis-plugin-rtl';
import { Locales } from '../locale/locales';

export const createCustomEmotionCache = (locale: Locales = 'he') => {
  if (locale === 'he') {
    return createEmotionCache({
      key: 'muirtl',
      stylisPlugins: [prefixer, rtlPlugin]
    });
  }

  return createEmotionCache({
    key: 'muiltr'
  });
};
