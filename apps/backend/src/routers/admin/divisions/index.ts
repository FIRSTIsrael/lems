import express from 'express';
import db from '../../../lib/database';
import { AdminRequest } from '../../../types/express';
import { requirePermission } from '../../../middlewares/admin/require-permission';

const router = express.Router({ mergeParams: true });

router.put(
  '/:divisionId',
  requirePermission('MANAGE_EVENT_DETAILS'),
  async (req: AdminRequest, res) => {
    const { divisionId } = req.params;
    const { name, color } = req.body;

    if (!name || !color) {
      res.status(400).json({ error: 'Name and color are required' });
      return;
    }

    const division = await db.divisions.byId(divisionId).update({ name, color });

    if (!division) {
      res.status(404).json({ error: 'Division not found' });
      return;
    }

    res.status(200).json({ success: true });
  }
);

export default router;
