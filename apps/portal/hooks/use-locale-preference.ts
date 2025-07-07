import { useRouter } from 'next/router';
import { Locales } from '../locale/locales';

const LOCALE_COOKIE_NAME = 'NEXT_LOCALE';
const LOCALE_COOKIE_MAX_AGE = 60 * 60 * 24 * 365; // 1 year in seconds

export function useLocalePreference() {
  const router = useRouter();

  const changeLocale = (newLocale: Locales) => {
    if (typeof document !== 'undefined') {
      document.cookie = `${LOCALE_COOKIE_NAME}=${newLocale}; path=/; max-age=${LOCALE_COOKIE_MAX_AGE}; SameSite=Lax`;
    }
    router.push(router.asPath, router.asPath, { locale: newLocale });
  };

  const resetLocale = (): void => {
    if (typeof document !== 'undefined') {
      document.cookie = `${LOCALE_COOKIE_NAME}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
    }
  };

  return {
    changeLocale,
    resetLocale,
    currentLocale: (router.locale ?? 'he') as Locales
  };
}
