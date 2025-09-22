import express from 'express';
import db from '../../../../../lib/database';
import { requirePermission } from '../../../../../middlewares/admin/require-permission';
import { AdminDivisionRequest } from '../../../../../types/express';

const router = express.Router({ mergeParams: true });

router.get('/', async (req: AdminDivisionRequest, res) => {
  const tables = await db.tables.byDivisionId(req.divisionId).getAll();
  res.status(200).json(tables);
});

router.post(
  '/',
  requirePermission('MANAGE_EVENT_DETAILS'),
  async (req: AdminDivisionRequest, res) => {
    const { name } = req.body;

    if (!name) {
      res.status(400).json({ error: 'Name is required' });
      return;
    }

    await db.tables.create({ division_id: req.divisionId, name });

    res.status(201).end();
  }
);

router.put(
  '/:tableId',
  requirePermission('MANAGE_EVENT_DETAILS'),
  async (req: AdminDivisionRequest, res) => {
    const { tableId } = req.params;
    const { name } = req.body;

    if (!name) {
      res.status(400).json({ error: 'Name is required' });
      return;
    }

    await db.tables.byId(tableId).update({ name });

    res.status(200).end();
  }
);

export default router;
