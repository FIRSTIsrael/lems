import React from 'react';
import type {
  AppContextType,
  AppInitialProps,
  AppPropsType,
  NextComponentType
} from 'next/dist/shared/lib/utils';
import Document, { Html, Head, Main, NextScript, DocumentContext } from 'next/document';
import { EmotionCache } from '@emotion/react';
import createEmotionServer from '@emotion/server/create-instance';
import { createEmotionCache } from '../lib/emotion-cache';
import theme from '../lib/theme';

type EnhancedApp = NextComponentType<
  AppContextType,
  AppInitialProps | Record<string, never>,
  AppPropsType & { emotionCache?: EmotionCache }
>;

export default class FIRSTDocument extends Document {
  static async getInitialProps(ctx: DocumentContext) {
    const originalRenderPage = ctx.renderPage;

    const cache = createEmotionCache();
    const { extractCriticalToChunks } = createEmotionServer(cache);

    ctx.renderPage = () =>
      originalRenderPage({
        // eslint-disable-next-line react/display-name
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
    return (
      <Html lang="en">
        <Head>
          <link
            rel="stylesheet"
            href="https://fonts.googleapis.com/css?family=Roboto:300,400,500,700&display=swap"
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
