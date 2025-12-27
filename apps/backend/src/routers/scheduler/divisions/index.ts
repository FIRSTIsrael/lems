import express from 'express';
import {
  InsertableJudgingSession,
  InsertableRobotGameMatch,
  InsertableRobotGameMatchParticipant,
  Rubric,
  JudgingCategory
} from '@lems/database';
import { JUDGING_CATEGORIES } from '@lems/types/judging';
import db from '../../../lib/database';
import { attachDivision } from '../middleware/attach-division';
import { SchedulerRequest } from '../../../types/express';
import { makeSchedulerLocationResponse, makeSchedulerTeamResponse } from './utils';

const router = express.Router({ mergeParams: true });

router.use(attachDivision());

router.get('/teams', async (req: SchedulerRequest, res) => {
  const teams = await db.teams.byDivisionId(req.divisionId).getAll();
  res.status(200).json(teams.map(team => makeSchedulerTeamResponse(team)));
});

router.get('/team/:teamSlug', async (req: SchedulerRequest, res) => {
  const { teamSlug } = req.params;
  if (!teamSlug) {
    res.status(400).json({ error: 'Team slug is required' });
    return;
  }

  const [, teamNumber] = teamSlug.split('-');

  if (Number.isNaN(Number(teamNumber))) {
    res.status(400).json({ error: 'Team number must be a number' });
    return;
  }

  const team = await db.teams.bySlug(teamSlug).get();
  if (!team) {
    res.status(404).json({ error: 'Team not found' });
    return;
  }

  const isInDivision = db.teams.byId(team.id).isInDivision(req.divisionId);
  if (!isInDivision) {
    res.status(400).json({ error: 'Team not found in this division' });
    return;
  }

  res.status(200).json(makeSchedulerTeamResponse(team));
});

router.get('/tables', async (req: SchedulerRequest, res) => {
  const tables = await db.tables.byDivisionId(req.divisionId).getAll();
  res.status(200).json(tables.map(table => makeSchedulerLocationResponse(table)));
});

router.get('/rooms', async (req: SchedulerRequest, res) => {
  const rooms = await db.rooms.byDivisionId(req.divisionId).getAll();
  res.status(200).json(rooms.map(room => makeSchedulerLocationResponse(room)));
});

router.post('/sessions', async (req: SchedulerRequest, res) => {
  const { sessions }: { sessions: InsertableJudgingSession[] } = req.body;

  if (!sessions || !Array.isArray(sessions)) {
    res.status(400).json({ error: 'Sessions are required' });
    return;
  }

  const division = await db.divisions.byId(req.divisionId).get();
  if (division.has_schedule) {
    res
      .status(400)
      .json({ error: 'Division already has a schedule. Delete the existing schedule first.' });
    return;
  }

  await db.judgingSessions.createMany(sessions);

  await Promise.all(
    JUDGING_CATEGORIES.map(category =>
      db.judgingDeliberations.create({
        division_id: division.id,
        category
      })
    )
  );

  await db.finalDeliberations.create(division.id);

  // Create rubrics for each team in the division
  const teamIds = [
    ...new Set(sessions.map(s => s.team_id).filter((id): id is string => id !== null))
  ];
  const categories: JudgingCategory[] = ['innovation-project', 'robot-design', 'core-values'];

  const rubrics: Rubric[] = teamIds.flatMap(teamId =>
    categories.map(category => ({
      divisionId: req.divisionId,
      teamId,
      category,
      status: 'empty' as const
    }))
  );

  await db.rubrics.createMany(rubrics);

  res.status(200).json({ ok: true });
});

interface MatchRequest {
  number: number;
  stage: string;
  round: number;
  scheduled_time: string;
  tables: Record<string, { team_id: string | null; team_number?: number }>;
}

router.post('/matches', async (req: SchedulerRequest, res) => {
  const { matches }: { matches: MatchRequest[] } = req.body;

  if (!matches || !Array.isArray(matches)) {
    res.status(400).json({ error: 'Matches are required' });
    return;
  }

  const division = await db.divisions.byId(req.divisionId).get();
  if (division.has_schedule) {
    res
      .status(400)
      .json({ error: 'Division already has a schedule. Delete the existing schedule first.' });
    return;
  }

  try {
    const matchesWithParticipants = matches.map(match => ({
      match: {
        number: match.number,
        round: match.round,
        stage: match.stage.toUpperCase() as 'PRACTICE' | 'RANKING' | 'TEST',
        scheduled_time: new Date(match.scheduled_time),
        division_id: req.divisionId
      } as InsertableRobotGameMatch,
      participants: Object.entries(match.tables).map(([tableId, tableData]) => ({
        team_id: tableData.team_id || null,
        table_id: tableId
      })) as InsertableRobotGameMatchParticipant[]
    }));

    const testMatch = {
      match: {
        number: 0,
        round: 0,
        stage: 'TEST' as 'PRACTICE' | 'RANKING' | 'TEST',
        scheduled_time: new Date(),
        division_id: req.divisionId
      } as InsertableRobotGameMatch,
      participants: [] as InsertableRobotGameMatchParticipant[]
    };

    const allMatches = [testMatch, ...matchesWithParticipants];

    await db.robotGameMatches.createMany(allMatches);

    const scoresheets = [];

    for (const { match, participants } of matchesWithParticipants) {
      for (const participant of participants) {
        if (participant.team_id) {
          scoresheets.push({
            divisionId: req.divisionId,
            teamId: participant.team_id,
            stage: match.stage as 'PRACTICE' | 'RANKING',
            round: match.round,
            status: 'empty' as const,
            escalated: false
          });
        }
      }
    }

    await db.scoresheets.createMany(scoresheets);

    res.status(200).json({ ok: true });
  } catch (error) {
    console.error('Error creating matches:', error);
    res.status(500).json({ error: 'Failed to create matches' });
  }
});

router.put('/settings', async (req: SchedulerRequest, res) => {
  try {
    const { schedule_settings } = req.body;

    if (schedule_settings !== undefined && schedule_settings !== null) {
      const requiredFields = [
        'match_length',
        'practice_cycle_time',
        'ranking_cycle_time',
        'judging_session_length',
        'judging_session_cycle_time'
      ];

      for (const field of requiredFields) {
        if (!(field in schedule_settings) || typeof schedule_settings[field] !== 'number') {
          res.status(400).json({
            error: `Invalid schedule_settings: ${field} must be a number`
          });
          return;
        }
      }
    }

    const updated = await db.divisions
      .byId(req.divisionId)
      .update({ has_schedule: true, schedule_settings });

    if (!updated) {
      res.status(404).json({ error: 'Division not found' });
      return;
    }

    res.status(200).json({ ok: true });
  } catch (error) {
    console.error('Error updating division has_schedule:', error);
    res.status(500).json({ error: 'Failed to update division has_schedule' });
  }
});

router.delete('/schedule', async (req: SchedulerRequest, res) => {
  try {
    await Promise.all([
      db.judgingSessions.byDivision(req.divisionId).deleteAll(),
      db.robotGameMatches.byDivision(req.divisionId).deleteAll(),
      db.scoresheets.byDivision(req.divisionId).deleteAll(),
      db.judgingDeliberations.byDivision(req.divisionId).deleteAll(),
      db.finalDeliberations.byDivision(req.divisionId).delete(),
      db.divisions.byId(req.divisionId).update({ has_schedule: false, schedule_settings: null })
    ]);

    res.status(200).json({ ok: true });
  } catch (error) {
    console.error('Error deleting division schedule:', error);
    res.status(500).json({ error: 'Failed to delete division schedule' });
  }
});

export default router;
