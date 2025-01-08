import dayjs, { Dayjs } from 'dayjs';
import 'dayjs/locale/he';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import duration from 'dayjs/plugin/duration';
import minMax from 'dayjs/plugin/minMax';
import isBetween from 'dayjs/plugin/isBetween';

dayjs.locale('he');
dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(duration);
dayjs.extend(minMax);
dayjs.extend(isBetween);

export const stringifyTwoDates = (date1: Date | Dayjs, date2: Date | Dayjs) => {
  date1 = dayjs(date1);
  date2 = dayjs(date2);

  // One Day
  if (!date1.isValid() || date1.isSame(date2)) {
    return date1.format('D בMMMM YYYY');
  }

  // Several days
  if (date1.isSame(date2, 'month')) {
    return date1.format('D') + '-' + date2.format('D בMMMM YYYY');
  } else {
    return date1.format('D בMMMM') + ' - ' + date2.format('D בMMMM YYYY');
  }
};

export default dayjs;
