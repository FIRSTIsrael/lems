import dayjs from 'dayjs';
import { Locale, Locales } from './locales';

import 'dayjs/locale/he';
import 'dayjs/locale/en';

export const configureDayjs = (locale: Locale) => {
  dayjs.locale(Locales[locale].dayjsLocale);
};
