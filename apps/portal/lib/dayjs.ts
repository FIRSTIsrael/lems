import dayjs from 'dayjs';
import 'dayjs/locale/he';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

dayjs.locale('he');
dayjs.extend(utc);
dayjs.extend(timezone);

export default dayjs;
