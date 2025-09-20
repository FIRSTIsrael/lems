import express from 'express';
import { SchedulerRequest } from '@lems/types';
import db from '../../../../../lib/database';
import { AdminDivisionRequest } from '../../../../../types/express';
import { requirePermission } from '../../../../../middlewares/admin/require-permission';

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
        db.judgingSessions.deleteByDivision(req.divisionId),
        db.robotGameMatches.deleteByDivision(req.divisionId),
        db.divisions.byId(req.divisionId).update({ has_schedule: false })
      ]);

      res.status(200).json({ ok: true });
    } catch (error) {
      console.error('Error deleting division schedule:', error);
      res.status(500).json({ error: 'Failed to delete division schedule' });
    }
  }
);

export default router;
