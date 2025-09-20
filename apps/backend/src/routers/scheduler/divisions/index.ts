import express from 'express';
import {
  InsertableJudgingSession,
  InsertableRobotGameMatch,
  InsertableRobotGameMatchParticipant
} from '@lems/database';
import db from '../../../lib/database';
import { attachDivision } from '../../../middlewares/scheduler/attach-division';
import { SchedulerRequest } from '../../../types/express';
import { makeSchedulerLocationResponse, makeSchedulerTeamResponse } from './utils';

const router = express.Router({ mergeParams: true });

router.use(attachDivision());

router.get('/teams', async (req: SchedulerRequest, res) => {
  const teams = await db.divisions.byId(req.divisionId).getTeams();
  res.status(200).json(teams.map(team => makeSchedulerTeamResponse(team)));
});

router.get('/team/:teamNumber', async (req: SchedulerRequest, res) => {
  const { teamNumber } = req.params;
  if (!teamNumber) {
    res.status(400).json({ error: 'Team number is required' });
    return;
  }

  if (Number.isNaN(Number(teamNumber))) {
    res.status(400).json({ error: 'Team number must be a number' });
    return;
  }

  const team = await db.teams.byNumber(Number.parseInt(teamNumber)).get();
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
  const tables = await db.divisions.byId(req.divisionId).getTables();
  res.status(200).json(tables.map(table => makeSchedulerLocationResponse(table)));
});

router.get('/rooms', async (req: SchedulerRequest, res) => {
  const rooms = await db.divisions.byId(req.divisionId).getRooms();
  res.status(200).json(rooms.map(room => makeSchedulerLocationResponse(room)));
});

router.post('/sessions', async (req: SchedulerRequest, res) => {
  const { sessions }: { sessions: InsertableJudgingSession[] } = req.body;

  if (!sessions || !Array.isArray(sessions)) {
    res.status(400).json({ error: 'Sessions are required' });
    return;
  }

  await db.judgingSessions.createMany(sessions);

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

    await db.robotGameMatches.createManyWithParticipants(allMatches);

    res.status(200).json({ ok: true });
  } catch (error) {
    console.error('Error creating matches:', error);
    res.status(500).json({ error: 'Failed to create matches' });
  }
});

router.delete('/schedule', async (req: SchedulerRequest, res) => {
  try {
    await Promise.all([
      db.judgingSessions.deleteByDivision(req.divisionId),
      db.robotGameMatches.deleteByDivision(req.divisionId)
    ]);

    res.status(200).json({ ok: true });
  } catch (error) {
    console.error('Error deleting division schedule:', error);
    res.status(500).json({ error: 'Failed to delete division schedule' });
  }
});

export default router;
