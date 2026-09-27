import express from 'express';
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

    // Parse start and end times
    const [startHour, startMinute] = startTime.split(':').map(Number);
    const [endHour, endMinute] = endTime.split(':').map(Number);
    const startMinutes = startHour * 60 + startMinute;
    const endMinutes = endHour * 60 + endMinute;

    // Generate all time slots
    const slots: Array<{ tableIndex: number; startTime: Date; endTime: Date }> = [];
    const baseDate = new Date('1970-01-01T00:00:00Z'); // Use epoch for time-only slots

    for (let minutes = startMinutes; minutes < endMinutes; minutes += slotDurationMinutes) {
      const slotStartTime = new Date(baseDate);
      slotStartTime.setUTCMinutes(minutes);

      const slotEndTime = new Date(baseDate);
      slotEndTime.setUTCMinutes(minutes + slotDurationMinutes);

      // Check if this slot is blocked
      const slotStartStr = `${Math.floor(minutes / 60)
        .toString()
        .padStart(2, '0')}:${(minutes % 60).toString().padStart(2, '0')}`;
      const isBlocked = blockedTimeSlots.some(
        blocked => slotStartStr >= blocked.start && slotStartStr < blocked.end
      );

      // Only create slots that are not blocked
      if (!isBlocked) {
        for (let tableIdx = 0; tableIdx < tableCount; tableIdx++) {
          slots.push({
            tableIndex: tableIdx,
            startTime: slotStartTime,
            endTime: slotEndTime
          });
        }
      }
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
