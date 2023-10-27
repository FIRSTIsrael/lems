import { AppProps } from 'next/app';
import Head from 'next/head';
import { useEffect, useState } from 'react';
import { SnackbarProvider } from 'notistack';
import { create } from 'timesync';
import { CssBaseline, Grow, ThemeProvider } from '@mui/material';
import { CacheProvider, EmotionCache } from '@emotion/react';
import theme from '../lib/theme';
import { createEmotionCache } from '../lib/emotion-cache';
import { getApiBase } from '../lib/utils/fetch';
import { RouteAuthorizer } from '../components/route-authorizer';
import { TimeSyncContext } from '../lib/timesync';

const clientSideEmotionCache = createEmotionCache();

function CustomApp({
  Component,
  pageProps,
  emotionCache = clientSideEmotionCache
}: AppProps & { emotionCache: EmotionCache }) {
  const [offset, setOffset] = useState<number>(0);

  const timesync = create({
    server: getApiBase() + '/timesync',
    delay: 1000,
    interval: 5 * 60 * 1000,
    peers: undefined,
    repeat: 1,
    timeout: 1000
  });

  useEffect(() => {
    timesync.on('change', (newOffset: number) => {
      setOffset(newOffset);
    });

    return () => {
      timesync.off('change');
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <CacheProvider value={emotionCache}>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta name="theme-color" content="#fff" />
        <title>מערכת אירועים - FIRST ישראל</title>
      </Head>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <SnackbarProvider maxSnack={3} TransitionComponent={Grow}>
          <TimeSyncContext.Provider value={{ offset }}>
            <main className="app">
              <RouteAuthorizer>
                <Component {...pageProps} />
              </RouteAuthorizer>
            </main>
          </TimeSyncContext.Provider>
        </SnackbarProvider>
      </ThemeProvider>
    </CacheProvider>
  );
}

export default CustomApp;
