import express from 'express';
import { orderTablesByPair } from '@lems/shared/utils';
import db from '../../../../../lib/database';
import { requirePermission } from '../../../middleware/require-permission';
import { AdminDivisionRequest } from '../../../../../types/express';
import { generateVolunteerPassword } from '../../users/util';
import { asHandler } from '../../../../../types/express-handlers';
import { toPairableTable } from '../../../../../lib/table-pairs';

const router = express.Router({ mergeParams: true });

const isNonEmptyString = (value: unknown): value is string =>
  typeof value === 'string' && value.trim().length > 0;

router.get(
  '/',
  asHandler<AdminDivisionRequest>(async (req, res) => {
    const tables = await db.tables.byDivisionId(req.divisionId).getAll();
    res.status(200).json(orderTablesByPair(tables.map(toPairableTable)));
  })
);

router.post(
  '/',
  requirePermission('MANAGE_EVENT_DETAILS'),
  asHandler<AdminDivisionRequest>(async (req, res) => {
    const { names } = req.body;

    if (!Array.isArray(names) || names.length !== 2 || !names.every(isNonEmptyString)) {
      res.status(400).json({ error: 'NAMES_REQUIRED' });
      return;
    }

    const division = await db.divisions.byId(req.divisionId).get();
    if (!division) {
      res.status(404).json({ error: 'Division not found' });
      return;
    }

    if (division.has_schedule) {
      res.status(400).json({ error: 'SCHEDULE_LOCKED' });
      return;
    }

    const trimmed: [string, string] = [names[0].trim(), names[1].trim()];

    await db.withTransaction(async ({ tables, eventUsers }) => {
      const pair = await tables.createPair(req.divisionId, trimmed);

      for (const table of pair) {
        const eventUser = await eventUsers.create({
          event_id: division.event_id,
          role: 'referee',
          role_info: { tableId: table.id },
          identifier: null,
          password: generateVolunteerPassword()
        });

        await eventUsers.assignUserToDivisions(eventUser.id, [req.divisionId]);
      }
    });

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

    if (!isNonEmptyString(name)) {
      res.status(400).json({ error: 'Name is required' });
      return;
    }

    const division = await db.divisions.byId(req.divisionId).get();
    if (!division) {
      res.status(404).json({ error: 'Division not found' });
      return;
    }

    if (division.has_schedule) {
      res.status(400).json({ error: 'SCHEDULE_LOCKED' });
      return;
    }

    const table = await db.tables.byId(tableId).get();
    if (!table || table.division_id !== req.divisionId) {
      res.status(404).json({ error: 'TABLE_NOT_FOUND' });
      return;
    }

    await db.tables.byId(tableId).update({ name: name.trim() });

    res.status(200).end();
  })
);

router.put(
  '/:tableId/swap',
  requirePermission('MANAGE_EVENT_DETAILS'),
  asHandler<AdminDivisionRequest>(async (req, res) => {
    const { tableId } = req.params;
    const { otherTableId } = req.body;

    if (!tableId || typeof tableId !== 'string') {
      res.status(400).json({ error: 'TABLE_ID_REQUIRED' });
      return;
    }

    if (typeof otherTableId !== 'string' || !otherTableId || otherTableId === tableId) {
      res.status(400).json({ error: 'OTHER_TABLE_REQUIRED' });
      return;
    }

    const division = await db.divisions.byId(req.divisionId).get();
    if (!division) {
      res.status(404).json({ error: 'Division not found' });
      return;
    }

    if (division.has_schedule) {
      res.status(400).json({ error: 'SCHEDULE_LOCKED' });
      return;
    }

    const [table, otherTable] = await Promise.all([
      db.tables.byId(tableId).get(),
      db.tables.byId(otherTableId).get()
    ]);
    if (
      !table ||
      table.division_id !== req.divisionId ||
      !otherTable ||
      otherTable.division_id !== req.divisionId
    ) {
      res.status(404).json({ error: 'TABLE_NOT_FOUND' });
      return;
    }

    await db.withTransaction(({ tables }) => tables.swap(tableId, otherTableId));

    res.status(200).end();
  })
);

router.delete(
  '/pairs/:pairKey',
  requirePermission('MANAGE_EVENT_DETAILS'),
  asHandler<AdminDivisionRequest>(async (req, res) => {
    const { pairKey } = req.params;
    if (!pairKey || typeof pairKey !== 'string') {
      res.status(400).json({ error: 'PAIR_KEY_REQUIRED' });
      return;
    }

    const division = await db.divisions.byId(req.divisionId).get();
    if (!division) {
      res.status(404).json({ error: 'Division not found' });
      return;
    }

    if (division.has_schedule) {
      res.status(400).json({ error: 'SCHEDULE_LOCKED' });
      return;
    }

    const pair = await db.tables.byPairKey(pairKey).getAll();
    if (pair.length === 0 || pair.some(table => table.division_id !== req.divisionId)) {
      res.status(404).json({ error: 'PAIR_NOT_FOUND' });
      return;
    }

    await db.withTransaction(async ({ tables, eventUsers }) => {
      const deletedIds = await tables.byPairKey(pairKey).delete();

      for (const tableId of deletedIds) {
        const tableEventUser = await eventUsers.byRoleInfo('tableId', tableId).get();
        if (tableEventUser) {
          await eventUsers.delete(tableEventUser.id);
        }
      }
    });

    res.status(204).end();
  })
);

export default router;
