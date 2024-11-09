import { WithId } from 'mongodb';
import * as db from '@lems/database';
import { Division, JudgingRoom, Team } from '@lems/types';

export const cleanDivisionData = async (division: WithId<Division>) => {
  if (!(await db.deleteDivisionUsers(division._id)).acknowledged)
    throw new Error('Could not delete users!');

  const oldDivisionState = await db.getDivisionStateFromDivision(division._id);
  if (oldDivisionState) {
    if (!(await db.deleteDivisionState(oldDivisionState)).acknowledged)
      throw new Error('Could not delete division state!');
  }

  const oldRooms = await db.getDivisionRooms(division._id);
  const oldTeams = await db.getDivisionTeams(division._id);

  await Promise.all(
    oldRooms.map(async (room: WithId<JudgingRoom>) => {
      if (!(await db.deleteRoomSessions(room._id)).acknowledged)
        throw new Error('Could not delete sessions!');
    })
  );

  await Promise.all(
    oldTeams.map(async (team: WithId<Team>) => {
      if (!(await db.deleteTeamRubrics(team._id)).acknowledged)
        throw new Error('Could not delete rubrics!');
    })
  );

  await Promise.all(
    oldTeams.map(async (team: WithId<Team>) => {
      if (!(await db.deleteTeamScoresheets(team._id)).acknowledged)
        throw new Error('Could not delete teams!');
    })
  );

  if (!(await db.deleteDivisionTeams(division._id)).acknowledged)
    throw new Error('Could not delete teams!');
  if (!(await db.deleteDivisionTables(division._id)).acknowledged)
    throw new Error('Could not delete tables!');
  if (!(await db.deleteDivisionRooms(division._id)).acknowledged)
    throw new Error('Could not delete rooms!');
  if (!(await db.deleteDivisionMatches(division._id)).acknowledged)
    throw new Error('Could not delete matches!');
  if (!(await db.deleteDivisionUsers(division._id)).acknowledged)
    throw new Error('Could not delete users!');
  if (!(await db.deleteDivisionAwards(division._id)).acknowledged)
    throw new Error('Could not delete awards!');
  if (!(await db.deleteDivisionTickets(division._id)).acknowledged)
    throw new Error('Could not delete tickets!');
  if (!(await db.deleteDivisionDeliberations(division._id)).acknowledged)
    throw new Error('Could not delete deliberations!');
};
