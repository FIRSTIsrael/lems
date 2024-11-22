import createCache from '@emotion/cache';
import rtlPlugin from 'stylis-plugin-rtl';
import theme from './theme';

export const createEmotionCache = () =>
  createCache({
    key: 'css',
    stylisPlugins: theme.direction === 'rtl' ? [rtlPlugin] : []
  });
