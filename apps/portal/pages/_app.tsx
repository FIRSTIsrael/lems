import { AppProps } from 'next/app';
import Head from 'next/head';
import { AppCacheProvider } from '@mui/material-nextjs/v15-pagesRouter';
import { useRouter } from 'next/router';
import { NextIntlClientProvider } from 'next-intl';
import { CssBaseline, ThemeProvider } from '@mui/material';
import '../lib/dayjs';
import { baseTheme } from '../lib/theme';
import { clientSideEmotionCache } from '../lib/emotion-cache';
import ResponsiveAppBar from '../components/app-bar';
import { Locales } from '../locale/locales';

export default function PortalApp(props: AppProps) {
  const { Component, pageProps } = props;
  const router = useRouter();
  const locale = router.locale as Locales | undefined;

  return (
    <AppCacheProvider {...props} emotionCache={clientSideEmotionCache}>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta name="description" content="פורטל האירועים של FIRST LEGO League Challenge" />
        <title>פורטל אירועים - FIRST LEGO League Challenge</title>
      </Head>
      <NextIntlClientProvider locale={locale} messages={pageProps.messages}>
        <ThemeProvider theme={baseTheme}>
          <CssBaseline />
          <ResponsiveAppBar />
          <Component {...pageProps} />
        </ThemeProvider>
      </NextIntlClientProvider>
    </AppCacheProvider>
  );
}
