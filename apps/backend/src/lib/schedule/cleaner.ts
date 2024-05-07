import { WithId } from 'mongodb';
import * as db from '@lems/database';
import { Event, JudgingRoom, Team } from '@lems/types';

export const cleanEventData = async (division: WithId<Event>) => {
  if (!(await db.deleteEventUsers(division._id)).acknowledged)
    throw new Error('Could not delete users!');

  const oldEventState = await db.getEventStateFromEvent(division._id);
  if (oldEventState) {
    if (!(await db.deleteEventState(oldEventState)).acknowledged)
      throw new Error('Could not delete division state!');
  }

  const oldRooms = await db.getEventRooms(division._id);
  const oldTeams = await db.getEventTeams(division._id);

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

  if (!(await db.deleteEventTeams(division._id)).acknowledged)
    throw new Error('Could not delete teams!');
  if (!(await db.deleteEventTables(division._id)).acknowledged)
    throw new Error('Could not delete tables!');
  if (!(await db.deleteEventRooms(division._id)).acknowledged)
    throw new Error('Could not delete rooms!');
  if (!(await db.deleteEventMatches(division._id)).acknowledged)
    throw new Error('Could not delete matches!');
  if (!(await db.deleteEventUsers(division._id)).acknowledged)
    throw new Error('Could not delete users!');
  if (!(await db.deleteEventAwards(division._id)).acknowledged)
    throw new Error('Could not delete awards!');
  if (!(await db.deleteEventTickets(division._id)).acknowledged)
    throw new Error('Could not delete tickets!');
};
