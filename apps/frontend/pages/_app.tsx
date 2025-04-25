import { AppProps } from 'next/app';
import Head from 'next/head';
import { IntlProvider } from 'react-intl';
import { SnackbarProvider } from 'notistack';
import { CssBaseline, Grow, ThemeProvider } from '@mui/material';
import { CacheProvider } from '@emotion/react';
import type { EmotionCache } from '@emotion/cache';
import messages from '../lang/he_IL.json';
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
        <meta
          name="description"
          content="מערכת האירועים של FIRST ישראל לתוכנית FIRST LEGO League Challenge"
        />
        <title>מערכת אירועים - FIRST ישראל</title>
      </Head>
      {/* TODO: Fix typing */}
      <IntlProvider locale="he-IL" messages={messages as any}>
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
      </IntlProvider>
    </CacheProvider>
  );
}

export default CustomApp;
