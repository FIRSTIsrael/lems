import express from 'express';
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
  console.log(req.body);
  res.status(200).json({ ok: true });
});

router.post('/matches', async (req: SchedulerRequest, res) => {
  console.log(req.body);
  res.status(200).json({ ok: true });
});

export default router;
