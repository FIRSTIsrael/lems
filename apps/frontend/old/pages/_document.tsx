import {
  DocumentHeadTags,
  DocumentHeadTagsProps,
  documentGetInitialProps,
  createEmotionCache
} from '@mui/material-nextjs/v15-pagesRouter';
import { Html, Head, Main, NextScript, DocumentProps, DocumentContext } from 'next/document';
import { Locales, Locale, getEmotionCacheOptions } from '@lems/localization';
import { baseTheme } from '../lib/theme';

export default function LEMSDocument(props: DocumentProps & DocumentHeadTagsProps) {
  const locale = props.locale || 'he'; // Default to Hebrew if no locale is provided
  const dir = Locales[locale as Locale].direction;

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

LEMSDocument.getInitialProps = async (ctx: DocumentContext) => {
  const locale = ctx.locale || 'he'; // Default to Hebrew if no locale is provided
  const emotionCacheOptions = getEmotionCacheOptions(locale as Locale);
  const emotionCache = createEmotionCache(emotionCacheOptions);
  const finalProps = await documentGetInitialProps(ctx, {
    emotionCache
  });
  return finalProps;
};
