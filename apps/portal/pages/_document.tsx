import {
  DocumentHeadTags,
  DocumentHeadTagsProps,
  documentGetInitialProps
} from '@mui/material-nextjs/v15-pagesRouter';
import { Html, Head, Main, NextScript, DocumentProps, DocumentContext } from 'next/document';

export default function PortalDocument(props: DocumentProps & DocumentHeadTagsProps) {
  return (
    <Html lang="en">
      <Head>
        <DocumentHeadTags {...props} />
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
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}

PortalDocument.getInitialProps = async (ctx: DocumentContext) => {
  const finalProps = await documentGetInitialProps(ctx);
  return finalProps;
};
