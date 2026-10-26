import express from 'express';
import { getEdition } from '@lems/shared/edition';
import db from '../../../../../lib/database';
import { requirePermission } from '../../../middleware/require-permission';
import { AdminDivisionRequest } from '../../../../../types/express';
import { generateVolunteerPassword } from '../../users/util';
import { asHandler } from '../../../../../types/express-handlers';
import { makeAdminTableResponse } from './util';

const router = express.Router({ mergeParams: true });

router.get(
  '/',
  asHandler<AdminDivisionRequest>(async (req, res) => {
    const tables = await db.tables.byDivisionId(req.divisionId).getAll();
    res.status(200).json(tables.map(makeAdminTableResponse));
  })
);

router.post(
  '/',
  requirePermission('MANAGE_EVENT_DETAILS'),
  asHandler<AdminDivisionRequest>(async (req, res) => {
    const { name } = req.body;

    if (!name) {
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

    await db.withTransaction(async ({ tables: tablesRepo, eventUsers }) => {
      const tables =
        getEdition(division) === 'future'
          ? await tablesRepo.createPair(req.divisionId, name)
          : [await tablesRepo.create({ division_id: req.divisionId, name })];

      for (const table of tables) {
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

    if (!name) {
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
      res.status(404).json({ error: 'Table not found' });
      return;
    }

    if (table.pair_key) {
      await db.tables.byPairKey(table.pair_key).rename(name);
    } else {
      await db.tables.byId(tableId).update({ name });
    }

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
      res.status(404).json({ error: 'Table not found' });
      return;
    }

    await db.withTransaction(async ({ tables, eventUsers }) => {
      const deletedIds = table.pair_key
        ? await tables.byPairKey(table.pair_key).delete()
        : [tableId];

      if (!table.pair_key) {
        await tables.byId(tableId).delete();
      }

      for (const id of deletedIds) {
        const tableEventUser = await eventUsers.byRoleInfo('tableId', id).get();

        if (tableEventUser) {
          await eventUsers.delete(tableEventUser.id);
        }
      }
    });

    res.status(204).end();
  })
);

export default router;
