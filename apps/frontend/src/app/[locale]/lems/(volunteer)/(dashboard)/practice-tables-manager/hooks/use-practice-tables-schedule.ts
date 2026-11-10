import { useMemo } from 'react';
import {
  generatePracticeTableTimeSlots,
  isTimeSlotBlocked as checkTimeSlotBlocked,
  TABLE_SIDES,
  type TableSide
} from '@lems/shared/utils';
import type { Team, PracticeTableAssignment, PracticeTablesConfig } from '../graphql/types';

export interface PracticePosition {
  tableIndex: number;
  side: TableSide | null;
}

export const positionKey = (tableIndex: number, side: TableSide | null) =>
  `${tableIndex}:${side ?? ''}`;

export interface BlockedSlotInfo {
  reason?: string;
  rowSpan: number;
  isFirstSlot: boolean;
}

export interface UsePracticeTablesScheduleResult {
  timeSlots: string[];
  positions: PracticePosition[];
  assignmentsMap: Record<string, Record<string, Team>>;
  isBlocked: (time: string) => boolean;
  getBlockedSlotInfo: (time: string) => BlockedSlotInfo | null;
  getAssignment: (tableIndex: number, time: string, side: TableSide | null) => Team | null;
}

/**
 * Hook to manage practice tables schedule data and operations
 * @param config - Practice tables configuration
 * @param assignments - Array of practice table assignments
 * @param paired - Whether each table slot has two positions (sides A and B)
 * @returns Schedule utilities and data structures
 */
export function usePracticeTablesSchedule(
  config: PracticeTablesConfig,
  assignments: PracticeTableAssignment[],
  paired: boolean
): UsePracticeTablesScheduleResult {
  const positions = useMemo(
    () =>
      Array.from({ length: config.tableCount }, (_, tableIndex) =>
        (paired ? TABLE_SIDES : [null]).map(side => ({ tableIndex, side }))
      ).flat(),
    [config.tableCount, paired]
  );

  // Generate time slots using shared utility
  const timeSlots = useMemo(
    () =>
      generatePracticeTableTimeSlots(config.startTime, config.endTime, config.slotDurationMinutes),
    [config.startTime, config.endTime, config.slotDurationMinutes]
  );

  // Create assignments map indexed by table and time
  const assignmentsMap = useMemo(() => {
    const map: Record<string, Record<string, Team>> = {};

    assignments.forEach(assignment => {
      const key = positionKey(assignment.tableIndex, assignment.side);
      if (!map[key]) {
        map[key] = {};
      }

      // Use the full ISO datetime as the key
      map[key][assignment.startTime] = assignment.team;
    });

    return map;
  }, [assignments]);

  // Check if a time slot is blocked
  const isBlocked = useMemo(
    () => (time: string) => {
      return config.blockedTimeSlots.some(blocked =>
        checkTimeSlotBlocked(time, blocked.start, blocked.end)
      );
    },
    [config.blockedTimeSlots]
  );

  // Get blocked slot info including rowSpan for table rendering
  const getBlockedSlotInfo = useMemo(
    () => (time: string) => {
      const blockedSlot = config.blockedTimeSlots.find(b =>
        checkTimeSlotBlocked(time, b.start, b.end)
      );
      if (!blockedSlot) return null;

      // Calculate how many time slots this blocked period spans
      const slotsInRange = timeSlots.filter(slot =>
        checkTimeSlotBlocked(slot, blockedSlot.start, blockedSlot.end)
      );

      // Check if this is the first slot in the blocked range
      const isFirstSlot = time === slotsInRange[0];

      return {
        reason: blockedSlot.reason,
        rowSpan: slotsInRange.length,
        isFirstSlot
      };
    },
    [config.blockedTimeSlots, timeSlots]
  );

  // Get assignment for a specific table and time
  const getAssignment = useMemo(
    () =>
      (tableIndex: number, time: string, side: TableSide | null): Team | null => {
        return assignmentsMap[positionKey(tableIndex, side)]?.[time] || null;
      },
    [assignmentsMap]
  );

  return {
    timeSlots,
    positions,
    assignmentsMap,
    isBlocked,
    getBlockedSlotInfo,
    getAssignment
  };
}
