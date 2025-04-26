import { WithId } from 'mongodb';
import { useMemo, useRef, useState } from 'react';
import { Stack, Box, Typography, Paper } from '@mui/material';
import {
  Team,
  JudgingRoom,
  RobotGameTable,
  FllEvent,
  Division,
  ScheduleGenerationSettings
} from '@lems/types';
import dayjs from 'dayjs';

// Constants
const COLUMN_WIDTH = 300;
const TIME_SLOT_HEIGHT = 20; // 5 minutes in pixels
const MINUTES_PER_SLOT = 5;
const BREAK_DURATION_MINUTES = 15;
const HOVER_AREA_HEIGHT = 20; // Height of the clickable area for breaks

export interface CalendarProps {
  event: WithId<FllEvent>;
  division: WithId<Division>;
  settings: ScheduleGenerationSettings;
  teams: WithId<Team>[];
  rooms: WithId<JudgingRoom>[];
  tables: WithId<RobotGameTable>[];
}

interface CalendarEvent {
  id: string;
  type: 'judging' | 'practice' | 'ranking' | 'break';
  startTime: Date;
  endTime: Date;
  number: number;
  column: 'judging' | 'field';
}

// Break indicator component that appears between events
const BreakIndicator: React.FC<{
  topEvent: CalendarEvent;
  bottomEvent: CalendarEvent;
  startTime: dayjs.Dayjs;
  onClick: () => void;
}> = ({ topEvent, bottomEvent, startTime, onClick }) => {
  const [isHovered, setIsHovered] = useState(false);

  // Calculate position between events
  const topEventEnd = dayjs(topEvent.endTime);
  const bottomEventStart = dayjs(bottomEvent.startTime);
  const gap = bottomEventStart.diff(topEventEnd, 'minute');

  const topOffset =
    (dayjs(topEvent.endTime).diff(startTime, 'minute') / MINUTES_PER_SLOT) * TIME_SLOT_HEIGHT;

  return (
    <Box
      sx={{
        position: 'absolute',
        width: '95%',
        height: `${HOVER_AREA_HEIGHT}px`,
        top: topOffset - HOVER_AREA_HEIGHT / 2,
        backgroundColor: isHovered ? 'rgba(25, 118, 210, 0.2)' : 'transparent',
        cursor: 'pointer',
        transition: 'all 0.2s ease-in-out',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        '&:hover': {
          backgroundColor: 'rgba(25, 118, 210, 0.4)',
          '&::after': {
            content: '"הוסף הפסקה"',
            position: 'absolute',
            right: '105%',
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            color: 'white',
            padding: '4px 8px',
            borderRadius: '4px',
            fontSize: '12px',
            whiteSpace: 'nowrap',
            zIndex: 1000
          }
        },
        '&::before': {
          content: '""',
          position: 'absolute',
          width: '100%',
          height: '2px',
          backgroundColor: isHovered ? 'rgba(25, 118, 210, 0.6)' : 'rgba(25, 118, 210, 0.3)'
        },
        zIndex: 3
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onClick}
      data-gap={`${gap}min`}
    />
  );
};

const Calendar: React.FC<CalendarProps> = ({ event, division, settings, teams, rooms, tables }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const events = useMemo<CalendarEvent[]>(
    () => generateInitialEvents({ event, settings, teams, rooms, tables }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [JSON.stringify(settings)]
  );

  // Calculate time range for display
  const timeRange = useMemo(() => {
    return {
      start: dayjs(event.startDate).set('hour', 6).set('minute', 0),
      end: dayjs(event.endDate).set('hour', 20).set('minute', 0)
    };
  }, []);

  // Group events by column
  const columnEvents = useMemo(() => {
    return {
      judging: events.filter(e => e.column === 'judging'),
      field: events.filter(e => e.column === 'field')
    };
  }, [events]);

  // Calculate possible break positions for each column
  const calculateBreakPositions = (columnEvents: CalendarEvent[]) => {
    const positions: { top: CalendarEvent; bottom: CalendarEvent }[] = [];

    const sortedEvents = columnEvents
      .filter(e => e.type !== 'break')
      .sort((a, b) => dayjs(a.startTime).valueOf() - dayjs(b.startTime).valueOf());

    for (let i = 0; i < sortedEvents.length - 1; i++) {
      const currentEvent = sortedEvents[i];
      const nextEvent = sortedEvents[i + 1];

      const gap = dayjs(nextEvent.startTime).diff(dayjs(currentEvent.endTime), 'minute');

      if (gap >= BREAK_DURATION_MINUTES) {
        positions.push({
          top: currentEvent,
          bottom: nextEvent
        });
      }
    }

    return positions;
  };

  return (
    <Paper ref={containerRef} sx={{ height: '600px', overflow: 'auto' }}>
      <Stack direction="row" spacing={2} p={2}>
        {/* Time axis */}
        <Box width={60} flexShrink={0}>
          {generateTimeSlots(timeRange.start, timeRange.end).map((time, index) => (
            <Box
              key={index}
              height={TIME_SLOT_HEIGHT}
              display="flex"
              alignItems="center"
              sx={{
                borderBottom:
                  index % (60 / MINUTES_PER_SLOT) === 0 ? '1px solid rgba(0,0,0,0.12)' : 'none',
                backgroundColor:
                  index % (60 / MINUTES_PER_SLOT) === 0 ? 'rgba(0,0,0,0.02)' : 'transparent'
              }}
            >
              {index % (60 / MINUTES_PER_SLOT) === 0 && (
                <Typography variant="caption">{time.format('HH:mm')}</Typography>
              )}
            </Box>
          ))}
        </Box>

        {/* Judging Column */}
        <Box width={COLUMN_WIDTH}>
          <Typography variant="h6" gutterBottom>
            שיפוט
          </Typography>
          <Box
            sx={{
              position: 'relative',
              minHeight: '100%',
              backgroundImage: 'linear-gradient(rgba(0,0,0,0.06) 1px, transparent 1px)',
              backgroundSize: `100% ${TIME_SLOT_HEIGHT * (60 / MINUTES_PER_SLOT)}px`,
              backgroundPosition: '0 0'
            }}
          >
            {columnEvents.judging.map(event => (
              <EventBlock key={event.id} event={event} startTime={timeRange.start} />
            ))}
            {calculateBreakPositions(columnEvents.judging).map((position, index) => (
              <BreakIndicator
                key={`break-indicator-judging-${index}`}
                topEvent={position.top}
                bottomEvent={position.bottom}
                startTime={timeRange.start}
                onClick={() => {
                  const startTime = dayjs(position.top.endTime);
                  addBreak('judging', startTime);
                }}
              />
            ))}
          </Box>
        </Box>

        {/* Field Column */}
        <Box width={COLUMN_WIDTH}>
          <Typography variant="h6" gutterBottom>
            זירה
          </Typography>
          <Box
            sx={{
              position: 'relative',
              minHeight: '100%',
              backgroundImage: 'linear-gradient(rgba(0,0,0,0.06) 1px, transparent 1px)',
              backgroundSize: `100% ${TIME_SLOT_HEIGHT * (60 / MINUTES_PER_SLOT)}px`,
              backgroundPosition: '0 0'
            }}
          >
            {columnEvents.field.map(event => (
              <EventBlock key={event.id} event={event} startTime={timeRange.start} />
            ))}
            {calculateBreakPositions(columnEvents.field).map((position, index) => (
              <BreakIndicator
                key={`break-indicator-field-${index}`}
                topEvent={position.top}
                bottomEvent={position.bottom}
                startTime={timeRange.start}
                onClick={() => {
                  const startTime = dayjs(position.top.endTime);
                  addBreak('field', startTime);
                }}
              />
            ))}
          </Box>
        </Box>
      </Stack>
    </Paper>
  );
};

// Event block subcomponent
const EventBlock: React.FC<{
  event: CalendarEvent;
  startTime: dayjs.Dayjs;
}> = ({ event, startTime }) => {
  const duration = dayjs(event.endTime).diff(dayjs(event.startTime), 'minute');
  const height = (duration / MINUTES_PER_SLOT) * TIME_SLOT_HEIGHT;

  const minutesFromStart = dayjs(event.startTime).diff(startTime, 'minute');
  const top = (minutesFromStart / MINUTES_PER_SLOT) * TIME_SLOT_HEIGHT;

  return (
    <Paper
      elevation={2}
      sx={{
        position: 'absolute',
        width: '95%',
        height,
        top,
        backgroundColor: getEventColor(event.type),
        p: 1,
        borderRadius: 1,
        zIndex: 2
      }}
    >
      <Typography variant="body2">
        {event.type === 'judging'
          ? `סבב שיפוט ${event.number}`
          : event.type === 'practice'
            ? `סבב אימונים ${event.number}`
            : event.type === 'ranking'
              ? `סבב דירוג ${event.number}`
              : `הפסקה`}
      </Typography>
      <Typography variant="caption">
        {dayjs(event.startTime).format('HH:mm')} - {dayjs(event.endTime).format('HH:mm')}
      </Typography>
    </Paper>
  );
};

// Helper functions
const generateInitialEvents = ({
  event,
  settings,
  teams,
  rooms,
  tables
}: Omit<CalendarProps, 'division'>): CalendarEvent[] => {
  const events: CalendarEvent[] = [];

  // Calculate judging sessions
  const {
    judgingStart,
    matchesStart,
    judgingCycleTimeSeconds,
    isStaggered,
    practiceCycleTimeSeconds,
    practiceRounds,
    rankingCycleTimeSeconds,
    rankingRounds
  } = settings;
  const judgingRounds = Math.ceil(teams.length / rooms.length);

  let currentTime = dayjs(event.startDate)
    .set('hour', judgingStart?.getHours() ?? 0)
    .set('minute', matchesStart?.getMinutes() ?? 0);

  // Add judging events
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
  }

  // Calculate field matches
  const matchesPerRound = Math.ceil(teams.length / tables.length) * (isStaggered ? 2 : 1);
  currentTime = dayjs(event.startDate)
    .set('hour', matchesStart?.getHours() ?? 0)
    .set('minute', matchesStart?.getMinutes() ?? 0);

  // Add practice rounds
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
  }

  // Add ranking rounds
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
  }

  return events;
};

