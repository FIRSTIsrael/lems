import { AppProps } from 'next/app';
import Head from 'next/head';
import { CssBaseline, ThemeProvider } from '@mui/material';
import { CacheProvider, EmotionCache } from '@emotion/react';
import '../lib/dayjs';
import theme from '../lib/theme';
import { createEmotionCache } from '../lib/emotion-cache';
import ResponsiveAppBar from '../components/app-bar';

const clientSideEmotionCache = createEmotionCache();

function CustomApp({
  Component,
  pageProps,
  emotionCache = clientSideEmotionCache
}: AppProps & { emotionCache: EmotionCache }) {
  return (
    <CacheProvider value={emotionCache}>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta name="theme-color" content="#fff" />
        <meta name="description" content="פורטל האירועים של FIRST LEGO League Challenge" />
        <title>פורטל אירועים - FIRST LEGO League Challenge</title>
      </Head>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <main className="app">
          <ResponsiveAppBar />
          <Component {...pageProps} />
        </main>
      </ThemeProvider>
    </CacheProvider>
  );
}

export default CustomApp;
