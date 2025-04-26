import express, { Request, Response } from 'express';
import { ObjectId } from 'mongodb';
import fileUpload from 'express-fileupload';

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
import { initializeDivision } from '../../../../lib/schedule/initializer';

const router = express.Router({ mergeParams: true });

router.post('/parse', fileUpload(), async (req: Request, res: Response) => {
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
    if (!(await db.addMatches(matches)).acknowledged) throw new Error('Could not insert matches!');

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
});

const withScheduleRequest = async (req: Request, res: Response, next: () => void) => {
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

    req.body.schedulerRequest = schedulerRequest;
    return next();
  } catch {
    console.log('❌ Error parsing schedule request');
    res.status(400).json({ error: 'BAD_REQUEST' });
  }
};

router.post('/validate', withScheduleRequest, async (req: Request, res: Response) => {
  try {
    const domain = process.env.SCHEDULER_URL;
    if (!domain) throw new Error('SCHEDULER_URL is not configured');

    const response = await fetch(`${domain}/scheduler/validate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req.body.schedulerRequest)
    });

    const data = await response.json();
    if (!response.ok && !data.error) throw new Error('Scheduler failed to run');
    if (data.is_valid) {
      res.status(200).json({ ok: true });
      return;
    }

    res.status(400).json({ error: data.error });
  } catch (error) {
    console.log('❌ Error validating schedule');
    console.debug(error);
    res.status(500).json({ error: 'INTERNAL_SERVER_ERROR' });
  }
});

router.post('/generate', withScheduleRequest, async (req: Request, res: Response) => {
  try {
    const domain = process.env.SCHEDULER_URL;
    if (!domain) throw new Error('SCHEDULER_URL is not configured');

    const division = await db.getDivision({ _id: new ObjectId(req.params.divisionId) });
    const event = await db.getFllEvent({ _id: division.eventId });

    await fetch(`${domain}/scheduler`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req.body.schedulerRequest)
    }).then(res => {
      if (!res.ok) throw new Error('Scheduler failed to run');
    });
    await initializeDivision(division, event);

    res.json({ ok: true });
  } catch (error) {
    console.log('❌ Error generating schedule');
    console.debug(error);
    const division = await db.getDivision({ _id: new ObjectId(req.params.divisionId) });
    await cleanDivisionData(division, true);
    console.log('✅ Deleted division data!');
    res.status(500).json({ error: 'INTERNAL_SERVER_ERROR' });
  }
});

export default router;
