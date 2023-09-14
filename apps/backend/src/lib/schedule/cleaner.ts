import { WithId } from 'mongodb';
import * as db from '@lems/database';
import { Event, RobotGameTable, JudgingRoom, Team } from '@lems/types';

export const cleanEventData = async (event: WithId<Event>) => {
  const oldTables = await db.getEventTables(event._id);
  const oldRooms = await db.getEventRooms(event._id);
  const oldTeams = await db.getEventTeams(event._id);

  await Promise.all(
    oldTables.map(async (table: WithId<RobotGameTable>) => {
      if (!(await db.deleteTableMatches(table._id)).acknowledged)
        throw new Error('Could not delete matches!');
    })
  );

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

  if (!(await db.deleteEventTeams(event._id)).acknowledged)
    throw new Error('Could not delete teams!');
  if (!(await db.deleteEventTables(event._id)).acknowledged)
    throw new Error('Could not delete tables!');
  if (!(await db.deleteEventRooms(event._id)).acknowledged)
    throw new Error('Could not delete rooms!');
  if (!(await db.deleteEventUsers(event._id)).acknowledged)
    throw new Error('Could not delete users!');
};
