import React from 'react';
import type {
  AppContextType,
  AppInitialProps,
  AppPropsType,
  NextComponentType
} from 'next/dist/shared/lib/utils';
import Document, { Html, Head, Main, NextScript, DocumentContext } from 'next/document';
// For some reason, EmotionCache import is not recognized
// eslint-disable-next-line import/named
import { EmotionCache } from '@emotion/react';
import createEmotionServer from '@emotion/server/create-instance';
import { createEmotionCache } from '../lib/emotion-cache';
import getLocalizedTheme from '../lib/theme';
import { Locales } from '../locale/locales';

type EnhancedApp = NextComponentType<
  AppContextType,
  AppInitialProps | Record<string, never>,
  AppPropsType & { emotionCache?: EmotionCache }
>;

export default class FIRSTDocument extends Document {
  static async getInitialProps(ctx: DocumentContext) {
    const originalRenderPage = ctx.renderPage;

    const locale = ctx.locale as Locales | undefined;
    const cache = createEmotionCache(locale);
    const { extractCriticalToChunks } = createEmotionServer(cache);

    ctx.renderPage = () =>
      originalRenderPage({
        enhanceApp: (App: EnhancedApp) => props => <App emotionCache={cache} {...props} />
      });

    const initialProps = await Document.getInitialProps(ctx);
    const emotionStyles = extractCriticalToChunks(initialProps.html);
    const emotionStyleTags = emotionStyles.styles.map(style => (
      <style
        data-emotion={`${style.key} ${style.ids.join(' ')}`}
        key={style.key}
        dangerouslySetInnerHTML={{ __html: style.css }}
      />
    ));

    return {
      ...initialProps,
      styles: [...React.Children.toArray(initialProps.styles), ...emotionStyleTags]
    };
  }
  render() {
    // Next.js document props include __NEXT_DATA__ with locale information
    const locale = (this.props.__NEXT_DATA__ as { locale?: string })?.locale as Locales | undefined;
    const theme = getLocalizedTheme(locale);

    return (
      <Html>
        <Head>
          <link
            rel="stylesheet"
            href="https://fonts.googleapis.com/css?family=Roboto:300,400,500,700&display=swap"
          />
          <link
            rel="stylesheet"
            href="https://fonts.googleapis.com/css?family=Roboto+Mono:300,400,500,700&display=swap"
          />
          <link
            href="https://fonts.googleapis.com/css2?family=Heebo:wght@300;400;500;700;800&display=swap"
            rel="stylesheet"
          />
        </Head>
        <body dir={theme.direction}>
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}
