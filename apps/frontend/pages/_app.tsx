import { AppProps } from 'next/app';
import Head from 'next/head';
import { CssBaseline, Grow, ThemeProvider } from '@mui/material';
import { CacheProvider, EmotionCache } from '@emotion/react';
import theme from '../lib/theme';
import { RouteAuthorizer } from '../components/route-authorizer';
import { createEmotionCache } from '../lib/emotion-cache';
import { SnackbarProvider } from 'notistack';
import { Fragment } from "react";
import { NextPage } from "next";
import AdminLayout from "./admin/layout";

const clientSideEmotionCache = createEmotionCache();

export type NextPageWithLayout<P = object, IP = P> = NextPage<P, IP> & {
  layout?: string
}

type AppPropsWithLayout = AppProps & {
  Component: NextPageWithLayout
}

function CustomApp({
  Component,
  pageProps,
  emotionCache = clientSideEmotionCache
}: AppPropsWithLayout & { emotionCache: EmotionCache }) {
  const Layout = Component.layout === 'admin' ? AdminLayout : Fragment;

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
          <main className="app">
            <RouteAuthorizer>
              <Layout>
                <Component {...pageProps} />
              </Layout>
            </RouteAuthorizer>
          </main>
        </SnackbarProvider>
      </ThemeProvider>
    </CacheProvider>
  );
}

export default CustomApp;
