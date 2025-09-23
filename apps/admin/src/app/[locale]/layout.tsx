import type { Metadata, Viewport } from 'next';
import { NextIntlClientProvider, hasLocale } from 'next-intl';
import { notFound } from 'next/navigation';
import { Roboto, Heebo } from 'next/font/google';
import { Locales, configureDayjs } from '@lems/localization';
import { SWRProvider } from '@lems/shared';
import { routing } from '../../i18n/routing';
import { MuiProvider } from './mui-provider';

export const metadata: Metadata = {
  title: 'Admin Portal: FIRST LEGO League Challenge IL',
  description: 'Admin Dashboard for FIRST LEGO League Challenge events in Israel'
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1.0,
  themeColor: '#003d6a',
  colorScheme: 'light'
};

const heebo = Heebo({
  subsets: ['latin', 'hebrew'],
  display: 'swap',
  variable: '--font-heebo'
});

const roboto = Roboto({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-roboto'
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

  configureDayjs(locale);

  const dir = Locales[locale].direction as 'ltr' | 'rtl';

  return (
    <html lang={locale} dir={dir} className={`${heebo.variable} ${roboto.variable}`}>
      <body>
        <NextIntlClientProvider>
          <SWRProvider>
            <MuiProvider locale={locale}>{children}</MuiProvider>
          </SWRProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
