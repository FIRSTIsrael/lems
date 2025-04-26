import { WithId } from 'mongodb';
import dayjs from 'dayjs';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Stack, Box, Typography, Paper } from '@mui/material';
import { Team, JudgingRoom, RobotGameTable, ScheduleGenerationSettings } from '@lems/types';
import {
  CalendarEvent,
  COLUMN_WIDTH,
  MINUTES_PER_SLOT,
  TIME_SLOT_HEIGHT,
  generateEvents,
  generateTimeSlots
} from './common';
import { BreakIndicator } from './break-indicator';
import { EventBlock } from './event-block';
import { useBreaks } from './use-breaks';

export interface CalendarProps {
  date: Date;
  settings: ScheduleGenerationSettings;
  updateSettings: (settings: ScheduleGenerationSettings) => void;
  teams: WithId<Team>[];
  rooms: WithId<JudgingRoom>[];
  tables: WithId<RobotGameTable>[];
}

const Calendar: React.FC<CalendarProps> = ({
  date,
  settings,
  updateSettings,
  teams,
  rooms,
  tables
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [events, setEvents] = useState<CalendarEvent[]>([]);

  const matchesPerRound = useMemo(() => {
    return Math.ceil(teams.length / tables.length) * (settings.isStaggered ? 2 : 1);
  }, [teams.length, tables.length, settings.isStaggered]);

  const { calculateBreakPositions, addBreak, removeBreak, handleBreakResize } = useBreaks({
    events,
    settings,
    matchesPerRound,
    updateSettings,
    setEvents
  });

  useEffect(() => {
    setEvents(generateEvents({ date, settings, teams, rooms, tables }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [settings.judgingStart, settings.matchesStart]);

  const columnEvents = useMemo(() => {
    return {
      judging: events.filter(e => e.column === 'judging'),
      field: events.filter(e => e.column === 'field')
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(events)]);

  // Set to 6:00-20:00 for the event day
  const timeRange = {
    start: dayjs(date).set('hour', 6).set('minute', 0),
    end: dayjs(date).set('hour', 20).set('minute', 0)
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
