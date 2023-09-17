import express, { NextFunction, Request, Response } from 'express';
import { ObjectId } from 'mongodb';
import fileUpload from 'express-fileupload';
import * as db from '@lems/database';
import { getEventUsers } from '../../../../lib/schedule/event-users';
import { getEventRubrics } from '../../../../lib/schedule/event-rubrics';
import { cleanEventData } from '../../../../lib/schedule/cleaner';
import { parseEventData, parseEventSchedule } from '../../../../lib/schedule/parser';
import { getEventScoresheets } from '../../../../lib/schedule/event-scoresheets';

const router = express.Router({ mergeParams: true });

router.post('/parse', fileUpload(), async (req: Request, res: Response) => {
  const event = await db.getEvent({ _id: new ObjectId(req.params.eventId) });

  console.log('🚮Deleting event data');
  try {
    await cleanEventData(event);
  } catch (error) {
    return res.status(500).json(error.message);
  }
  console.log('✅ Deleted event data!');

  console.log('👓 Parsing schedule...');
  const csvData = (req.files.file as fileUpload.UploadedFile)?.data.toString('utf8');

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

  const { matches, sessions, rounds } = await parseEventSchedule(
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

  console.log('📄Generating rubrics');
  const rubrics = getEventRubrics(dbTeams);
  if (!(await db.addRubrics(rubrics)).acknowledged)
    return res.status(500).json({ error: 'Could not create rubrics!' });
  console.log('✅Generated rubrics');

  console.log('📄 Generating scoresheets');
  const scoresheets = getEventScoresheets(dbTeams, rounds);
  if (!(await db.addScoresheets(scoresheets)).acknowledged)
    return res.status(500).json({ error: 'Could not create scoresheets!' });
  console.log('✅ Generated scoresheets!');

  console.log('👤 Generating event users');
  const users = getEventUsers(event, dbTables, dbRooms);
  if (!(await db.addUsers(users)).acknowledged)
    return res.status(500).json({ error: 'Could not create users!' });
  console.log('✅ Generated event users');

  console.log('🔐Creating event state');
  await db.addEventState({ activeMatch: 0, activeSession: 0, event: event._id });
  console.log('✅Created event state');

  return res.status(200).json({ ok: true });
});

router.post('/generate', (req: Request, res: Response) => {
  res.status(501).json({ error: 'NOT_IMPLEMENTED' });
});

export default router;
