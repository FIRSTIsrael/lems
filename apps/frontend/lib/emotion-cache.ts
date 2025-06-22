import createCache from '@emotion/cache';
import rtlPlugin from '@mui/stylis-plugin-rtl';
import theme from './theme';

export const createEmotionCache = () =>
  createCache({
    key: 'css',
    stylisPlugins: theme.direction === 'rtl' ? [rtlPlugin] : []
  });
