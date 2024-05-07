import express, { Request, Response } from 'express';
import { ObjectId } from 'mongodb';
import fileUpload from 'express-fileupload';
import asyncHandler from 'express-async-handler';
import * as db from '@lems/database';
import { getEventUsers } from '../../../../lib/schedule/division-users';
import { getEventRubrics } from '../../../../lib/schedule/division-rubrics';
import {
  parseEventData,
  parseSessionsAndMatches,
  getInitialEventState
} from '../../../../lib/schedule/parser';
import { getEventScoresheets } from '../../../../lib/schedule/division-scoresheets';
import { cleanEventData } from '../../../../lib/schedule/cleaner';

const router = express.Router({ mergeParams: true });

router.post(
  '/parse',
  fileUpload(),
  asyncHandler(async (req: Request, res: Response) => {
    const division = await db.getEvent({ _id: new ObjectId(req.params.divisionId) });
    const divisionState = await db.getEventState({ divisionId: division._id });
    if (divisionState) {
      res.status(400).json({ error: 'Could not parse schedule: Event has data' });
      return;
    }

    try {
      console.log('👓 Parsing file...');
      const timezone = req.body.timezone;
      const csvData = (req.files.file as fileUpload.UploadedFile)?.data.toString();

      const { teams, tables, rooms } = parseEventData(division, csvData);

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

      const dbTeams = await db.getEventTeams(division._id);
      const dbTables = await db.getEventTables(division._id);
      const dbRooms = await db.getEventRooms(division._id);

      console.log('📄 Parsing schedule');

      const { matches, sessions } = parseSessionsAndMatches(
        csvData,
        division,
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

      const dbMatches = await db.getEventMatches(division._id.toString());

      console.log('📄 Generating rubrics');
      const rubrics = getEventRubrics(division, dbTeams);
      if (!(await db.addRubrics(rubrics)).acknowledged) {
        res.status(500).json({ error: 'Could not create rubrics!' });
        return;
      }
      console.log('✅ Generated rubrics');

      console.log('📄 Generating scoresheets');
      const scoresheets = getEventScoresheets(division, dbTeams, dbMatches);

      if (!(await db.addScoresheets(scoresheets)).acknowledged) {
        res.status(500).json({ error: 'Could not create scoresheets!' });
        return;
      }
      console.log('✅ Generated scoresheets!');

      console.log('👤 Generating division users');
      const users = getEventUsers(division, dbTables, dbRooms);
      if (!(await db.addUsers(users)).acknowledged) {
        res.status(500).json({ error: 'Could not create users!' });
        return;
      }
      console.log('✅ Generated division users');

      console.log('🔐 Creating division state');
      await db.addEventState(getInitialEventState(division));
      console.log('✅ Created division state');

      await db.updateEvent({ _id: division._id }, { hasState: true });

      res.status(200).json({ ok: true });
    } catch (error) {
      console.log('❌ Error parsing schedule');
      console.log(error);
      await cleanEventData(division);
      console.log('✅ Deleted division data!');
      res.status(500).json({ error: 'INTERNAL_SERVER_ERROR' });
    }
  })
);

router.post('/generate', (req: Request, res: Response) => {
  res.status(501).json({ error: 'NOT_IMPLEMENTED' });
});

export default router;
