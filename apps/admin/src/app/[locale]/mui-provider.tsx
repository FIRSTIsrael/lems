'use client';

import { AppRouterCacheProvider } from '@mui/material-nextjs/v15-appRouter';
import { CssBaseline, ThemeProvider, createTheme } from '@mui/material';
import { Locale, Locales, getEmotionCacheOptions } from '@lems/localization';
import fontOptimizedTheme from '../../theme';
import { routing } from '../../i18n/routing';
import { getLocalizedTheme } from '../../../lib/theme';

export const MuiProvider = ({
  locale,
  children
}: {
  locale: Locale;
  children: React.ReactNode;
}) => {
  if (!routing.locales.includes(locale)) {
    throw new Error(`Locale ${locale} is not supported`);
  }

  const theme = createTheme(fontOptimizedTheme, getLocalizedTheme(locale));
  const cacheConfig = getEmotionCacheOptions(locale);

  return (
    <AppRouterCacheProvider options={cacheConfig}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </AppRouterCacheProvider>
  );
};
