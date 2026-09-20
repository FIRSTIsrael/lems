import { useMemo } from 'react';
import {
  generatePracticeTableTimeSlots,
  isTimeSlotBlocked as checkTimeSlotBlocked
} from '@lems/shared/utils';

interface Team {
  id: string;
  number: number;
  name: string;
  affiliation: string;
}

interface PracticeTableAssignment {
  id: string;
  tableIndex: number;
  startTime: string; // ISO 8601 datetime
  endTime: string; // ISO 8601 datetime
  team: Team;
}

interface BlockedTimeSlot {
  start: string; // ISO 8601 datetime
  end: string; // ISO 8601 datetime
  reason?: string;
}

interface PracticeTablesConfig {
  divisionId: string;
  tableCount: number;
  slotDurationMinutes: number;
  startTime: string; // ISO 8601 datetime
  endTime: string; // ISO 8601 datetime
  blockedTimeSlots: BlockedTimeSlot[];
}

interface BlockedSlotInfo {
  reason?: string;
  rowSpan: number;
  isFirstSlot: boolean;
}

interface UsePracticeTablesScheduleResult {
  timeSlots: string[];
  assignmentsMap: Record<number, Record<string, Team>>;
  isBlocked: (time: string) => boolean;
  getBlockedSlotInfo: (time: string) => BlockedSlotInfo | null;
  getAssignment: (tableIndex: number, time: string) => Team | null;
}

/**
 * Hook to manage practice tables schedule data and operations
 * @param config - Practice tables configuration
 * @param assignments - Array of practice table assignments
 * @returns Schedule utilities and data structures
 */
export function usePracticeTablesSchedule(
  config: PracticeTablesConfig,
  assignments: PracticeTableAssignment[]
): UsePracticeTablesScheduleResult {
  // Generate time slots using shared utility
  const timeSlots = useMemo(
    () =>
      generatePracticeTableTimeSlots(config.startTime, config.endTime, config.slotDurationMinutes),
    [config.startTime, config.endTime, config.slotDurationMinutes]
  );

  // Create assignments map indexed by table and time
  const assignmentsMap = useMemo(() => {
    const map: Record<number, Record<string, Team>> = {};

    assignments.forEach(assignment => {
      const tableIndex = assignment.tableIndex;
      if (!map[tableIndex]) {
        map[tableIndex] = {};
      }

      // Use the full ISO datetime as the key
      map[tableIndex][assignment.startTime] = assignment.team;
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
    () => (tableIndex: number, time: string): Team | null => {
      return assignmentsMap[tableIndex]?.[time] || null;
    },
    [assignmentsMap]
  );

  return {
    timeSlots,
    assignmentsMap,
    isBlocked,
    getBlockedSlotInfo,
    getAssignment
  };
}
