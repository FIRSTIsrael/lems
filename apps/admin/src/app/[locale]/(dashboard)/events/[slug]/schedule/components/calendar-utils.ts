import { Dayjs } from 'dayjs';
import {
  ScheduleBlock,
  ScheduleBlockType,
  MINUTES_PER_SLOT,
  TIME_SLOT_HEIGHT
} from './calendar-types';

export function generateTimeSlots(startTime: Dayjs, endTime: Dayjs): Dayjs[] {
  const slots: Dayjs[] = [];
  let current = startTime.clone();

  while (current.isBefore(endTime) || current.isSame(endTime)) {
    slots.push(current.clone());
    current = current.add(MINUTES_PER_SLOT, 'minute');
  }

  return slots;
}

export function calculateBlockPosition(
  startTime: Dayjs,
  blockStartTime: Dayjs,
  blockEndTime: Dayjs
) {
  const minutesFromStart = blockStartTime.diff(startTime, 'minute');
  const durationMinutes = blockEndTime.diff(blockStartTime, 'minute');

  return {
    top: minutesFromStart * TIME_SLOT_HEIGHT,
    height: durationMinutes * TIME_SLOT_HEIGHT
  };
}

export function snapToGrid(yPosition: number): number {
  const slotHeight = MINUTES_PER_SLOT * TIME_SLOT_HEIGHT;
  return Math.round(yPosition / slotHeight) * slotHeight;
}

export function calculateTimeFromPosition(position: number, startTime: Dayjs): Dayjs {
  const minutes = Math.round(position / TIME_SLOT_HEIGHT);
  return startTime.add(minutes, 'minute');
}

export function getColumnStartTime(
  column: 'judging' | 'field',
  judgingStartTime: Dayjs,
  fieldStartTime: Dayjs
): Dayjs {
  return column === 'judging' ? judgingStartTime : fieldStartTime;
}

export function createScheduleBlock(
  type: ScheduleBlockType,
  column: 'judging' | 'field',
  startTime: Dayjs,
  endTime: Dayjs,
  roundNumber?: number
): ScheduleBlock {
  const id = `${type}-${column}-${roundNumber || Date.now()}`;
  let title = '';

  switch (type) {
    case 'practice-match':
      title = `Practice Round ${roundNumber}`;
      break;
    case 'ranking-match':
      title = `Ranking Round ${roundNumber}`;
      break;
    case 'judging-session':
      title = `Judging Session ${roundNumber}`;
      break;
    case 'break':
      title = 'Break';
      break;
  }

  return {
    id,
    type,
    column,
    startTime,
    endTime,
    title,
    roundNumber,
    canDelete: type !== 'break' && roundNumber !== 1 // Can't delete first round
  };
}

export function generateInitialSchedule(
  baseStartTime: Dayjs,
  teamsCount: number,
  roomsCount: number,
  tablesCount: number,
  staggerMatches: boolean,
  practiceCycleTime: Dayjs,
  rankingCycleTime: Dayjs,
  judgingSessionCycleTime: Dayjs
): { blocks: ScheduleBlock[]; judgingStartTime: Dayjs; fieldStartTime: Dayjs } {
  const blocks: ScheduleBlock[] = [];

  // Calculate sessions and matches
  const judgingSessions = Math.ceil(teamsCount / roomsCount);
  const matchesPerRound = Math.ceil(teamsCount / tablesCount) * (staggerMatches ? 0.5 : 1);

  // Both columns start at the same time initially, but can diverge
  const judgingStartTime = baseStartTime.clone();
  const fieldStartTime = baseStartTime.clone();

  let currentTime = judgingStartTime.clone();

  // Generate judging sessions
  for (let i = 1; i <= judgingSessions; i++) {
    const endTime = currentTime.add(
      judgingSessionCycleTime.minute() * 60 + judgingSessionCycleTime.second(),
      'second'
    );

    blocks.push(createScheduleBlock('judging-session', 'judging', currentTime, endTime, i));
    currentTime = endTime.clone();
  }

  // Reset time for field events
  currentTime = fieldStartTime.clone();

  // Generate practice round
  const practiceEndTime = currentTime.add(
    (practiceCycleTime.minute() * 60 + practiceCycleTime.second()) * matchesPerRound,
    'second'
  );
  blocks.push(createScheduleBlock('practice-match', 'field', currentTime, practiceEndTime, 1));

  // Generate ranking rounds (default to 3)
  currentTime = practiceEndTime.clone();
  for (let i = 1; i <= 3; i++) {
    const endTime = currentTime.add(
      (rankingCycleTime.minute() * 60 + rankingCycleTime.second()) * matchesPerRound,
      'second'
    );

    blocks.push(createScheduleBlock('ranking-match', 'field', currentTime, endTime, i));
    currentTime = endTime.clone();
  }

  return { blocks, judgingStartTime, fieldStartTime };
}

