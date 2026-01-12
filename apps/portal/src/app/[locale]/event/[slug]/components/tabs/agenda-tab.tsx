'use client';

import { useTranslations } from 'next-intl';
import dayjs from 'dayjs';
import {
  Paper,
  Box,
  Stack,
  Typography,
  Card,
  CardContent,
  Chip
} from '@mui/material';
import { AgendaEvent } from '@lems/types/api/portal';
import { useRealtimeData } from '../../../../hooks/use-realtime-data';
import { useDivision } from '../division-data-context';

export const AgendaTab: React.FC = () => {
  const t = useTranslations('pages.event');
  const division = useDivision();

  const { data: agendaEvents } = useRealtimeData<AgendaEvent[]>(
    `/portal/divisions/${division.id}/agenda`,
    { suspense: true }
  );

  if (!agendaEvents || agendaEvents.length === 0) {
    return (
      <Paper sx={{ p: 3 }}>
        <Typography variant="h2" gutterBottom>
          {t('quick-links.agenda')}
        </Typography>
        <Box display="flex" alignItems="center" justifyContent="center" py={4}>
          <Typography variant="body1" color="text.secondary">
            {t('agenda.no-data')}
          </Typography>
        </Box>
      </Paper>
    );
  }

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h2" gutterBottom>
        {t('quick-links.agenda')}
      </Typography>

      <Stack spacing={2} mt={2}>
        {agendaEvents.map((event) => {
          const startTime = dayjs(event.startTime);
          const endTime = startTime.add(event.duration, 'minute');

          return (
            <Card key={event.id} variant="outlined">
              <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                  <Box flex={1}>
                    <Typography variant="h6" gutterBottom>
                      {event.title}
                    </Typography>

                    <Typography
                      variant="body2"
                      color="text.secondary"
                      fontFamily="monospace"
                      fontWeight={500}
                      gutterBottom
                    >
                      {startTime.format('HH:mm')} - {endTime.format('HH:mm')}
                    </Typography>

                    {event.location && (
                      <Typography variant="body2" color="text.secondary">
                        {event.location}
                      </Typography>
                    )}
                  </Box>

                  <Chip
                    label={t(`agenda.visibility.${event.visibility}`)}
                    size="small"
                    color={event.visibility === 'public' ? 'primary' : 'secondary'}
                  />
                </Box>
              </CardContent>
            </Card>
          );
        })}
      </Stack>
    </Paper>
  );
};
