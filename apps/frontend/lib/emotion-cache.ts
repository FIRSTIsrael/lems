import { createEmotionCache } from '@mui/material-nextjs/v15-pagesRouter';
import { prefixer } from 'stylis';
import rtlPlugin from '@mui/stylis-plugin-rtl';
import LEMSLocales, { Locales } from '../locale/locales';

export const createCustomEmotionCache = (locale: Locales = 'he') => {
  const direction = LEMSLocales[locale].direction;

  if (direction === 'rtl') {
    return createEmotionCache({
      key: 'muirtl',
      stylisPlugins: [prefixer, rtlPlugin]
    });
  }

  return createEmotionCache({
    key: 'muiltr'
  });
};
