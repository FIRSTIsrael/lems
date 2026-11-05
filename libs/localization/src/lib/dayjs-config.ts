import dayjs from 'dayjs';
import 'dayjs/locale/he';
import 'dayjs/locale/en';
import 'dayjs/locale/pl';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import isBetween from 'dayjs/plugin/isBetween';
import { Locale, Locales } from './locales';

export const configureDayjs = (locale: Locale) => {
  dayjs.locale(Locales[locale].dayjsLocale);
  dayjs.extend(utc);
  dayjs.extend(timezone);
  dayjs.extend(isBetween);
};
