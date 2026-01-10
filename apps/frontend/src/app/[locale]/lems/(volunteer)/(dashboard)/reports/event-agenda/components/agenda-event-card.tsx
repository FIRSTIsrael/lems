'use client';

import { useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { Box, Typography, Chip, Stack } from '@mui/material';
import { Schedule } from '@mui/icons-material';
import dayjs from 'dayjs';
import { AgendaEvent } from '../graphql';

interface AgendaEventCardProps {
  event: AgendaEvent;
}

const VISIBILITY_COLORS: Record<string, string> = {
  public: '#4CAF50',
  judging: '#FF9800',
  field: '#2196F3'
};

export function AgendaEventCard({ event }: AgendaEventCardProps) {
  const t = useTranslations('pages.reports.event-agenda');

  const formattedTime = useMemo(() => {
    const start = dayjs(event.startTime);
    const end = start.add(event.duration, 'second');
    return `${start.format('HH:mm')} - ${end.format('HH:mm')}`;
  }, [event.startTime, event.duration]);

  const durationMinutes = Math.round(event.duration / 60);
  const visibilityColor = VISIBILITY_COLORS[event.visibility] || '#9E9E9E';

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 2,
        py: 2,
        px: 3,
        borderRadius: 2,
        backgroundColor: 'background.paper',
        borderLeft: '4px solid transparent',
        boxShadow: 1,
        transition: 'all 0.2s ease-in-out',
        '&:hover': {
          boxShadow: 3,
          borderLeftColor: visibilityColor
        }
      }}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: 48,
          height: 48,
          borderRadius: '50%',
          backgroundColor: `${visibilityColor}20`
        }}
      >
        <Schedule sx={{ color: visibilityColor, fontSize: 24 }} />
      </Box>

      <Stack spacing={0.5} sx={{ flexGrow: 1, minWidth: 0 }}>
        <Typography variant="subtitle1" fontWeight={600} noWrap>
          {event.title}
        </Typography>
        <Stack direction="row" spacing={1} alignItems="center" sx={{ flexWrap: 'wrap', gap: 0.5 }}>
          <Typography variant="body2" color="text.secondary">
            {formattedTime}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            •
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {t('duration-minutes', { count: durationMinutes })}
          </Typography>
          {event.location && (
            <>
              <Typography variant="body2" color="text.secondary">
                •
              </Typography>
              <Typography variant="body2" color="text.secondary" fontWeight={500}>
                {event.location}
              </Typography>
            </>
          )}
        </Stack>
      </Stack>

      <Chip
        size="small"
        label={t(`visibility.${event.visibility}`)}
        sx={{
          backgroundColor: `${visibilityColor}20`,
          color: visibilityColor,
          fontWeight: 500,
          '& .MuiChip-icon': {
            color: visibilityColor
          }
        }}
      />
    </Box>
  );
}
