'use client';

import dayjs, { Dayjs } from 'dayjs';
import { Box, Typography, Stack } from '@mui/material';
import { useEvent } from '../../../components/event-context';
import {
  TIME_SLOT_HEIGHT,
  TIME_AXIS_WIDTH,
  INTERVAL_MINUTES,
  HEADER_HEIGHT
} from './calendar-types';

function generateTimeSlots(startTime: Dayjs, endTime: Dayjs): Dayjs[] {
  const slots: Dayjs[] = [];
  let current = startTime.clone();

  while (current.isBefore(endTime) || current.isSame(endTime)) {
    slots.push(current.clone());
    current = current.add(INTERVAL_MINUTES, 'minute');
  }

  return slots;
}

interface CalendarGridProps {
  children?: React.ReactNode;
}

export const CalendarGrid: React.FC<CalendarGridProps> = ({ children }) => {
  const event = useEvent();

  const timeRange = { start: dayjs(event.startDate).hour(6), end: dayjs(event.endDate).hour(20) };

  const slots = generateTimeSlots(timeRange.start, timeRange.end);

  return (
    <Stack direction="row" sx={{ position: 'relative' }}>
      {/* Time axis */}
      <Stack
        width={TIME_AXIS_WIDTH}
        flexShrink={0}
        sx={{ borderRight: '1px solid', borderColor: 'divider' }}
      >
        <Box height={HEADER_HEIGHT} />
        <Box>
          {slots.map((time, index) => (
            <Box
              key={index}
              height={TIME_SLOT_HEIGHT * INTERVAL_MINUTES}
              display="flex"
              px={1}
              pt={0.5}
              sx={{
                borderTop: index % (60 / INTERVAL_MINUTES) === 0 ? '1px solid' : 'none',
                borderColor: 'divider',
                backgroundColor: 'grey.50'
              }}
            >
              {index % (60 / INTERVAL_MINUTES) === 0 && (
                <Typography variant="caption" color="text.secondary">
                  {time.format('HH:mm')}
                </Typography>
              )}
            </Box>
          ))}
        </Box>
      </Stack>

      {/* Content area */}
      <Box
        sx={{
          display: 'flex',
          flex: 1,
          backgroundImage: `
              linear-gradient(rgba(0,0,0,0.12) 1px, transparent 1px),
              linear-gradient(rgba(0,0,0,0.06) 1px, transparent 1px)
            `,
          backgroundSize: `
              100% ${TIME_SLOT_HEIGHT * 3 * INTERVAL_MINUTES}px,
              100% ${TIME_SLOT_HEIGHT * INTERVAL_MINUTES}px
            `,
          backgroundPosition: `0 ${HEADER_HEIGHT}px`
        }}
      >
        {children}
      </Box>
    </Stack>
  );
};
