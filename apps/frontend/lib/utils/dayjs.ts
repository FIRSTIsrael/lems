import dayjs, { Dayjs } from 'dayjs';
import 'dayjs/locale/he';

dayjs.locale('he');

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
