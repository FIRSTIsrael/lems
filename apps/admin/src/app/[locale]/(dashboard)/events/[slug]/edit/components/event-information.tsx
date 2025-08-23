'use client';

import dayjs from 'dayjs';
import { useTranslations } from 'next-intl';
import useSWR from 'swr';
import { Typography, Paper, Box, Stack } from '@mui/material';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import { Division, AdminDivisionsResponseSchema } from '@lems/types/api/admin';
import { useEvent } from '../../layout';
import { apiFetch } from '../../../../../../../lib/fetch';
import { DivisionColorEditor } from './division-color-editor';

export const EventInformation = () => {
  const event = useEvent();
  const t = useTranslations('pages.events.edit');

  const { data: divisions = [], mutate } = useSWR<Division[]>(
    `/admin/events/${event.id}/divisions`,
    async (url: string) => {
      const result = await apiFetch(url, undefined, AdminDivisionsResponseSchema);
      if (result.ok) {
        return result.data;
      }
      throw new Error('Failed to fetch divisions');
    }
  );

  const singleDivision = divisions.length === 1 ? divisions[0] : null;

  const handleChangeColor = async () => {
    await mutate();
  };

  return (
    <Paper variant="outlined" sx={{ p: 3, mb: 3, backgroundColor: 'grey.50' }}>
      <Stack direction="row" spacing={4} alignItems="center">
        {singleDivision && (
          <DivisionColorEditor division={singleDivision} onChange={handleChangeColor} />
        )}

        <Box display="flex" alignItems="center" gap={1}>
          <CalendarTodayIcon color="primary" />
          <Stack>
            <Typography variant="body2" color="text.secondary">
              {t('date')}
            </Typography>
            <Typography variant="body1" fontWeight={500}>
              {dayjs(event.startDate).format('MMM D, YYYY')}
            </Typography>
          </Stack>
        </Box>

        <Box display="flex" alignItems="center" gap={1}>
          <LocationOnIcon color="primary" />
          <Stack>
            <Typography variant="body2" color="text.secondary">
              {t('location')}
            </Typography>
            <Typography variant="body1" fontWeight={500}>
              {event.location || 'Not specified'}
            </Typography>
          </Stack>
        </Box>
      </Stack>
    </Paper>
  );
};
