import { ObjectId } from 'mongodb';
import { db } from '@lems/database';
import { FllEvent, Division } from '@lems/types';

type EventType = "rg" | "ch" | "ps" | "os" | "otc";

const eventTypeMappings: Record<string, EventType> = {
  'מוקדמות': "rg",
  "אליפות": "ch",
  "Pre-Season": "ps",
  "Off-Season": "os",
  "אחר": "otc"
}

export const getEventRoute = async (eventId: string, divisionId?: string): Promise<string> => {
  const event = await db.collection<FllEvent>('fll-events').findOne({ _id: new ObjectId(eventId) });
  if (!event) throw new Error('Event not found');

  const year = new Date(event.startDate).getFullYear();

  const count = await db.collection<FllEvent>('fll-events').countDocuments({
    eventType: event.eventType,
    startDate: { $lt: event.startDate },
  });

  const eventType = eventTypeMappings[event.eventType];

  let formattedRoute = `${year}${eventType}${count + 1}`;

  if (event.enableDivisions && divisionId) {
    const divisions = await db.collection<Division>('divisions')
      .find({ eventId: new ObjectId(eventId) })
      .sort({ _id: 1 }) // Sort by _id to maintain order
      .toArray();

    const divisionIndex = divisions.findIndex(div => div._id.toString() === divisionId);
    if (divisionIndex !== -1) {
      const letterSuffix = String.fromCharCode(97 + divisionIndex);
      formattedRoute += letterSuffix;
    }
  }

  return formattedRoute;
}