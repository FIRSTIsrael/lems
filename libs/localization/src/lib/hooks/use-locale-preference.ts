import { useCallback, useMemo } from 'react';
import { useRouter } from 'next/router';
import { Locale } from '../locales';

const LOCALE_COOKIE_NAME = 'NEXT_LOCALE';
const LOCALE_COOKIE_MAX_AGE = 60 * 60 * 24 * 365; // 1 year in seconds

/**
 * Custom hook to manage locale preferences using NextJS's NEXT_LOCALE cookie.
 * @returns An object containing the current locale, a function to change the locale, and a function to reset the locale.
 */
export function useLocalePreference() {
  const router = useRouter();

  const changeLocale = useCallback(
    (newLocale: Locale) => {
      if (typeof document !== 'undefined') {
        document.cookie = `${LOCALE_COOKIE_NAME}=${newLocale}; path=/; max-age=${LOCALE_COOKIE_MAX_AGE}; SameSite=Lax`;
      }
      router.push(router.asPath, router.asPath, { locale: newLocale });
    },
    [router]
  );

  const resetLocale = useCallback((): void => {
    if (typeof document !== 'undefined') {
      document.cookie = `${LOCALE_COOKIE_NAME}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
    }
  }, []);

  return useMemo(
    () => ({
      changeLocale,
      resetLocale,
      currentLocale: (router.locale ?? 'he') as Locale
    }),
    [changeLocale, resetLocale, router.locale]
  );
}
