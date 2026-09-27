import express from 'express';
import db from '../../../../../lib/database.js';
import { requirePermission } from '../../../middleware/require-permission.js';
import { AdminDivisionRequest } from '../../../../../types/express.js';
import { asHandler } from '../../../../../types/express-handlers.js';

const router = express.Router({ mergeParams: true });

interface BlockedTimeSlot {
  start: string; // ISO 8601 datetime
  end: string; // ISO 8601 datetime
  reason?: string;
}

interface PracticeTablesConfigBody {
  tableCount: number;
  slotDurationMinutes: number;
  startTime: string; // ISO 8601 datetime
  endTime: string; // ISO 8601 datetime
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

    // Parse ISO datetime strings
    const startDate = new Date(startTime);
    const endDate = new Date(endTime);

    // Generate all time slots using full ISO datetimes
    const slots: Array<{ tableIndex: number; startTime: Date; endTime: Date }> = [];

    let currentSlotStart = new Date(startDate);
    while (currentSlotStart < endDate) {
      const currentSlotEnd = new Date(currentSlotStart.getTime() + slotDurationMinutes * 60 * 1000);

      // Check if this slot is blocked
      const isBlocked = blockedTimeSlots.some(blocked => {
        const blockedStart = new Date(blocked.start);
        const blockedEnd = new Date(blocked.end);
        return currentSlotStart >= blockedStart && currentSlotStart < blockedEnd;
      });

      // Only create slots that are not blocked
      if (!isBlocked) {
        for (let tableIdx = 0; tableIdx < tableCount; tableIdx++) {
          slots.push({
            tableIndex: tableIdx,
            startTime: new Date(currentSlotStart),
            endTime: new Date(currentSlotEnd)
          });
        }
      }

      currentSlotStart = currentSlotEnd;
    }

    const practiceTablesRepo = db.divisions.byId(req.divisionId).practiceTables();

    // Update the practice_tables_settings JSON column
    await db.divisions.byId(req.divisionId).update({
      practice_tables_settings: {
        tableCount,
        slotDurationMinutes,
        startTime,
        endTime,
        blockedTimeSlots
      }
    });

    // Clear all existing slots for this division
    await practiceTablesRepo.deleteAllAssignments();

    // Insert all new slots (with team_id as null)
    if (slots.length > 0) {
      await practiceTablesRepo.createMany(
        slots.map(slot => ({
          team_id: null,
          table_number: slot.tableIndex,
          start_time: slot.startTime,
          end_time: slot.endTime
        }))
      );
    }

    res.status(200).json({
      divisionId: req.divisionId,
      tableCount,
      slotDurationMinutes,
      startTime,
      endTime,
      blockedTimeSlots,
      slotsCreated: slots.length
    });
  })
);

// Delete practice tables configuration for a division
router.delete(
  '/practice-tables',
  requirePermission('MANAGE_EVENT_DETAILS'),
  asHandler<AdminDivisionRequest>(async (req, res) => {
    // Clear the practice_tables_settings JSON column
    await db.divisions.byId(req.divisionId).update({
      practice_tables_settings: null
    });

    // Delete all slots for this division
    await db.divisions.byId(req.divisionId).practiceTables().deleteAllAssignments();

    res.status(204).end();
  })
);

export default router;
