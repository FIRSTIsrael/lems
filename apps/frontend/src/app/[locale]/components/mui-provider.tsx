'use client';

import { useEffect } from 'react';
import { AppRouterCacheProvider } from '@mui/material-nextjs/v15-appRouter';
import { CssBaseline, ThemeProvider } from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { Locale, getEmotionCacheOptions, Locales, configureDayjs } from '@lems/localization';
import { routing } from '../../../i18n/routing';
import { getLocalizedTheme } from '../../../theme';

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

  // Configure dayjs with the current locale
  useEffect(() => {
    configureDayjs(locale);
  }, [locale]);

  const theme = getLocalizedTheme(locale);
  const cacheConfig = getEmotionCacheOptions(locale);

  return (
    <AppRouterCacheProvider options={cacheConfig}>
      <ThemeProvider theme={theme}>
        <LocalizationProvider
          dateAdapter={AdapterDayjs}
          adapterLocale={Locales[locale].dayjsLocale}
        >
          <CssBaseline />
          {children}
        </LocalizationProvider>
      </ThemeProvider>
    </AppRouterCacheProvider>
  );
};
