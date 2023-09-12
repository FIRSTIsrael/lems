import express, { NextFunction, Request, Response } from 'express';
import { ObjectId, WithId } from 'mongodb';
import fileUpload from 'express-fileupload';
import * as db from '@lems/database';
import { RobotGameTable, JudgingRoom } from '@lems/types';
import { getEventUsers } from '../../../../lib/schedule/event-users';
import { parseEventData, parseEventSchedule } from '../../../../lib/schedule/parser';
const router = express.Router({ mergeParams: true });

router.post('/parse', fileUpload(), async (req: Request, res: Response) => {
  console.log('👓 Parsing schedule...');
  const csvData = (req.files.file as fileUpload.UploadedFile)?.data.toString('utf8');
  const event = await db.getEvent({ _id: new ObjectId(req.params.eventId) });

  const oldTables = await db.getEventTables(event._id);
  const oldRooms = await db.getEventRooms(event._id);

  oldTables.forEach(async (table: WithId<RobotGameTable>) => {
    if (!(await db.deleteTableMatches(table._id)).acknowledged)
      return res.status(500).json({ error: 'Could not delete matches!' });
  });

  oldRooms.forEach(async (room: WithId<JudgingRoom>) => {
    if (!(await db.deleteRoomSessions(room._id)).acknowledged)
      return res.status(500).json({ error: 'Could not delete sessions!' });
  });

  if (!(await db.deleteEventTeams(event._id)).acknowledged)
    return res.status(500).json({ error: 'Could not delete teams!' });
  if (!(await db.deleteEventTables(event._id)).acknowledged)
    return res.status(500).json({ error: 'Could not delete tables!' });
  if (!(await db.deleteEventRooms(event._id)).acknowledged)
    return res.status(500).json({ error: 'Could not delete rooms!' });
  if (!(await db.deleteEventUsers(event._id)).acknowledged)
    return res.status(500).json({ error: 'Could not delete users!' });

  const { teams, tables, rooms } = await parseEventData(event, csvData);

  if (!(await db.addTeams(teams)).acknowledged)
    return res.status(500).json({ error: 'Could not insert teams!' });
  if (!(await db.addTables(tables)).acknowledged)
    return res.status(500).json({ error: 'Could not insert tables!' });
  if (!(await db.addRooms(rooms)).acknowledged)
    return res.status(500).json({ error: 'Could not insert rooms!' });

  const dbTeams = await db.getEventTeams(event._id);
  const dbTables = await db.getEventTables(event._id);
  const dbRooms = await db.getEventRooms(event._id);

  const { matches, sessions } = await parseEventSchedule(
    event,
    dbTeams,
    dbTables,
    dbRooms,
    csvData
  );

  if (!(await db.addSessions(sessions)).acknowledged)
    return res.status(500).json({ error: 'Could not insert sessions!' });

  if (!(await db.addMatches(matches)).acknowledged)
    return res.status(500).json({ error: 'Could not insert matches!' });

  console.log('✅ Finished parsing schedule!');

  console.log('👤 Generating event users');
  const users = getEventUsers(event, dbTables, dbRooms);
  if (!(await db.addUsers(users)).acknowledged)
    return res.status(500).json({ error: 'Could not create users!' });
  console.log('✅ Generated event users');

  return res.status(200).json({ ok: true });
});

router.post('/generate', (req: Request, res: Response) => {
  res.status(501).json({ error: 'NOT_IMPLEMENTED' });
});

export default router;