export function adjustOrCreateBreak(
  blocks: ScheduleBlock[],
  column: 'judging' | 'field',
  targetBlock: ScheduleBlock,
  timeDiff: number // in minutes (positive = forward, negative = backward)
): ScheduleBlock[] {
  const columnBlocks = blocks
    .filter(b => b.column === column)
    .sort((a, b) => a.startTime.valueOf() - b.startTime.valueOf());

  const targetIndex = columnBlocks.findIndex(b => b.id === targetBlock.id);
  if (targetIndex === -1) return blocks;

  // Find the block immediately before the target
  const previousBlock = targetIndex > 0 ? columnBlocks[targetIndex - 1] : null;

  if (timeDiff > 0) {
    // Moving forward - need to create or extend break before target block
    if (previousBlock && previousBlock.type === 'break') {
      // There's already a break before this block - extend it
      return blocks.map(block => {
        if (block.id === previousBlock.id) {
          return {
            ...block,
            endTime: block.endTime.add(timeDiff, 'minute')
          };
        } else if (
          block.column === column &&
          (block.startTime.isAfter(previousBlock.endTime) ||
            block.startTime.isSame(previousBlock.endTime))
        ) {
          // Shift this block and all subsequent blocks
          return {
            ...block,
            startTime: block.startTime.add(timeDiff, 'minute'),
            endTime: block.endTime.add(timeDiff, 'minute')
          };
        }
        return block;
      });
    } else {
      // No break before this block - create a new one
      return insertBreak(blocks, column, targetBlock.startTime, timeDiff);
    }
  } else {
    // Moving backward - try to reduce previous break
    return reducePreviousBreak(blocks, column, targetBlock, timeDiff);
  }
}

export function insertBreak(
  blocks: ScheduleBlock[],
  column: 'judging' | 'field',
  insertTime: Dayjs,
  duration: number // in minutes
): ScheduleBlock[] {
  const columnBlocks = blocks.filter(b => b.column === column && b.type !== 'break');
  const otherBlocks = blocks.filter(b => b.column !== column);
  const existingBreaks = blocks.filter(b => b.column === column && b.type === 'break');

  // Find the block that should be pushed back
  const blockToShift = columnBlocks.find(
    b => b.startTime.isAfter(insertTime) || b.startTime.isSame(insertTime)
  );

  if (!blockToShift) return blocks;

  // Check if there's already a break at the exact insertion time
  const existingBreakAtTime = existingBreaks.find(b => b.startTime.isSame(insertTime));

  if (existingBreakAtTime) {
    // Modify existing break instead of creating a new one
    const newDuration =
      existingBreakAtTime.endTime.diff(existingBreakAtTime.startTime, 'minute') + duration;

    if (newDuration <= 0) {
      // Remove the break if duration becomes 0 or negative
      return removeBreak(blocks, existingBreakAtTime.id);
    } else {
      // Extend the existing break and shift subsequent blocks
      const extendedBreak = {
        ...existingBreakAtTime,
        endTime: existingBreakAtTime.endTime.add(duration, 'minute')
      };

      // Shift all blocks that come after the extended break
      const shiftedBlocks = columnBlocks.map(block => {
        if (
          block.startTime.isAfter(existingBreakAtTime.endTime) ||
          block.startTime.isSame(existingBreakAtTime.endTime)
        ) {
          return {
            ...block,
            startTime: block.startTime.add(duration, 'minute'),
            endTime: block.endTime.add(duration, 'minute')
          };
        }
        return block;
      });

      // Shift other breaks that come after the extended break
      const shiftedBreaks = existingBreaks.map(breakBlock => {
        if (breakBlock.id === existingBreakAtTime.id) {
          return extendedBreak;
        } else if (breakBlock.startTime.isAfter(existingBreakAtTime.endTime)) {
          return {
            ...breakBlock,
            startTime: breakBlock.startTime.add(duration, 'minute'),
            endTime: breakBlock.endTime.add(duration, 'minute')
          };
        }
        return breakBlock;
      });

      return [...otherBlocks, ...shiftedBlocks, ...shiftedBreaks];
    }
  } else {
    // Create new break block
    const breakBlock = createScheduleBlock(
      'break',
      column,
      insertTime,
      insertTime.add(duration, 'minute')
    );

    // Shift all subsequent blocks (including breaks)
    const shiftedBlocks = columnBlocks.map(block => {
      if (block.startTime.isAfter(insertTime) || block.startTime.isSame(insertTime)) {
        const shiftAmount = duration;
        return {
          ...block,
          startTime: block.startTime.add(shiftAmount, 'minute'),
          endTime: block.endTime.add(shiftAmount, 'minute')
        };
      }
      return block;
    });

    // Also shift existing breaks that come after the insertion point
    const shiftedBreaks = existingBreaks.map(breakBlock => {
      if (breakBlock.startTime.isAfter(insertTime) || breakBlock.startTime.isSame(insertTime)) {
        return {
          ...breakBlock,
          startTime: breakBlock.startTime.add(duration, 'minute'),
          endTime: breakBlock.endTime.add(duration, 'minute')
        };
      }
      return breakBlock;
    });

    return [...otherBlocks, ...shiftedBlocks, ...shiftedBreaks, breakBlock];
  }
}

