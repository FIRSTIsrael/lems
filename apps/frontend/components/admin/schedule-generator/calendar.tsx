import { WithId } from 'mongodb';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Stack, Box, Typography, Paper } from '@mui/material';
import {
  Team,
  JudgingRoom,
  RobotGameTable,
  FllEvent,
  Division,
  ScheduleGenerationSettings
} from '@lems/types';
import dayjs, { Dayjs } from 'dayjs';

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
  const [events, setEvents] = useState<CalendarEvent[]>([]);

  useEffect(() => {
    setEvents(generateInitialEvents({ event, settings, teams, rooms, tables }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(settings)]);

  const timeRange = useMemo(() => {
    // Set to 6:00-20:00 for the event day
    return {
      start: dayjs(event.startDate).set('hour', 6).set('minute', 0),
      end: dayjs(event.endDate).set('hour', 20).set('minute', 0)
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const columnEvents = useMemo(() => {
    return {
      judging: events.filter(e => e.column === 'judging'),
      field: events.filter(e => e.column === 'field')
    };
  }, [events]);

  const calculateBreakPositions = (columnEvents: CalendarEvent[]) => {
    const positions: { top: CalendarEvent; bottom: CalendarEvent }[] = [];

    const sortedEvents = columnEvents
      .filter(e => e.type !== 'break')
      .sort((a, b) => dayjs(a.startTime).valueOf() - dayjs(b.startTime).valueOf());

    for (let i = 0; i < sortedEvents.length - 1; i++) {
      const currentEvent = sortedEvents[i];
      const nextEvent = sortedEvents[i + 1];

      const hasBreakBetween = columnEvents.some(
        e =>
          e.type === 'break' &&
          !dayjs(e.startTime).isBefore(dayjs(currentEvent.endTime)) &&
          !dayjs(e.endTime).isAfter(dayjs(nextEvent.startTime))
      );

      if (!hasBreakBetween) {
        positions.push({
          top: currentEvent,
          bottom: nextEvent
        });
      }
    }

    return positions;
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

    const updatedEvents = events.map(event => {
      if (event.column === column && !dayjs(event.startTime).isBefore(startTime)) {
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

  const handleBreakResize = (breakEvent: CalendarEvent, newDuration: number) => {
    const oldDuration = dayjs(breakEvent.endTime).diff(dayjs(breakEvent.startTime), 'minute');
    const durationDiff = newDuration - oldDuration;

    const updatedEvents = events.map(event => {
      if (event.id === breakEvent.id) {
        // Update the break duration
        return {
          ...event,
          endTime: dayjs(event.startTime).add(newDuration, 'minute').toDate()
        };
      } else if (
        event.column === breakEvent.column &&
        dayjs(event.startTime).isAfter(dayjs(breakEvent.startTime))
      ) {
        // Shift all subsequent events in the same column
        return {
          ...event,
          startTime: dayjs(event.startTime).add(durationDiff, 'minute').toDate(),
          endTime: dayjs(event.endTime).add(durationDiff, 'minute').toDate()
        };
      }
      return event;
    });

    setEvents(updatedEvents);
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
              <EventBlock
                key={event.id}
                event={event}
                startTime={timeRange.start}
                onBreakResize={handleBreakResize}
              />
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
              <EventBlock
                key={event.id}
                event={event}
                startTime={timeRange.start}
                onBreakResize={handleBreakResize}
              />
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

const EventBlock: React.FC<{
  event: CalendarEvent;
  startTime: dayjs.Dayjs;
  onBreakResize?: (event: CalendarEvent, newDuration: number) => void;
}> = ({ event, startTime, onBreakResize }) => {
  const duration = dayjs(event.endTime).diff(dayjs(event.startTime), 'minute');
  const height = (duration / MINUTES_PER_SLOT) * TIME_SLOT_HEIGHT;
  const [isDragging, setIsDragging] = useState(false);
  const [isResizeHover, setIsResizeHover] = useState(false);
  const dragStartY = useRef<number | null>(null);
  const dragStartDuration = useRef<number>(duration);

  const minutesFromStart = dayjs(event.startTime).diff(startTime, 'minute');
  const top = (minutesFromStart / MINUTES_PER_SLOT) * TIME_SLOT_HEIGHT;

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (event.type === 'break' && isResizeHover) {
        e.preventDefault();
        setIsDragging(true);
        dragStartY.current = e.clientY;
        dragStartDuration.current = duration;
      }
    },
    [event.type, isResizeHover, duration]
  );

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (isDragging && dragStartY.current !== null && onBreakResize && event.type === 'break') {
        const deltaY = e.clientY - dragStartY.current;
        const deltaMinutes = Math.round(deltaY / TIME_SLOT_HEIGHT) * MINUTES_PER_SLOT;
        const newDuration = Math.max(MINUTES_PER_SLOT, dragStartDuration.current + deltaMinutes);
        onBreakResize(event, newDuration);
      }
    },
    [isDragging, event, onBreakResize]
  );

  const handleMouseUp = useCallback(() => {
    if (isDragging) {
      setIsDragging(false);
      dragStartY.current = null;
    }
  }, [isDragging]);

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp]);

  const getEventTitle = useCallback(() => {
    switch (event.type) {
      case 'judging':
        return `סבב שיפוט ${event.number}`;
      case 'practice':
        return `סבב אימונים ${event.number}`;
      case 'ranking':
        return `סבב דירוג ${event.number}`;
      case 'break':
        return `הפסקה`;
      default:
        return '';
    }
  }, [event.type, event.number]);

  const getEventColor = useCallback(() => {
    switch (event.type) {
      case 'judging':
        return '#5b8e7d';
      case 'practice':
        return '#f4a259';
      case 'ranking':
        return '#bc4b51';
      case 'break':
        return '#8cb369';
      default:
        return '#f4e285';
    }
  }, [event.type]);

  return (
    <Paper
      elevation={2}
      sx={{
        position: 'absolute',
        width: '95%',
        height,
        top,
        backgroundColor: getEventColor(),
        p: 1,
        borderRadius: 1,
        zIndex: 2,
        cursor: event.type === 'break' && isResizeHover ? 'ns-resize' : 'default',
        '&::after':
          event.type === 'break'
            ? {
                content: '""',
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                height: '8px',
                cursor: 'ns-resize'
              }
            : {}
      }}
      onMouseDown={handleMouseDown}
      onMouseMove={e => {
        if (event.type === 'break') {
          const rect = e.currentTarget.getBoundingClientRect();
          const isInResizeZone = e.clientY >= rect.bottom - 8;
          setIsResizeHover(isInResizeZone);
        }
      }}
      onMouseLeave={() => setIsResizeHover(false)}
    >
      <Typography variant="body2">{getEventTitle()}</Typography>
      <Typography variant="caption">
        {dayjs(event.startTime).format('HH:mm')} - {dayjs(event.endTime).format('HH:mm')}
      </Typography>
    </Paper>
  );
};

const generateInitialEvents = ({
  event,
  settings,
  teams,
  rooms,
  tables
}: Omit<CalendarProps, 'division'>): CalendarEvent[] => {
  const events: CalendarEvent[] = [];

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
    .set('minute', judgingStart?.getMinutes() ?? 0);

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

const generateTimeSlots = (start: Dayjs, end: Dayjs) => {
  const slots: dayjs.Dayjs[] = [];
  let current = start;

  while (current.isBefore(end) || current.isSame(end)) {
    slots.push(current);
    current = current.add(MINUTES_PER_SLOT, 'minute');
  }

  return slots;
};

export default Calendar;
