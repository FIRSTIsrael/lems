import { defineRouting } from 'next-intl/routing';

export const routing = defineRouting({
  // A list of all locales that are supported
  locales: ['he', 'en', 'pl'],
  localePrefix: 'never',

  // TODO: We should use this but since the library uses a context
  // hook somewhere this errors on the server side.
  // locales: Object.keys(Locales),

  // Used when no locale matches
  defaultLocale: 'he',

  localeCookie: {
    name: 'LEMS_LOCALE',
    maxAge: 60 * 60 * 24 * 365
  }
});
