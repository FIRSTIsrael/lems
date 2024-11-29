import express, { Request, Response } from 'express';
import { ObjectId } from 'mongodb';
import fileUpload from 'express-fileupload';
import asyncHandler from 'express-async-handler';
import * as db from '@lems/database';
import { getDivisionUsers } from '../../../../lib/schedule/division-users';
import { getDivisionRubrics } from '../../../../lib/schedule/division-rubrics';
import {
  parseDivisionData,
  parseSessionsAndMatches,
  getInitialDivisionState,
  getDefaultDeliberations
} from '../../../../lib/schedule/parser';
import { getDivisionScoresheets } from '../../../../lib/schedule/division-scoresheets';
import { cleanDivisionData } from '../../../../lib/schedule/cleaner';

const router = express.Router({ mergeParams: true });

router.post(
  '/parse',
  fileUpload(),
  asyncHandler(async (req: Request, res: Response) => {
    const division = await db.getDivision({ _id: new ObjectId(req.params.divisionId) });
    const event = await db.getFllEvent({ _id: division.eventId });
    const divisionState = await db.getDivisionState({ divisionId: division._id });
    if (divisionState) {
      res.status(400).json({ error: 'Could not parse schedule: Division has data' });
      return;
    }

    try {
      console.log('👓 Parsing file...');
      const timezone = req.body.timezone;
      const csvData = (req.files.file as fileUpload.UploadedFile)?.data.toString();

      const { teams, tables, rooms } = parseDivisionData(division, csvData);

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

      const dbTeams = await db.getDivisionTeams(division._id);
      const dbTables = await db.getDivisionTables(division._id);
      const dbRooms = await db.getDivisionRooms(division._id);

      console.log('📄 Parsing schedule');

      const { matches, sessions } = parseSessionsAndMatches(
        csvData,
        event,
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

      const dbMatches = await db.getDivisionMatches(division._id.toString());

      console.log('📄 Generating rubrics');
      const rubrics = getDivisionRubrics(division, dbTeams);
      if (!(await db.addRubrics(rubrics)).acknowledged) {
        res.status(500).json({ error: 'Could not create rubrics!' });
        return;
      }
      console.log('✅ Generated rubrics');

      console.log('📄 Generating scoresheets');
      const scoresheets = getDivisionScoresheets(division, dbTeams, dbMatches);

      if (!(await db.addScoresheets(scoresheets)).acknowledged) {
        res.status(500).json({ error: 'Could not create scoresheets!' });
        return;
      }
      console.log('✅ Generated scoresheets!');

      console.log('👤 Generating division users');
      const eventUserRoles = (await db.getEventUsers(event._id)).map(user => user.role);
      const users = getDivisionUsers(division, dbTables, dbRooms, eventUserRoles);
      if (!(await db.addUsers(users)).acknowledged) {
        res.status(500).json({ error: 'Could not create users!' });
        return;
      }
      console.log('✅ Generated division users');

      console.log('📄 Generating deliberations');
      const deliberations = getDefaultDeliberations(division);
      if (!(await db.addJudgingDeliberations(deliberations)).acknowledged) {
        res.status(500).json({ error: 'Could not create deliberations!' });
        return;
      }
      console.log('✅ Generated deliberations');

      console.log('🔐 Creating division state');
      await db.addDivisionState(getInitialDivisionState(division));
      console.log('✅ Created division state');

      await db.updateDivision({ _id: division._id }, { hasState: true });

      res.status(200).json({ ok: true });
    } catch (error) {
      console.log('❌ Error parsing schedule');
      console.log(error);
      await cleanDivisionData(division);
      console.log('✅ Deleted division data!');
      res.status(500).json({ error: 'INTERNAL_SERVER_ERROR' });
    }
  })
);

router.post('/generate', (req: Request, res: Response) => {
  res.status(501).json({ error: 'NOT_IMPLEMENTED' });
});

export default router;
