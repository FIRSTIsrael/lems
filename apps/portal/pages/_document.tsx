import {
  DocumentHeadTags,
  DocumentHeadTagsProps,
  documentGetInitialProps,
  createEmotionCache
} from '@mui/material-nextjs/v15-pagesRouter';
import { prefixer } from 'stylis';
import rtlPlugin from '@mui/stylis-plugin-rtl';
import { Html, Head, Main, NextScript, DocumentProps, DocumentContext } from 'next/document';
import theme from '../lib/theme';
export default function PortalDocument(props: DocumentProps & DocumentHeadTagsProps) {
  return (
    <Html lang="he" dir="rtl">
      <Head>
        <meta name="theme-color" content={theme.palette.primary.main} />
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
  const emotionCache = createEmotionCache({
    key: 'mui',
    stylisPlugins: [prefixer, rtlPlugin]
  });
  const finalProps = await documentGetInitialProps(ctx, {
    emotionCache
  });
  return finalProps;
};
