import express, { Request, Response } from 'express';
import { ObjectId } from 'mongodb';
import fileUpload from 'express-fileupload';
import asyncHandler from 'express-async-handler';
import * as db from '@lems/database';
import { parseDivisionData, parseSessionsAndMatches } from '../../../../lib/schedule/parser';
import { cleanDivisionData } from '../../../../lib/schedule/cleaner';
import {
  JUDGING_SESSION_LENGTH,
  MATCH_LENGTH,
  ScheduleGenerationSettings,
  SchedulerRequest
} from '@lems/types';
import dayjs from 'dayjs';
import { initializeDivision } from 'apps/backend/src/lib/schedule/initializer';

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

      if (!(await db.addTeams(teams)).acknowledged) throw new Error('Could not insert teams!');
      if (!(await db.addTables(tables)).acknowledged) throw new Error('Could not insert tables!');
      if (!(await db.addRooms(rooms)).acknowledged) throw new Error('Could not insert rooms!');

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

      if (!(await db.addSessions(sessions)).acknowledged)
        throw new Error('Could not insert sessions!');
      if (!(await db.addMatches(matches)).acknowledged)
        throw new Error('Could not insert matches!');

      console.log('✅ Finished parsing schedule!');

      await initializeDivision(division, event);

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

router.post(
  '/generate',
  asyncHandler(async (req: Request, res: Response) => {
    const settings: ScheduleGenerationSettings = req.body;

    const division = await db.getDivision({ _id: new ObjectId(req.params.divisionId) });
    const event = await db.getFllEvent({ _id: division.eventId });
    const divisionState = await db.getDivisionState({ divisionId: division._id });
    if (divisionState) {
      res.status(400).json({ error: 'Could not parse schedule: Division has data' });
      return;
    }

    try {
      const matchesStart = dayjs(settings.matchesStart);
      settings.matchesStart = dayjs(event.startDate)
        .set('minutes', matchesStart.get('minutes'))
        .set('hours', matchesStart.get('hours'))
        .toDate();

      const judgingStart = dayjs(settings.judgingStart);
      settings.judgingStart = dayjs(event.startDate)
        .set('minutes', judgingStart.get('minutes'))
        .set('hours', judgingStart.get('hours'))
        .toDate();

      const schedulerRequest: SchedulerRequest = {
        division_id: String(division._id),

        matches_start: settings.matchesStart,
        practice_rounds: settings.practiceRounds,
        ranking_rounds: settings.rankingRounds,
        match_length_seconds: MATCH_LENGTH,
        practice_match_cycle_time_seconds: settings.practiceCycleTimeSeconds,
        ranking_match_cycle_time_seconds: settings.rankingCycleTimeSeconds,
        stagger_matches: settings.isStaggered,

        judging_start: settings.judgingStart,
        judging_session_length_seconds: JUDGING_SESSION_LENGTH,
        judging_cycle_time_seconds: settings.judgingCycleTimeSeconds,

        breaks: settings.breaks.map(({ eventType, after, durationSeconds }) => ({
          event_type: eventType,
          after: after,
          duration_seconds: durationSeconds
        }))
      };

      console.log(JSON.stringify(schedulerRequest));

      // TODO: await send request, validate response
      await fetch('http://localhost:8000/scheduler', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify( schedulerRequest )}).then(res=>{
        if (!res.ok) throw new Error("Scheduler failed to run")
        });
      await initializeDivision(division, event);

      res.json({ ok: true });
    } catch (error) {
      console.log('❌ Error generating schedule');
      console.debug(error);
      await cleanDivisionData(division);
      console.log('✅ Deleted division data!');
      res.status(500).json({ error: 'INTERNAL_SERVER_ERROR' });
    }
  })
);

export default router;
