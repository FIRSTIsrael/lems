import { AppProps } from 'next/app';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { NextIntlClientProvider } from 'next-intl';
import { CssBaseline, ThemeProvider } from '@mui/material';
// For some reason, EmotionCache import is not recognized
// eslint-disable-next-line import/named
import { CacheProvider, EmotionCache } from '@emotion/react';
import '../lib/dayjs';
import getLocalizedTheme from '../lib/theme';
import { createEmotionCache } from '../lib/emotion-cache';
import ResponsiveAppBar from '../components/app-bar';
import { Locales } from '../locale/locales';

function LEMSPortalApp({
  Component,
  pageProps,
  emotionCache: initialEmotionCache
}: AppProps & { emotionCache?: EmotionCache }) {
  const router = useRouter();
  const locale = router.locale as Locales | undefined;
  const emotionCache = initialEmotionCache || createEmotionCache(locale);

  return (
    <CacheProvider value={emotionCache}>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta name="theme-color" content="#fff" />
        <meta name="description" content="פורטל האירועים של FIRST LEGO League Challenge" />
        <title>פורטל אירועים - FIRST LEGO League Challenge</title>
      </Head>
      <NextIntlClientProvider locale={locale} messages={pageProps.messages}>
        <ThemeProvider theme={getLocalizedTheme(locale)}>
          <CssBaseline />
          <main className="app">
            <ResponsiveAppBar />
            <Component {...pageProps} />
          </main>
        </ThemeProvider>
      </NextIntlClientProvider>
    </CacheProvider>
  );
}

export default LEMSPortalApp;
