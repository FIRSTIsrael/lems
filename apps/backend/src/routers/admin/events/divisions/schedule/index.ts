import express from 'express';
import { SchedulerRequest } from '@lems/types/api/scheduler';
import db from '../../../../../lib/database';
import { AdminDivisionRequest } from '../../../../../types/express';
import { requirePermission } from '../../../middleware/require-permission';
import {
  makeAdminJudgingSessionResponse,
  makeAdminJudgingRoomResponse,
  makeAdminRobotGameMatchResponse
} from './util';

const router = express.Router({ mergeParams: true });

const SCHEDULER_DOMAIN = process.env.SCHEDULER_URL;
if (!SCHEDULER_DOMAIN) throw new Error('SCHEDULER_URL is not configured');

router.post(
  '/validate',
  requirePermission('MANAGE_EVENT_DETAILS'),
  async (req: AdminDivisionRequest, res) => {
    try {
      const settings: SchedulerRequest = req.body;

      if (!settings) {
        res.status(400).json({ error: 'Settings are required' });
        return;
      }

      const response = await fetch(`${SCHEDULER_DOMAIN}/scheduler/validate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings)
      });

      const data = await response.json();
      if (data.is_valid) {
        res.status(200).json(data);
        return;
      }

      res.status(400).json(data);
    } catch (error) {
      console.log('❌ Error validating schedule');
      console.debug(error);
      res.status(500).json({ error: 'INTERNAL_SERVER_ERROR' });
    }
  }
);

router.post(
  '/generate',
  requirePermission('MANAGE_EVENT_DETAILS'),
  async (req: AdminDivisionRequest, res) => {
    try {
      const settings: SchedulerRequest = req.body;

      if (!settings) {
        res.status(400).json({ error: 'Settings are required' });
        return;
      }

      const response = await fetch(`${SCHEDULER_DOMAIN}/scheduler`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings)
      });

      const data = await response.json();
      if (response.ok) {
        res.status(200).json(data);
        return;
      }

      res.status(400).json(data);
    } catch (error) {
      console.log('❌ Error validating schedule');
      console.debug(error);
      res.status(500).json({ error: 'INTERNAL_SERVER_ERROR' });
    }
  }
);

router.delete(
  '/',
  requirePermission('MANAGE_EVENT_DETAILS'),
  async (req: AdminDivisionRequest, res) => {
    try {
      await Promise.all([
        db.judgingSessions.byDivisionId(req.divisionId).deleteAll(),
        db.robotGameMatches.byDivisionId(req.divisionId).deleteAll(),
        db.divisions.byId(req.divisionId).update({ has_schedule: false })
      ]);

      res.status(200).json({ ok: true });
    } catch (error) {
      console.error('Error deleting division schedule:', error);
      res.status(500).json({ error: 'Failed to delete division schedule' });
    }
  }
);

router.get(
  '/teams/:teamId',
  requirePermission('MANAGE_EVENT_DETAILS'),
  async (req: AdminDivisionRequest, res) => {
    try {
      const { teamId } = req.params;

      const team = await db.teams.byId(teamId).get();
      if (!team) {
        res.status(404).json({ error: 'Team not found' });
        return;
      }

      const isInDivision = await db.teams.byId(teamId).isInDivision(req.divisionId);
      if (!isInDivision) {
        res.status(403).json({ error: 'Team not in this division' });
        return;
      }

      const judgingSession = await db.judgingSessions
        .byDivisionId(req.divisionId)
        .getByTeam(teamId);

      const matches = await db.robotGameMatches.byDivisionId(req.divisionId).getByTeam(teamId);

      res.status(200).json({
        team,
        judgingSession: judgingSession ? makeAdminJudgingSessionResponse(judgingSession) : null,
        matches: matches.map(makeAdminRobotGameMatchResponse)
      });
    } catch (error) {
      console.error('Error fetching team schedule:', error);
      res.status(500).json({ error: 'Failed to fetch team schedule' });
    }
  }
);

router.get(
  '/judging-sessions',
  requirePermission('MANAGE_EVENT_DETAILS'),
  async (req: AdminDivisionRequest, res) => {
    try {
      const sessions = await db.judgingSessions.byDivisionId(req.divisionId).getAll();
      const rooms = await db.rooms.byDivisionId(req.divisionId).getAll();

      res.status(200).json({
        sessions: sessions.map(makeAdminJudgingSessionResponse),
        rooms: rooms.map(makeAdminJudgingRoomResponse)
      });
    } catch (error) {
      console.error('Error fetching judging sessions:', error);
      res.status(500).json({ error: 'Failed to fetch judging sessions' });
    }
  }
);

router.put(
  '/swap',
  requirePermission('MANAGE_EVENT_DETAILS'),
  async (req: AdminDivisionRequest, res) => {
    try {
      const { teamId1, teamId2 } = req.body;

      if (!teamId1 || !teamId2) {
        res.status(400).json({ error: 'Missing required fields' });
        return;
      }

      // Verify both teams exist and are in this division
      const team1 = await db.teams.byId(teamId1).get();
      const team2 = await db.teams.byId(teamId2).get();

      if (!team1 || !team2) {
        res.status(404).json({ error: 'One or both teams not found' });
        return;
      }

      const team1InDivision = await db.teams.byId(teamId1).isInDivision(req.divisionId);
      const team2InDivision = await db.teams.byId(teamId2).isInDivision(req.divisionId);

      if (!team1InDivision || !team2InDivision) {
        res.status(403).json({ error: 'One or both teams not in this division' });
        return;
      }

      // Swap judging sessions and match participants
      await Promise.all([
        db.judgingSessions.swapTeams(teamId1, teamId2, req.divisionId),
        db.robotGameMatches.swapTeams(teamId1, teamId2)
      ]);

      res.status(200).json({ ok: true });
    } catch (error) {
      console.error('Error swapping team schedules:', error);
      res.status(500).json({ error: 'Failed to swap team schedules' });
    }
  }
);

router.post(
  '/agenda-events',
  requirePermission('MANAGE_EVENT_DETAILS'),
  async (req: AdminDivisionRequest, res) => {
    try {
      const agendaEvents = req.body;
      if (!Array.isArray(agendaEvents)) {
        res.status(400).json({ error: 'Invalid agenda events' });
        return;
      }
      await db.divisions.byId(req.divisionId).agenda().createMany(agendaEvents);
      res.status(200).json({ ok: true });
    } catch (error) {
      console.error('Error updating agenda events:', error);
      res.status(500).json({ error: 'Failed to update agenda events' });
    }
  }
);

router.delete(
  '/agenda-events',
  requirePermission('MANAGE_EVENT_DETAILS'),
  async (req: AdminDivisionRequest, res) => {
    try {
      await db.divisions.byId(req.divisionId).agenda().delete();
      res.status(200).json({ ok: true });
    } catch (error) {
      console.error('Error deleting agenda event:', error);
      res.status(500).json({ error: 'Failed to delete agenda event' });
    }
  }
);

export default router;
