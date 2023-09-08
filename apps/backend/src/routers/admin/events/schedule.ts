import express, { NextFunction, Request, Response } from 'express';
import { ObjectId } from 'mongodb';
import fileUpload from 'express-fileupload';
import * as db from '@lems/database';
import { getEventUsers } from '../../../lib/schedule/event-users';
import { parseEventData, parseEventSchedule } from '../../../lib/schedule/parser';
const router = express.Router({ mergeParams: true });

router.post('/parse', fileUpload(), async (req: Request, res: Response) => {
  console.log('👓 Parsing schedule...');
  const csvData = (req.files.file as fileUpload.UploadedFile)?.data.toString('utf8');
  const event = await db.getEvent({ _id: new ObjectId(req.params.eventId) });
  const { teams, tables, rooms } = await parseEventData(event, csvData);

  if (!(await db.replaceEventTeams(event._id, teams)).acknowledged)
    return res.status(500).json({ error: 'Could not insert teams!' });
  if (!(await db.replaceEventTables(event._id, tables)).acknowledged)
    return res.status(500).json({ error: 'Could not insert tables!' });
  if (!(await db.replaceEventRooms(event._id, rooms)).acknowledged)
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

  if (!(await db.replaceEventMatches(event._id, matches)).acknowledged)
    return res.status(500).json({ error: 'Could not insert matches!' });
  if (!(await db.replaceEventSessions(event._id, sessions)).acknowledged)
    return res.status(500).json({ error: 'Could not insert sessions!' });

  console.log('✅ Finished parsing schedule!');

  console.log('👤 Generating event users');
  const users = await getEventUsers(event, dbTables, dbRooms);
  if (!(await db.replaceEventUsers(event._id, users)).acknowledged)
    return res.status(500).json({ error: 'Could not create users!' });
  console.log('✅ Generated event users');
  return res.status(200).json({ ok: true });
});

router.post('/generate', (req: Request, res: Response) => {
  res.status(501).json({ error: 'NOT_IMPLEMENTED' });
});

export default router;
