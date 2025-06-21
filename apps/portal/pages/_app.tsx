import { AppProps } from 'next/app';
import Head from 'next/head';
import { AppCacheProvider } from '@mui/material-nextjs/v15-pagesRouter';
import { CssBaseline, ThemeProvider } from '@mui/material';
import '../lib/dayjs';
import theme from '../lib/theme';
import ResponsiveAppBar from '../components/app-bar';

export default function PortalApp(props: AppProps) {
  const { Component, pageProps } = props;

  return (
    <AppCacheProvider {...props}>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta name="description" content="פורטל האירועים של FIRST LEGO League Challenge" />
        <title>פורטל אירועים - FIRST LEGO League Challenge</title>
      </Head>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <ResponsiveAppBar />
        <Component {...pageProps} />
      </ThemeProvider>
    </AppCacheProvider>
  );
}
