import { WithId } from 'mongodb';
import { Team } from '@lems/types';
import * as db from '@lems/database';

export const getEventBySalesforceIdAndTeamNumber = async (
  salesforceId: string,
  teamNumber: number
) => {
  const divisions = await db.getEvents({ salesforceId });
  const divisionTeams = await Promise.all(divisions.map(e => db.getEventTeams(e._id)));
  const allEventTeams: Array<WithId<Team>> = divisionTeams.reduce((acc, arr) => acc.concat(arr));
  const team = allEventTeams.find(t => t.number === teamNumber);
  return divisions.find(e => e._id.toString() === team.divisionId.toString());
};
