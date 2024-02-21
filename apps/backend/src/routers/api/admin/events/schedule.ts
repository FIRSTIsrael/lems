import express, { Request, Response } from 'express';
import { ObjectId } from 'mongodb';
import fileUpload from 'express-fileupload';
import asyncHandler from 'express-async-handler';
import * as db from '@lems/database';
import { getEventUsers } from '../../../../lib/schedule/event-users';
import { getEventRubrics } from '../../../../lib/schedule/event-rubrics';
import {
  parseEventData,
  parseSessionsAndMatches,
  getInitialEventState
} from '../../../../lib/schedule/parser';
import { getEventScoresheets } from '../../../../lib/schedule/event-scoresheets';
import { cleanEventData } from '../../../../lib/schedule/cleaner';

const router = express.Router({ mergeParams: true });

router.post(
  '/parse',
  fileUpload(),
  asyncHandler(async (req: Request, res: Response) => {
    const event = await db.getEvent({ _id: new ObjectId(req.params.eventId) });
    const eventState = await db.getEventState({ eventId: event._id });
    if (eventState) {
      res.status(400).json({ error: 'Could not parse schedule: Event has data' });
      return;
    }

    try {
      console.log('👓 Parsing file...');
      const timezone = req.body.timezone;
      const csvData = (req.files.file as fileUpload.UploadedFile)?.data.toString();

      const { teams, tables, rooms } = parseEventData(event, csvData);

      console.log('📄 Inserting teams, tables, and rooms');

      if (!(await db.addTeams(teams)).acknowledged) {
        res.status(500).json({ error: 'Could not insert teams!' });
        return;
      }
      if (!(await db.addTables(tables)).acknowledged) {
        res.status(500).json({ error: 'Could not insert tables!' });
        return;
      }
      if (!(await db.addRooms(rooms)).acknowledged) {
        res.status(500).json({ error: 'Could not insert rooms!' });
        return;
      }

      const dbTeams = await db.getEventTeams(event._id);
      const dbTables = await db.getEventTables(event._id);
      const dbRooms = await db.getEventRooms(event._id);

      console.log('📄 Parsing schedule');

      const { matches, sessions } = parseSessionsAndMatches(
        csvData,
        event,
        dbTeams,
        dbTables,
        dbRooms,
        timezone
      );

      if (!(await db.addSessions(sessions)).acknowledged) {
        res.status(500).json({ error: 'Could not insert sessions!' });
        return;
      }
      if (!(await db.addMatches(matches)).acknowledged) {
        res.status(500).json({ error: 'Could not insert matches!' });
        return;
      }

      console.log('✅ Finished parsing schedule!');

      const dbMatches = await db.getEventMatches(event._id.toString());

      console.log('📄 Generating rubrics');
      const rubrics = getEventRubrics(event, dbTeams);
      if (!(await db.addRubrics(rubrics)).acknowledged) {
        res.status(500).json({ error: 'Could not create rubrics!' });
        return;
      }
      console.log('✅ Generated rubrics');

      console.log('📄 Generating scoresheets');
      const scoresheets = getEventScoresheets(event, dbTeams, dbMatches);

      if (!(await db.addScoresheets(scoresheets)).acknowledged) {
        res.status(500).json({ error: 'Could not create scoresheets!' });
        return;
      }
      console.log('✅ Generated scoresheets!');

      console.log('👤 Generating event users');
      const users = getEventUsers(event, dbTables, dbRooms);
      if (!(await db.addUsers(users)).acknowledged) {
        res.status(500).json({ error: 'Could not create users!' });
        return;
      }
      console.log('✅ Generated event users');

      console.log('🔐 Creating event state');
      await db.addEventState(getInitialEventState(event));
      console.log('✅ Created event state');

      await db.updateEvent({ _id: event._id }, { hasState: true });

      res.status(200).json({ ok: true });
    } catch (error) {
      console.log('❌ Error parsing schedule');
      console.log(error);
      await cleanEventData(event);
      console.log('✅ Deleted event data!');
      res.status(500).json({ error: 'INTERNAL_SERVER_ERROR' });
    }
  })
);

router.post('/generate', (req: Request, res: Response) => {
  res.status(501).json({ error: 'NOT_IMPLEMENTED' });
});

export default router;
