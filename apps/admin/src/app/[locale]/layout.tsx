import type { Metadata, Viewport } from 'next';
import { NextIntlClientProvider, hasLocale } from 'next-intl';
import { notFound } from 'next/navigation';
import { Roboto, Heebo } from 'next/font/google';
import { AppRouterCacheProvider } from '@mui/material-nextjs/v15-appRouter';
import { CssBaseline, ThemeProvider, createTheme } from '@mui/material';
import { Locale, Locales, rtlEmotionCache, ltrEmotionCache } from '@lems/localization';
import fontOptimizedTheme from '../../theme';
import { routing } from '../../i18n/routing';
import { baseTheme, getLocalizedTheme } from '../../../lib/theme';

export const metadata: Metadata = {
  title: 'ניהול אירועים - FIRST LEGO League Challenge',
  description: 'Admin Dashboard for FIRST LEGO League Challenge events'
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1.0,
  themeColor: baseTheme.palette.primary.main,
  colorScheme: 'light'
};

const heebo = Heebo({
  subsets: ['latin', 'hebrew'],
  display: 'swap'
});

const roboto = Roboto({
  subsets: ['latin'],
  display: 'swap'
});

interface RootLayoutProps {
  children: React.ReactNode;
  params: Promise<{ locale: Locale }>;
}

export default async function RootLayout({ children, params }: RootLayoutProps) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  const dir = Locales[locale].direction;
  const theme = createTheme(fontOptimizedTheme, getLocalizedTheme(locale));

  return (
    <html lang={locale} dir={dir} className={`${heebo.className} ${roboto.className}`}>
      <head>
        <meta name="emotion-insertion-point" content="" />
      </head>
      <body>
        <AppRouterCacheProvider options={dir === 'rtl' ? rtlEmotionCache : ltrEmotionCache}>
          <NextIntlClientProvider>
            <ThemeProvider theme={theme}>
              <CssBaseline />
              {children}
            </ThemeProvider>
          </NextIntlClientProvider>
        </AppRouterCacheProvider>
      </body>
    </html>
  );
}
