import { useState, useRef, useCallback, useEffect } from 'react';
import { Paper, Stack, Typography, IconButton } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import dayjs from 'dayjs';
import { CalendarEvent, MINUTES_PER_SLOT, TIME_SLOT_HEIGHT } from './common';

export const EventBlock: React.FC<{
  event: CalendarEvent;
  startTime: dayjs.Dayjs;
  onBreakResize?: (event: CalendarEvent, newDuration: number) => void;
  onRemoveBreak?: (event: CalendarEvent) => void;
}> = ({ event, startTime, onBreakResize, onRemoveBreak }) => {
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
        return '#fcbd8b';
      case 'practice':
        return '#e8789a';
      case 'ranking':
        return '#a8779a';
      case 'break':
        return '#eddab9';
      default:
        return '#eddab9';
    }
  }, [event.type]);

  return (
    <Paper
      elevation={2}
      sx={{
        top,
        height,
        backgroundColor: getEventColor(),
        padding: height >= 40 ? 1 : 0,
        ...breakIndicatorStyle(event.type, isResizeHover)
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
      <Stack
        direction={height >= 60 ? 'column' : 'row'}
        px={1}
        py={0.5}
        spacing={1}
        alignItems={height >= 60 ? 'flex-start' : 'center'}
        position="relative"
      >
        <Typography variant="body2">{getEventTitle()}</Typography>
        <Typography variant="body2" color="text.secondary">
          {dayjs(event.startTime).format('HH:mm')} - {dayjs(event.endTime).format('HH:mm')}
        </Typography>
        {event.type === 'break' && onRemoveBreak && (
          <IconButton
            size="small"
            onClick={e => {
              e.stopPropagation();
              onRemoveBreak(event);
            }}
            sx={{
              position: 'absolute',
              right: 4,
              top: 4,
              opacity: 0.7,
              padding: height < 30 ? '2px' : '4px',
              '&:hover': { opacity: 1 }
            }}
          >
            <DeleteIcon sx={{ fontSize: height < 30 ? 14 : 20 }} />
          </IconButton>
        )}
      </Stack>
    </Paper>
  );
};

const breakIndicatorStyle = (eventType: CalendarEvent['type'], isResizeHover: boolean) => ({
  cursor: eventType === 'break' && isResizeHover ? 'ns-resize' : 'default',
  position: 'absolute',
  width: '95%',
  borderRadius: 1,
  zIndex: 2,
  '&::after':
    eventType === 'break'
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
});
