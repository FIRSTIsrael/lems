import express from 'express';
import db from '../../../../../lib/database';
import { requirePermission } from '../../../middleware/require-permission';
import { AdminDivisionRequest } from '../../../../../types/express';
import { generateVolunteerPassword } from '../../users/util';import { asHandler } from '../../../../../types/express-handlers';


const router = express.Router({ mergeParams: true });

router.get('/', asHandler<AdminDivisionRequest>(async (req, res) => {
  const tables = await db.tables.byDivisionId(req.divisionId).getAll();
  res.status(200).json(tables);
}));

router.post(
  '/',
  requirePermission('MANAGE_EVENT_DETAILS'),
  asHandler<AdminDivisionRequest>(async (req, res) => {
    const { name } = req.body;

    if (!name) {
      res.status(400).json({ error: 'Name is required' });
      return;
    }

    const table = await db.tables.create({ division_id: req.divisionId, name });
    const division = await db.divisions.byId(req.divisionId).get();
    if (!division) {
      res.status(404).json({ error: 'Division not found' });
      return;
    }

    const eventUser = await db.eventUsers.create({
      event_id: division.event_id,
      role: 'referee',
      role_info: { tableId: table.id },
      identifier: null,
      password: generateVolunteerPassword()
    });

    await db.eventUsers.assignUserToDivisions(eventUser.id, [req.divisionId]);

    res.status(201).end();
  })
);

router.put(
  '/:tableId',
  requirePermission('MANAGE_EVENT_DETAILS'),
  asHandler<AdminDivisionRequest>(async (req, res) => {
    const { tableId } = req.params;
    const { name } = req.body;

    if (!tableId || typeof tableId !== 'string') {
      res.status(400).json({ error: 'TABLE_ID_REQUIRED' });
      return;
    }

    if (!name) {
      res.status(400).json({ error: 'Name is required' });
      return;
    }

    await db.tables.byId(tableId).update({ name });

    res.status(200).end();
  })
);

router.delete(
  '/:tableId',
  requirePermission('MANAGE_EVENT_DETAILS'),
  asHandler<AdminDivisionRequest>(async (req, res) => {
    const { tableId } = req.params;
    if (!tableId || typeof tableId !== 'string') {
      res.status(400).json({ error: 'TABLE_ID_REQUIRED' });
      return;
    }

    await db.tables.byId(tableId).delete();

    const tableEventUser = await db.eventUsers.byRoleInfo('tableId', tableId).get();

    if (tableEventUser) {
      await db.eventUsers.delete(tableEventUser.id);
    }

    res.status(204).end();
  })
);

export default router;
