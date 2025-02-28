import { db } from '@lems/database';
import { FllEvent } from '@lems/types';
import dayjs from 'dayjs';

type EventType = "rg" | "ch" | "ps" | "os" | "otc";

const eventTypeMappings: Record<string, EventType> = {
  'מוקדמות': "rg",
  "אליפות": "ch",
  "Pre-Season": "ps",
  "Off-Season": "os",
  "אחר": "otc"
}

export const getEventRoute = async (Type: string, startDate: Date, divisionIndex?: number, isOnlyDivision?: boolean): Promise<string> => {
  const year = dayjs(startDate).year();

  const count = await db.collection<FllEvent>('fll-events').countDocuments({
    eventType: Type,
    startDate: {
      $gte: dayjs().startOf('year').toDate(),
      $lte: dayjs(startDate).toDate()
    },
  });

  const eventType = eventTypeMappings[Type];

  let formattedRoute = `${year}${eventType}${count}`;
  if (divisionIndex === undefined) {
    formattedRoute = `${year}${eventType}${count + 1}`;
  }
  else if (!isOnlyDivision) {
    const letterSuffix = String.fromCharCode(97 + divisionIndex);
    formattedRoute += letterSuffix;
  }

  return formattedRoute;
}