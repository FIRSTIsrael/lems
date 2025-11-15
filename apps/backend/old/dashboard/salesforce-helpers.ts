import { WithId } from 'mongodb';
import { FllEvent, Team } from '@lems/types';
import * as db from '@lems/database';

export const getDivisionByEventAndTeamNumber = async (
  event: WithId<FllEvent>,
  teamNumber: number
) => {
  const divisions = await db.getEventDivisions(event._id);
  const divisionTeams = await Promise.all(divisions.map(e => db.getDivisionTeams(e._id)));
  const allDivisionTeams: Array<WithId<Team>> = divisionTeams.reduce((acc, arr) => acc.concat(arr));
  const team = allDivisionTeams.find(t => t.number === teamNumber);
  return divisions.find(e => e._id.toString() === team.divisionId.toString());
};
