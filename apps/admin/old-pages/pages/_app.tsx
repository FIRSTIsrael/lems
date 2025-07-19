import { AppProps } from 'next/app';
import Head from 'next/head';
import { AppCacheProvider } from '@mui/material-nextjs/v15-pagesRouter';
import { NextIntlClientProvider } from 'next-intl';
import { CssBaseline, ThemeProvider } from '@mui/material';
import { Locale, createCustomEmotionCache } from '@lems/localization';
import { getLocalizedTheme } from '../../lib/theme';

export default function PortalApp(props: AppProps) {
  const { Component, pageProps, router } = props;
  const locale = (router.locale ?? 'he') as Locale;
  const emotionCache = createCustomEmotionCache(locale);
  const theme = getLocalizedTheme(locale);

  return (
    <AppCacheProvider {...props} emotionCache={emotionCache}>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>ניהול אירועים - FIRST LEGO League Challenge</title>
      </Head>
      <NextIntlClientProvider locale={locale} messages={pageProps.messages}>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <Component {...pageProps} />
        </ThemeProvider>
      </NextIntlClientProvider>
    </AppCacheProvider>
  );
}
