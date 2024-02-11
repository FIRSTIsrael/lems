import { WithId } from 'mongodb';
import { Team } from '@lems/types';
import * as db from '@lems/database';

export const getEventIdBySalesforceIdAndTeamNumber = async (
  salesforceId: string,
  teamNumber: number
) => {
  const events = await db.getEvents({ salesforceId });
  const eventTeams = await Promise.all(events.map(e => db.getEventTeams(e._id)));
  const allEventTeams: Array<WithId<Team>> = eventTeams.reduce((acc, arr) => acc.concat(arr));
  const team = allEventTeams.find(t => t.number === teamNumber);
  return team.eventId;
};
