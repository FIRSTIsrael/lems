import { WithId } from 'mongodb';
import dayjs from 'dayjs';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Stack, Box, Typography, Paper } from '@mui/material';
import { Team, JudgingRoom, RobotGameTable, ScheduleGenerationSettings } from '@lems/types';
import {
  CalendarEvent,
  DEFAULT_BREAK_DURATION_MINUTES,
  COLUMN_WIDTH,
  MINUTES_PER_SLOT,
  TIME_SLOT_HEIGHT,
  generateEvents,
  generateTimeSlots
} from './common';
import { BreakIndicator } from './break-indicator';
import { EventBlock } from './event-block';

export interface CalendarProps {
  date: Date;
  settings: ScheduleGenerationSettings;
  teams: WithId<Team>[];
  rooms: WithId<JudgingRoom>[];
  tables: WithId<RobotGameTable>[];
}

const Calendar: React.FC<CalendarProps> = ({ date, settings, teams, rooms, tables }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [events, setEvents] = useState<CalendarEvent[]>([]);

  useEffect(() => {
    setEvents(generateEvents({ date, settings, teams, rooms, tables }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(settings)]);

  const timeRange = useMemo(() => {
    // Set to 6:00-20:00 for the event day
    return {
      start: dayjs(date).set('hour', 6).set('minute', 0),
      end: dayjs(date).set('hour', 20).set('minute', 0)
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
    // Calculate adjusted duration to make end time divisible by 5
    const defaultEndTime = startTime.add(DEFAULT_BREAK_DURATION_MINUTES, 'minutes');
    const minutesFromStart = defaultEndTime.minute();
    const extraMinutes = minutesFromStart % 5 === 0 ? 0 : 5 - (minutesFromStart % 5);
    const adjustedDuration = DEFAULT_BREAK_DURATION_MINUTES + extraMinutes;

    const newBreak: CalendarEvent = {
      id: `break-${column}-${startTime.valueOf()}`,
      type: 'break',
      startTime: startTime.toDate(),
      endTime: startTime.add(adjustedDuration, 'minutes').toDate(),
      number: events.filter(e => e.type === 'break').length + 1,
      column
    };

    const updatedEvents = events.map(event => {
      if (event.column === column && !dayjs(event.startTime).isBefore(startTime)) {
        return {
          ...event,
          startTime: dayjs(event.startTime).add(adjustedDuration, 'minutes').toDate(),
          endTime: dayjs(event.endTime).add(adjustedDuration, 'minutes').toDate()
        };
      }
      return event;
    });

    setEvents([...updatedEvents, newBreak]);
  };

  const handleBreakResize = (breakEvent: CalendarEvent, newDuration: number) => {
    // Adjust the new duration to ensure end time is divisible by 5
    const endMinute = dayjs(breakEvent.startTime).add(newDuration, 'minutes').minute();
    const extraMinutes = endMinute % 5 === 0 ? 0 : 5 - (endMinute % 5);
    const adjustedNewDuration = newDuration + extraMinutes;

    const oldDuration = dayjs(breakEvent.endTime).diff(dayjs(breakEvent.startTime), 'minute');
    const durationDiff = adjustedNewDuration - oldDuration;

    const updatedEvents = events.map(event => {
      if (event.id === breakEvent.id) {
        // Update the break duration
        return {
          ...event,
          endTime: dayjs(event.startTime).add(adjustedNewDuration, 'minute').toDate()
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

export default Calendar;
