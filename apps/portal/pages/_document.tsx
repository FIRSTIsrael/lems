import {
  DocumentHeadTags,
  DocumentHeadTagsProps,
  documentGetInitialProps
} from '@mui/material-nextjs/v15-pagesRouter';
import { Html, Head, Main, NextScript, DocumentProps, DocumentContext } from 'next/document';
import { createCustomEmotionCache } from '../lib/emotion-cache';
import { baseTheme } from '../lib/theme';
import PortalLocales, { Locales } from '../locale/locales';

export default function PortalDocument(props: DocumentProps & DocumentHeadTagsProps) {
  const locale = props.locale || 'he'; // Default to Hebrew if no locale is provided
  const dir = PortalLocales[locale as Locales].direction;

  return (
    <Html lang={locale} dir={dir}>
      <Head>
        <meta name="theme-color" content={baseTheme.palette.primary.main} />
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
        <meta name="emotion-insertion-point" content="" />
        <DocumentHeadTags {...props} />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}

PortalDocument.getInitialProps = async (ctx: DocumentContext) => {
  const locale = ctx.locale || 'he'; // Default to Hebrew if no locale is provided
  const emotionCache = createCustomEmotionCache(locale as Locales);
  const finalProps = await documentGetInitialProps(ctx, {
    emotionCache
  });
  return finalProps;
};
