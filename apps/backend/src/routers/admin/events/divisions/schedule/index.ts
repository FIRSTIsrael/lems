import express from 'express';
import { SchedulerRequest, JUDGING_SESSION_LENGTH, MATCH_LENGTH } from '@lems/types';
import { AdminDivisionRequest } from '../../../../../types/express';
import { requirePermission } from '../../../../../middlewares/admin/require-permission';
import db from '../../../../../lib/database';

const router = express.Router({ mergeParams: true });

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

      const domain = process.env.SCHEDULER_URL;
      if (!domain) {
        res.status(500).json({ error: 'SCHEDULER_URL is not configured' });
        return;
      }

      const division = await db.divisions.byId(req.divisionId).get();

      const schedulerRequest: SchedulerRequest = {
        division_id: String(division.id),
        matches_start: settings.matches_start,
        practice_rounds: settings.practice_rounds,
        ranking_rounds: settings.ranking_rounds,
        match_length_seconds: MATCH_LENGTH,
        practice_match_cycle_time_seconds: settings.practice_match_cycle_time_seconds,
        ranking_match_cycle_time_seconds: settings.ranking_match_cycle_time_seconds,
        stagger_matches: settings.stagger_matches,
        judging_start: settings.judging_start,
        judging_session_length_seconds: JUDGING_SESSION_LENGTH,
        judging_cycle_time_seconds: settings.judging_cycle_time_seconds,
        breaks: settings.breaks
      };

      const response = await fetch(`${domain}/scheduler/validate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(schedulerRequest)
      });

      const data = await response.json();
      if (data.is_valid) {
        res.status(200).json({ ok: true });
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


export default router;
