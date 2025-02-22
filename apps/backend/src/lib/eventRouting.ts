import { ObjectId } from 'mongodb';
import { db } from '@lems/database';
import { FllEvent, PortalDivision } from '@lems/types';

export const getEventRoute = async (eventId: string, divisionId?: string): Promise<string> => {
  const event = await db.collection<FllEvent>('fll-events').findOne({ _id: new ObjectId(eventId) });
  if (!event) throw new Error('Event not found');

  const year = new Date(event.startDate).getFullYear();

  const count = await db.collection<FllEvent>('fll-events').countDocuments({
    eventType: event.eventType,
    startDate: { $lt: event.startDate },
  });

  let formattedRoute = `${year}${event.eventType}${count + 1}`;

  if (event.enableDivisions && divisionId) {
    const divisions = await db.collection<PortalDivision>('divisions')
      .find({ eventId: new ObjectId(eventId) })
      .sort({ _id: 1 }) // Sort by _id to maintain order
      .toArray();

    const divisionIndex = divisions.findIndex(div => div.id === divisionId);
    if (divisionIndex !== -1) {
      const letterSuffix = String.fromCharCode(97 + divisionIndex);
      formattedRoute += letterSuffix;
    }
  }

  return formattedRoute;
}