const generateTimeSlots = (start: dayjs.Dayjs, end: dayjs.Dayjs) => {
  const slots: dayjs.Dayjs[] = [];
  let current = start;

  while (current.isBefore(end) || current.isSame(end)) {
    slots.push(current);
    current = current.add(MINUTES_PER_SLOT, 'minute');
  }

  return slots;
};

const getEventColor = (type: CalendarEvent['type']) => {
  switch (type) {
    case 'judging':
      return '#d87cac';
    case 'practice':
      return '#ffda22';
    case 'ranking':
      return '#004f2d';
    case 'break':
      return '#e0e0e0';
    default:
      return '#grey';
  }
};

const addBreak = (column: 'judging' | 'field', startTime: dayjs.Dayjs) => {
  const newBreak: CalendarEvent = {
    id: `break-${column}-${startTime.valueOf()}`,
    type: 'break',
    startTime: startTime.toDate(),
    endTime: startTime.add(BREAK_DURATION_MINUTES, 'minutes').toDate(),
    number: events.filter(e => e.type === 'break').length + 1,
    column
  };

  // Insert the break and adjust following events
  const updatedEvents = events.map(event => {
    if (event.column === column && dayjs(event.startTime).isAfter(startTime)) {
      return {
        ...event,
        startTime: dayjs(event.startTime).add(BREAK_DURATION_MINUTES, 'minutes').toDate(),
        endTime: dayjs(event.endTime).add(BREAK_DURATION_MINUTES, 'minutes').toDate()
      };
    }
    return event;
  });

  setEvents([...updatedEvents, newBreak]);
};

export default Calendar;
