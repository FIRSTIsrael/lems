'use client';

import dayjs from 'dayjs';
import { Box, ListItem, ListItemButton, Stack, Typography } from '@mui/material';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';

interface Event {
  id: string;
  name: string;
  location: string;
  startDate: string;
}

interface EventListItemProps {
  event: Event;
}

export default function EventListItem({ event }: EventListItemProps) {
  const handleEventClick = (eventId: string) => {
    // TODO: Redirect to events page
    console.log('Navigate to event:', eventId);
  };

  return (
    <ListItem sx={{ px: 0 }}>
      <ListItemButton
        disabled // TODO: Remove when navigation is implemented
        onClick={() => handleEventClick(event.id)}
        sx={{
          borderRadius: 1,
          '&:hover': {
            bgcolor: 'action.hover'
          }
        }}
      >
        <Box display="flex" alignItems="center" width="100%" gap={2}>
          <Stack spacing={0.25} sx={{ flex: 1, minWidth: 0 }}>
            <Typography
              variant="body2"
              sx={{
                fontWeight: 500,
                lineHeight: 1.2,
                wordBreak: 'break-word'
              }}
            >
              {event.name}
            </Typography>
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{
                lineHeight: 1,
                wordBreak: 'break-word'
              }}
            >
              {event.location}
            </Typography>
          </Stack>

          <Box display="flex" alignItems="center" gap={1}>
            <CalendarTodayIcon
              sx={{
                fontSize: 16,
                color: 'text.secondary'
              }}
            />
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{
                fontWeight: 500,
                whiteSpace: 'nowrap'
              }}
            >
              {dayjs(event.startDate).format('MMM D')}
            </Typography>
          </Box>
        </Box>
      </ListItemButton>
    </ListItem>
  );
}
