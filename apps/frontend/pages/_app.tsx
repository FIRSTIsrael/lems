import { AppProps } from 'next/app';
import Head from 'next/head';
import { SnackbarProvider } from 'notistack';
import { NextIntlClientProvider } from 'next-intl';
import { CssBaseline, Grow, ThemeProvider } from '@mui/material';
import { AppCacheProvider } from '@mui/material-nextjs/v15-pagesRouter';
import '../lib/utils/dayjs';
import { getLocalizedTheme } from '../lib/theme';
import { createCustomEmotionCache } from '../lib/emotion-cache';
import { Locales } from '../locale/locales';
import { TimeSyncProvider } from '../lib/timesync';
import { useHtmlDirection } from '../hooks/layout/use-html-direction';
import SnackbarCloseButton from '../components/general/snackbar-close-button';

export default function LEMSApp(props: AppProps) {
  const { Component, pageProps, router } = props;
  const locale = (router.locale ?? 'he') as Locales;
  const emotionCache = createCustomEmotionCache(locale);
  const theme = getLocalizedTheme(locale);

  // This hook will dynamically update the HTML dir and lang attributes
  useHtmlDirection();

  return (
    <AppCacheProvider {...props} emotionCache={emotionCache}>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta name="theme-color" content="#fff" />
        <meta
          name="description"
          content="מערכת האירועים של FIRST ישראל לתוכנית FIRST LEGO League Challenge"
        />
        <title>מערכת אירועים - FIRST ישראל</title>
      </Head>
      <NextIntlClientProvider locale={locale} messages={pageProps.messages}>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <SnackbarProvider
            maxSnack={3}
            TransitionComponent={Grow}
            action={snackbarId => <SnackbarCloseButton snackbarId={snackbarId} />}
          >
            <TimeSyncProvider>
              <Component {...pageProps} />
            </TimeSyncProvider>
          </SnackbarProvider>
        </ThemeProvider>
      </NextIntlClientProvider>
    </AppCacheProvider>
  );
}
