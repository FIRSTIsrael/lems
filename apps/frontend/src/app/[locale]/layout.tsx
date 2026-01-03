import type { Metadata, Viewport } from 'next';
import { NextIntlClientProvider, hasLocale } from 'next-intl';
import { notFound } from 'next/navigation';
import { Roboto, Heebo } from 'next/font/google';
import { Locales, configureDayjs } from '@lems/localization';
import { SWRProvider } from '@lems/shared';
import { routing } from '../../i18n/routing';
import { ApolloClientProvider } from '../../lib/graphql/apollo-client-provider';
import { TimeSyncProvider } from './components/time-sync-provider';
import { MuiProvider } from './components/mui-provider';
import { LemsToaster } from './components/toaster';

export const metadata: Metadata = {
  title: 'LEMS - FIRST LEGO League Events Management System',
  description: 'Manage and organize your FIRST LEGO League events with ease using LEMS.'
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
      <head>
        <style>{`.recharts-wrapper * { outline: none; }`}</style>
      </head>
      <body>
        <TimeSyncProvider>
          <NextIntlClientProvider>
            <ApolloClientProvider>
              <SWRProvider>
                <MuiProvider locale={locale}>
                  {children}
                  <LemsToaster dir={dir} />
                </MuiProvider>
              </SWRProvider>
            </ApolloClientProvider>
          </NextIntlClientProvider>
        </TimeSyncProvider>
      </body>
    </html>
  );
}
