import express from 'express';
import db from '../../../../../lib/database';
import { AdminDivisionRequest } from '../../../../../types/express';
import { requirePermission } from '../../../middleware/require-permission';

const router = express.Router({ mergeParams: true });

router.post(
  '/',
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
  '/',
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
