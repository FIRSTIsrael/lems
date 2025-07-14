import { createEmotionCache } from '@mui/material-nextjs/v15-pagesRouter';
import { prefixer } from 'stylis';
import rtlPlugin from '@mui/stylis-plugin-rtl';
import { Locales, Locale } from '@lems/localization';

export const createCustomEmotionCache = (locale: Locale = 'he') => {
  const direction = Locales[locale].direction;

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
