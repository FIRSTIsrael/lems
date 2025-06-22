import { AppProps } from 'next/app';
import Head from 'next/head';
import { SnackbarProvider } from 'notistack';
import { CssBaseline, Grow, ThemeProvider } from '@mui/material';
import { AppCacheProvider } from '@mui/material-nextjs/v15-pagesRouter';
import '../lib/utils/dayjs';
import theme from '../lib/theme';
import SnackbarCloseButton from '../components/general/snackbar-close-button';
import { TimeSyncProvider } from '../lib/timesync';

export default function LEMSApp(props: AppProps) {
  const { Component, pageProps } = props;

  return (
    <AppCacheProvider {...props}>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta name="theme-color" content="#fff" />
        <meta
          name="description"
          content="מערכת האירועים של FIRST ישראל לתוכנית FIRST LEGO League Challenge"
        />
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
            <Component {...pageProps} />
          </TimeSyncProvider>
        </SnackbarProvider>
      </ThemeProvider>
    </AppCacheProvider>
  );
}
