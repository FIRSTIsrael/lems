import { Locales } from '@lems/localization';
import { defineRouting } from 'next-intl/routing';

export const routing = defineRouting({
  // A list of all locales that are supported
  locales: Object.keys(Locales),

  // Used when no locale matches
  defaultLocale: 'he',

  localeCookie: {
    name: 'LEMS_LOCALE',
    maxAge: 60 * 60 * 24 * 365
  }
});
