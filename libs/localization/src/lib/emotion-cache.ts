import { prefixer } from 'stylis';
import rtlPlugin from '@mui/stylis-plugin-rtl';
import { Locales, Locale } from './locales';

export const getEmotionCacheOptions = (locale: Locale) => {
  const dir = Locales[locale].direction as 'ltr' | 'rtl';

  if (dir === 'rtl') {
    return { key: 'muirtl', stylisPlugins: [prefixer, rtlPlugin] };
  }

  return { key: 'muiltr' };
};
