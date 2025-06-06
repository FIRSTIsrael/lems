import { WithId } from 'mongodb';
import dayjs, { Dayjs } from 'dayjs';
import { Team, JudgingRoom, RobotGameTable, ScheduleGenerationSettings } from '@lems/types';

export const COLUMN_WIDTH = 300;
export const TIME_SLOT_HEIGHT = 20; // 5 minutes in pixels
export const MINUTES_PER_SLOT = 5;
export const DEFAULT_BREAK_DURATION_MINUTES = 15;
export const HOVER_AREA_HEIGHT = 20; // Height of the clickable area for breaks

export interface CalendarEvent {
  id: string;
  type: 'judging' | 'practice' | 'ranking' | 'break';
  startTime: Date;
  endTime: Date;
  number: number;
  column: 'judging' | 'field';
}

export const generateTimeSlots = (start: Dayjs, end: Dayjs) => {
  const slots: dayjs.Dayjs[] = [];
  let current = start;

  while (current.isBefore(end) || current.isSame(end)) {
    slots.push(current);
    current = current.add(MINUTES_PER_SLOT, 'minute');
  }

  return slots;
};

export const generateEvents = ({
  date,
  settings,
  teams,
  rooms,
  tables
}: {
  date: Date;
  settings: ScheduleGenerationSettings;
  teams: Array<WithId<Team>>;
  rooms: Array<WithId<JudgingRoom>>;
  tables: Array<WithId<RobotGameTable>>;
}): CalendarEvent[] => {
  const events: CalendarEvent[] = [];

  const {
    judgingStart,
    matchesStart,
    judgingCycleTimeSeconds,
    isStaggered,
    practiceCycleTimeSeconds,
    practiceRounds,
    rankingCycleTimeSeconds,
    rankingRounds,
    breaks
  } = settings;
  const judgingRounds = Math.ceil(teams.length / rooms.length);
  const matchesPerRound = Math.ceil(teams.length / tables.length) * (isStaggered ? 2 : 1);

  let currentTime = dayjs(date)
    .set('hour', judgingStart?.getHours() ?? 0)
    .set('minute', judgingStart?.getMinutes() ?? 0);

  // Add judging events and breaks
  for (let i = 0; i < judgingRounds; i++) {
    events.push({
      id: `judging-${i}`,
      type: 'judging',
      startTime: currentTime.toDate(),
      endTime: currentTime.add(judgingCycleTimeSeconds ?? 1, 'second').toDate(),
      number: i + 1,
      column: 'judging'
    });
    currentTime = currentTime.add(judgingCycleTimeSeconds ?? 1, 'second');

    // Add judging break if configured
    const judgingBreak = breaks.find(b => b.eventType === 'judging' && b.after === i + 1);
    if (judgingBreak) {
      events.push({
        id: `judging-break-${i}`,
        type: 'break',
        startTime: currentTime.toDate(),
        endTime: currentTime.add(judgingBreak.durationSeconds, 'second').toDate(),
        number: events.filter(e => e.type === 'break').length + 1,
        column: 'judging'
      });
      currentTime = currentTime.add(judgingBreak.durationSeconds, 'second');
    }
  }

  currentTime = dayjs(date)
    .set('hour', matchesStart?.getHours() ?? 0)
    .set('minute', matchesStart?.getMinutes() ?? 0);

  // Add practice rounds and breaks
  for (let i = 0; i < practiceRounds; i++) {
    const duration = matchesPerRound * (practiceCycleTimeSeconds ?? 1);
    events.push({
      id: `practice-${i}`,
      type: 'practice',
      startTime: currentTime.toDate(),
      endTime: currentTime.add(duration, 'second').toDate(),
      number: i + 1,
      column: 'field'
    });
    currentTime = currentTime.add(duration, 'second');

    // Add match break if configured
    const practiceBreak = breaks.find(
      b =>
        b.eventType === 'match' &&
        b.matchType === 'practice' &&
        b.after === (i + 1) * matchesPerRound
    );
    if (practiceBreak) {
      events.push({
        id: `field-break-practice-${i}`,
        type: 'break',
        startTime: currentTime.toDate(),
        endTime: currentTime.add(practiceBreak.durationSeconds, 'second').toDate(),
        number: events.filter(e => e.type === 'break').length + 1,
        column: 'field'
      });
      currentTime = currentTime.add(practiceBreak.durationSeconds, 'second');
    }
  }

  // Add ranking rounds and breaks
  for (let i = 0; i < rankingRounds; i++) {
    const duration = matchesPerRound * (rankingCycleTimeSeconds ?? 1);
    events.push({
      id: `ranking-${i}`,
      type: 'ranking',
      startTime: currentTime.toDate(),
      endTime: currentTime.add(duration, 'second').toDate(),
      number: i + 1,
      column: 'field'
    });
    currentTime = currentTime.add(duration, 'second');

    // Add match break if configured, looking specifically for ranking match breaks
    const rankingBreak = breaks.find(
      b =>
        b.eventType === 'match' &&
        b.matchType === 'ranking' &&
        b.after === (i + 1 + practiceRounds) * matchesPerRound
    );
    if (rankingBreak) {
      events.push({
        id: `field-break-ranking-${i}`,
        type: 'break',
        startTime: currentTime.toDate(),
        endTime: currentTime.add(rankingBreak.durationSeconds, 'second').toDate(),
        number: events.filter(e => e.type === 'break').length + 1,
        column: 'field'
      });
      currentTime = currentTime.add(rankingBreak.durationSeconds, 'second');
    }
  }

  return events;
};
