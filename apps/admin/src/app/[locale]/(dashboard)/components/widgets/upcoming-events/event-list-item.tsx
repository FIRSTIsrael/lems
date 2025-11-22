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
            borderRadius: 2,
            py: 1.5,
            px: 2,
            transition: 'all 0.2s ease-in-out',
            '&:hover': {
              bgcolor: 'action.hover',
              transform: 'translateX(4px)',
              boxShadow: 1
            }
          }}
        >
          <Box display="flex" alignItems="center" width="100%" gap={2}>
            <Stack spacing={0.5} sx={{ flex: 1, minWidth: 0 }}>
              <Typography
                variant="body2"
                sx={{
                  fontWeight: 600,
                  lineHeight: 1.3,
                  wordBreak: 'break-word',
                  color: 'text.primary'
                }}
              >
                {event.name}
              </Typography>
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{
                  lineHeight: 1.2,
                  wordBreak: 'break-word',
                  fontSize: '0.8rem'
                }}
              >
                {event.location}
              </Typography>
            </Stack>

            <Box
              display="flex"
              alignItems="center"
              gap={1}
              sx={{
                bgcolor: 'action.hover',
                borderRadius: 1.5,
                px: 1.5,
                py: 0.75
              }}
            >
              <CalendarToday
                sx={{
                  fontSize: 16,
                  color: 'primary.main'
                }}
              />
              <Typography
                variant="caption"
                sx={{
                  fontWeight: 600,
                  whiteSpace: 'nowrap',
                  color: 'text.primary'
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
