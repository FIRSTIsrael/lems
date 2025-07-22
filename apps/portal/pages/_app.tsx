import { AppProps } from 'next/app';
import Head from 'next/head';
import { AppCacheProvider, createEmotionCache } from '@mui/material-nextjs/v15-pagesRouter';
import { NextIntlClientProvider } from 'next-intl';
import { CssBaseline, ThemeProvider } from '@mui/material';
import { useHtmlDirection, Locale, getEmotionCacheOptions } from '@lems/localization';
import '../lib/dayjs';
import { getLocalizedTheme } from '../lib/theme';
import ResponsiveAppBar from '../components/app-bar';

export default function PortalApp(props: AppProps) {
  const { Component, pageProps, router } = props;
  const locale = (router.locale ?? 'he') as Locale;
  const emotionCacheOptions = getEmotionCacheOptions(locale);
  const emotionCache = createEmotionCache(emotionCacheOptions);
  const theme = getLocalizedTheme(locale);

  // This hook will dynamically update the HTML dir and lang attributes
  useHtmlDirection(locale);

  return (
    <AppCacheProvider {...props} emotionCache={emotionCache}>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta name="description" content="פורטל האירועים של FIRST LEGO League Challenge" />
        <title>פורטל אירועים - FIRST LEGO League Challenge</title>
      </Head>
      <NextIntlClientProvider locale={locale} messages={pageProps.messages}>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <ResponsiveAppBar />
          <Component {...pageProps} />
        </ThemeProvider>
      </NextIntlClientProvider>
    </AppCacheProvider>
  );
}
