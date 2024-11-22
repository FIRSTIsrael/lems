import { AppProps } from 'next/app';
import Head from 'next/head';
import { SnackbarProvider } from 'notistack';
import { CssBaseline, Grow, ThemeProvider } from '@mui/material';
import { CacheProvider, EmotionCache } from '@emotion/react';
import '../lib/utils/dayjs';
import theme from '../lib/theme';
import { createEmotionCache } from '../lib/emotion-cache';
import { RouteAuthorizer } from '../components/route-authorizer';
import SnackbarCloseButton from '../components/general/snackbar-close-button';
import { TimeSyncProvider } from '../lib/timesync';

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
        <title>מערכת אירועים - FIRST ישראל</title>
      </Head>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <SnackbarProvider
          maxSnack={3}
          TransitionComponent={Grow}
          action={snackbarId => <SnackbarCloseButton snackbarId={snackbarId} />}
        >
          <TimeSyncProvider>
            <main className="app">
              <RouteAuthorizer>
                <Component {...pageProps} />
              </RouteAuthorizer>
            </main>
          </TimeSyncProvider>
        </SnackbarProvider>
      </ThemeProvider>
    </CacheProvider>
  );
}

export default CustomApp;
