'use client';

import dayjs from 'dayjs';
import Link from 'next/link';
import { Box, ListItem, ListItemButton, Stack, Typography } from '@mui/material';
import { CalendarToday } from '@mui/icons-material';
import { EventSummary } from '@lems/types/api/admin';
interface EventListItemProps {
  event: EventSummary;
}

export default function EventListItem({ event }: EventListItemProps) {
  return (
    <ListItem sx={{ px: 0 }}>
      <Link href={`/events/${event.slug}/edit`} style={{ textDecoration: 'none', width: '100%' }}>
        <ListItemButton
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
              <CalendarToday
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
      </Link>
    </ListItem>
  );
}
