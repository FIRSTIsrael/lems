import express from 'express';
import { sql } from 'kysely';
import db from '../../../../lib/database.js';
import { requirePermission } from '../../middleware/require-permission.js';
import { AdminDivisionRequest } from '../../../../types/express.js';
import { asHandler } from '../../../../types/express-handlers.js';

const router = express.Router({ mergeParams: true });

interface BlockedTimeSlot {
  start: string;
  end: string;
  reason?: string;
}

interface PracticeTablesConfigBody {
  tableCount: number;
  slotDurationMinutes: number;
  startTime: string;
  endTime: string;
  blockedTimeSlots: BlockedTimeSlot[];
}

// Update practice tables configuration for a division
router.put(
  '/practice-tables',
  requirePermission('MANAGE_EVENT_DETAILS'),
  asHandler<AdminDivisionRequest>(async (req, res) => {
    const { tableCount, slotDurationMinutes, startTime, endTime, blockedTimeSlots } =
      req.body as PracticeTablesConfigBody;

    // Validate required fields
    if (
      tableCount === undefined ||
      slotDurationMinutes === undefined ||
      !startTime ||
      !endTime ||
      !Array.isArray(blockedTimeSlots)
    ) {
      res.status(400).json({ error: 'Missing required fields' });
      return;
    }

    // Update the practice_tables_settings JSON column
    await db.raw.sql
      .updateTable('divisions')
      .set({
        practice_tables_settings: sql`${JSON.stringify({
          tableCount,
          slotDurationMinutes,
          startTime,
          endTime,
          blockedTimeSlots
        })}::jsonb`
      })
      .where('id', '=', req.divisionId)
      .execute();

    res.status(200).json({
      divisionId: req.divisionId,
      tableCount,
      slotDurationMinutes,
      startTime,
      endTime,
      blockedTimeSlots
    });
  })
);

// Delete practice tables configuration for a division
router.delete(
  '/practice-tables',
  requirePermission('MANAGE_EVENT_DETAILS'),
  asHandler<AdminDivisionRequest>(async (req, res) => {
    await db.raw.sql
      .updateTable('divisions')
      .set({ practice_tables_settings: null })
      .where('id', '=', req.divisionId)
      .execute();

    res.status(204).end();
  })
);

export default router;
