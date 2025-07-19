import type { Metadata, Viewport } from 'next';
import { NextIntlClientProvider, hasLocale } from 'next-intl';
import { notFound } from 'next/navigation';
import { Roboto, Heebo } from 'next/font/google';
import { Locales } from '@lems/localization';
import { routing } from '../../i18n/routing';
import { baseTheme } from '../../../lib/theme';
import { MuiProvider } from './mui-provider';

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
  params: Promise<{ locale: string }>;
}

export default async function RootLayout({ children, params }: RootLayoutProps) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  const dir = Locales[locale].direction as 'ltr' | 'rtl';

  return (
    <html lang={locale} dir={dir} className={`${heebo.className} ${roboto.className}`}>
      <body>
        <NextIntlClientProvider>
          <MuiProvider locale={locale}>{children}</MuiProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