export function removeBreak(blocks: ScheduleBlock[], breakId: string): ScheduleBlock[] {
  const breakBlock = blocks.find(b => b.id === breakId);
  if (!breakBlock || breakBlock.type !== 'break') return blocks;

  const breakDuration = breakBlock.endTime.diff(breakBlock.startTime, 'minute');
  const column = breakBlock.column;

  // Remove the break and shift subsequent blocks back
  const filteredBlocks = blocks.filter(b => b.id !== breakId);

  return filteredBlocks.map(block => {
    if (block.column === column && block.startTime.isAfter(breakBlock.startTime)) {
      return {
        ...block,
        startTime: block.startTime.subtract(breakDuration, 'minute'),
        endTime: block.endTime.subtract(breakDuration, 'minute')
      };
    }
    return block;
  });
}

export function reducePreviousBreak(
  blocks: ScheduleBlock[],
  column: 'judging' | 'field',
  targetBlock: ScheduleBlock,
  reductionMinutes: number
): ScheduleBlock[] {
  // Find the break immediately before the target block
  const columnBlocks = blocks
    .filter(b => b.column === column)
    .sort((a, b) => a.startTime.valueOf() - b.startTime.valueOf());

  const targetIndex = columnBlocks.findIndex(b => b.id === targetBlock.id);
  if (targetIndex <= 0) return blocks;

  const previousBlock = columnBlocks[targetIndex - 1];
  if (previousBlock.type !== 'break') return blocks;

  const currentBreakDuration = previousBlock.endTime.diff(previousBlock.startTime, 'minute');
  const newDuration = currentBreakDuration + reductionMinutes; // reductionMinutes is negative

  if (newDuration <= 0) {
    // Remove the break entirely and shift everything back
    return removeBreak(blocks, previousBlock.id);
  } else {
    // Reduce the break duration and shift the target block and everything after it
    return blocks.map(block => {
      if (block.id === previousBlock.id) {
        return {
          ...block,
          endTime: block.startTime.add(newDuration, 'minute')
        };
      } else if (
        block.column === column &&
        (block.startTime.isAfter(previousBlock.startTime) ||
          block.startTime.isSame(previousBlock.endTime))
      ) {
        return {
          ...block,
          startTime: block.startTime.add(reductionMinutes, 'minute'),
          endTime: block.endTime.add(reductionMinutes, 'minute')
        };
      }
      return block;
    });
  }
}
