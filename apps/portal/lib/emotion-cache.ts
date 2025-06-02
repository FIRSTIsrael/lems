import createCache from '@emotion/cache';
import rtlPlugin from 'stylis-plugin-rtl';
import getLocalizedTheme from './theme';
import { Locales } from '../locale/locales';

export const createEmotionCache = (locale?: Locales) => {
  const theme = getLocalizedTheme(locale);
  return createCache({
    key: 'css',
    stylisPlugins: theme.direction === 'rtl' ? [rtlPlugin] : []
  });
};
