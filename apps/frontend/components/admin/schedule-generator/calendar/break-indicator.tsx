import dayjs, { Dayjs } from 'dayjs';
import { useState } from 'react';
import { Box } from '@mui/material';
import { CalendarEvent, MINUTES_PER_SLOT, HOVER_AREA_HEIGHT, TIME_SLOT_HEIGHT } from './common';

export const BreakIndicator: React.FC<{
  topEvent: CalendarEvent;
  bottomEvent: CalendarEvent;
  startTime: Dayjs;
  onClick: () => void;
}> = ({ topEvent, bottomEvent, startTime, onClick }) => {
  const [isHovered, setIsHovered] = useState(false);

  const topEventEnd = dayjs(topEvent.endTime);
  const bottomEventStart = dayjs(bottomEvent.startTime);
  const gap = bottomEventStart.diff(topEventEnd, 'minute');

  const topOffset =
    (dayjs(topEvent.endTime).diff(startTime, 'minute') / MINUTES_PER_SLOT) * TIME_SLOT_HEIGHT;

  return (
    <Box
      sx={breakIndicatorStyle(topOffset, isHovered)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onClick}
      data-gap={`${gap}min`}
    />
  );
};

const breakIndicatorStyle = (topOffset: number, isHovered: boolean) => ({
  position: 'absolute',
  width: '95%',
  height: `${HOVER_AREA_HEIGHT}px`,
  top: topOffset - HOVER_AREA_HEIGHT / 2,
  backgroundColor: isHovered ? 'rgba(25, 118, 210, 0.2)' : 'transparent',
  cursor: 'pointer',
  transition:
    'background-color 0.2s ease-in-out, transform 0.2s ease-in-out, opacity 0.2s ease-in-out',
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
});
