import { Dayjs } from 'dayjs';
import { ScheduleBlock, ScheduleColumn, TIME_SLOT_HEIGHT, AgendaBlock } from './calendar-types';

export function getBlockColumn(block: ScheduleBlock): ScheduleColumn {
  if (block.type === 'judging-session') return 'judging';
  return 'field';
}

export function calculateBlockPosition(startTime: Dayjs, block: ScheduleBlock) {
  const minutesFromStart = block.startTime.diff(startTime, 'minute');

  return {
    top: minutesFromStart * TIME_SLOT_HEIGHT,
    height: (block.durationSeconds / 60) * TIME_SLOT_HEIGHT
  };
}

export function getDuration(date: Dayjs): number {
  return date.hour() * 3600 + date.minute() * 60 + date.second();
}

export interface BlockOverlapInfo {
  column: number;
  totalColumns: number;
}

/**
 * Checks if two blocks overlap in time
 */
function blocksOverlap(block1: AgendaBlock, block2: AgendaBlock): boolean {
  const end1 = block1.startTime.add(block1.durationSeconds, 'second');
  const end2 = block2.startTime.add(block2.durationSeconds, 'second');

  return block1.startTime.isBefore(end2) && block2.startTime.isBefore(end1);
}

/**
 * Calculate layout information for overlapping agenda blocks
 * Returns a map of block ID to its column position and total columns in its group
 */
export function calculateOverlapLayout(blocks: AgendaBlock[]): Map<string, BlockOverlapInfo> {
  const layout = new Map<string, BlockOverlapInfo>();

  const sortedBlocks = [...blocks].sort((a, b) => a.startTime.diff(b.startTime));
  const groups: AgendaBlock[][] = [];

  for (const block of sortedBlocks) {
    let foundGroup = false;

    for (const group of groups) {
      if (group.some(groupBlock => blocksOverlap(block, groupBlock))) {
        group.push(block);
        foundGroup = true;
        break;
      }
    }

    if (!foundGroup) {
      groups.push([block]);
    }
  }

  for (const group of groups) {
    if (group.length === 1) {
      layout.set(group[0].id, { column: 0, totalColumns: 1 });
    } else {
      const sortedGroup = [...group].sort((a, b) => {
        const timeDiff = a.startTime.diff(b.startTime);
        if (timeDiff !== 0) return timeDiff;
        return b.durationSeconds - a.durationSeconds;
      });

      const columns: AgendaBlock[][] = [];

      for (const block of sortedGroup) {
        let assignedColumn = -1;

        for (let i = 0; i < columns.length; i++) {
          const columnBlocks = columns[i];
          const hasOverlap = columnBlocks.some(colBlock => blocksOverlap(block, colBlock));

          if (!hasOverlap) {
            assignedColumn = i;
            columnBlocks.push(block);
            break;
          }
        }

        if (assignedColumn === -1) {
          assignedColumn = columns.length;
          columns.push([block]);
        }

        layout.set(block.id, { column: assignedColumn, totalColumns: columns.length });
      }

      for (const block of group) {
        const info = layout.get(block.id);
        if (info) {
          info.totalColumns = columns.length;
        }
      }
    }
  }

  return layout;
}
