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

    // Sort events to ensure we process them in chronological order
    const sortedEvents = [...events].sort(
      (a, b) => dayjs(a.startTime).valueOf() - dayjs(b.startTime).valueOf()
    );

    let timeShift = adjustedDuration;
    const updatedEvents = sortedEvents.map(event => {
      if (event.column === column && !dayjs(event.startTime).isBefore(startTime)) {
        const newStartTime = dayjs(event.startTime).add(timeShift, 'minutes');
        let newEndTime = dayjs(event.endTime).add(timeShift, 'minutes');

        // If this is a break, ensure its end time is divisible by 5
        if (event.type === 'break') {
          const endMinutes = newEndTime.minute();
          const extraMins = endMinutes % 5 === 0 ? 0 : 5 - (endMinutes % 5);
          if (extraMins > 0) {
            newEndTime = newEndTime.add(extraMins, 'minutes');
            // Update timeShift for subsequent events
            timeShift += extraMins;
          }
        }

        return {
          ...event,
          startTime: newStartTime.toDate(),
          endTime: newEndTime.toDate()
        };
      }
      return event;
    });

    setEvents([...updatedEvents, newBreak]);
  };

  const removeBreak = (breakEvent: CalendarEvent) => {
    // Sort events to ensure we process them in chronological order
    const sortedEvents = [...events].sort(
      (a, b) => dayjs(a.startTime).valueOf() - dayjs(b.startTime).valueOf()
    );

    const breakDuration = dayjs(breakEvent.endTime).diff(dayjs(breakEvent.startTime), 'minute');
    let timeShift = breakDuration;

    const updatedEvents = sortedEvents
      .filter(event => event.id !== breakEvent.id)
      .map(event => {
        if (
          event.column === breakEvent.column &&
          dayjs(event.startTime).isAfter(dayjs(breakEvent.startTime))
        ) {
          const newStartTime = dayjs(event.startTime).subtract(timeShift, 'minutes');
          let newEndTime = dayjs(event.endTime).subtract(timeShift, 'minutes');

          // If this is a break, ensure its end time is divisible by 5
          if (event.type === 'break') {
            const endMinutes = newEndTime.minute();
            const extraMins = endMinutes % 5 === 0 ? 0 : 5 - (endMinutes % 5);
            if (extraMins > 0) {
              newEndTime = newEndTime.add(extraMins, 'minutes');
              // Update timeShift for subsequent events
              timeShift -= extraMins;
            }
          }

          return {
            ...event,
            startTime: newStartTime.toDate(),
            endTime: newEndTime.toDate()
          };
        }
        return event;
      });

    setEvents(updatedEvents);
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
    <Paper ref={containerRef} sx={{ height: '600px', overflowY: 'auto' }}>
      <Stack direction="row" sx={{ position: 'relative' }}>
        {/* Time axis */}
        <Stack width={60} flexShrink={0} sx={{ borderRight: '1px solid rgba(0,0,0,0.12)' }}>
          <Box height={40} sx={{ borderTop: '1px solid rgba(0,0,0,0.12)' }} /> {/* Header space */}
          <Box>
            {generateTimeSlots(timeRange.start, timeRange.end).map((time, index) => (
              <Box
                key={index}
                height={TIME_SLOT_HEIGHT}
                display="flex"
                alignItems="center"
                sx={{
                  borderTop:
                    index % (15 / MINUTES_PER_SLOT) === 0 ? '1px solid rgba(0,0,0,0.12)' : 'none',
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
        </Stack>

        {/* Content wrapper with shared background grid */}
        <Box
          sx={{
            display: 'flex',
            flex: 1,
            backgroundImage: `
            linear-gradient(rgba(0,0,0,0.12) 1px, transparent 1px),
            linear-gradient(rgba(0,0,0,0.06) 1px, transparent 1px)
          `,
            backgroundSize: `
            100% ${TIME_SLOT_HEIGHT * (60 / MINUTES_PER_SLOT)}px,
            100% ${TIME_SLOT_HEIGHT * (15 / MINUTES_PER_SLOT)}px
          `,
            backgroundPosition: '0 40px'
          }}
        >
          {/* Judging Column */}
          <Stack width={COLUMN_WIDTH} sx={{ borderRight: '1px solid rgba(0,0,0,0.12)' }}>
            <Box
              sx={{
                height: 40,
                position: 'sticky',
                top: 0,
                bgcolor: '#F0F0F0',
                zIndex: 5,
                borderTop: '1px solid rgba(0,0,0,0.12)',
                borderBottom: '1px solid rgba(0,0,0,0.12)'
              }}
            >
              <Typography variant="h6">שיפוט</Typography>
            </Box>
            <Box>
              <Box sx={{ position: 'relative', minHeight: '100%' }}>
                {columnEvents.judging.map(event => (
                  <EventBlock
                    key={event.id}
                    event={event}
                    startTime={timeRange.start}
                    onBreakResize={handleBreakResize}
                    onRemoveBreak={removeBreak}
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
          </Stack>

          {/* Field Column */}
          <Stack width={COLUMN_WIDTH}>
            <Box
              sx={{
                height: 40,
                position: 'sticky',
                top: 0,
                bgcolor: '#F0F0F0',
                zIndex: 5,
                borderTop: '1px solid rgba(0,0,0,0.12)',
                borderBottom: '1px solid rgba(0,0,0,0.12)'
              }}
            >
              <Typography variant="h6">זירה</Typography>
            </Box>
            <Box>
              <Box sx={{ position: 'relative', minHeight: '100%' }}>
                {columnEvents.field.map(event => (
                  <EventBlock
                    key={event.id}
                    event={event}
                    startTime={timeRange.start}
                    onBreakResize={handleBreakResize}
                    onRemoveBreak={removeBreak}
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
        </Box>
      </Stack>
    </Paper>
  );
};

export default Calendar;
