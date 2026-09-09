'use client';

import { Box, Paper, Typography, Stack, Divider, Button, Grid } from '@mui/material';
import { useTranslations } from 'next-intl';

interface BlockedTimeSlot {
  start: string;
  end: string;
  reason?: string;
}

interface ConfigurationSummaryProps {
  tableCount: number;
  slotDuration: number;
  startTime: string;
  endTime: string;
  blockedSlots: BlockedTimeSlot[];
  onEdit: () => void;
  onDelete: () => void;
  deleting?: boolean;
}

export function ConfigurationSummary({
  tableCount,
  slotDuration,
  blockedSlots,
  onEdit,
  onDelete,
  deleting = false
}: ConfigurationSummaryProps) {
  const t = useTranslations('pages.events.practice-tables');

  return (
    <Paper sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Stack spacing={3}>
        <Typography variant="h6">{t('title')}</Typography>

        <Grid container spacing={3}>
          <Grid size={{ xs: 12, sm: 4 }}>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              {t('fields.table-count')}
            </Typography>
            <Typography variant="h5">{tableCount}</Typography>
          </Grid>

          <Grid size={{ xs: 12, sm: 4 }}>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              {t('fields.slot-duration')}
            </Typography>
            <Typography variant="h5">
              {slotDuration} {t('fields.minutes')}
            </Typography>
          </Grid>

          <Grid size={{ xs: 12, sm: 4 }}>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              {t('blocked-times.title')}
            </Typography>
            <Typography variant="h5">{blockedSlots.length}</Typography>
          </Grid>
        </Grid>

        {blockedSlots.length > 0 && (
          <Box>
            <Typography variant="subtitle2" gutterBottom>
              {t('blocked-times.details')}
            </Typography>
            <Stack spacing={1}>
              {blockedSlots.map((slot, index) => (
                <Paper key={index} variant="outlined" sx={{ p: 2 }}>
                  <Typography variant="body2">
                    <strong>
                      {slot.start} - {slot.end}
                    </strong>
                    {slot.reason && (
                      <>
                        <br />
                        {slot.reason}
                      </>
                    )}
                  </Typography>
                </Paper>
              ))}
            </Stack>
          </Box>
        )}

        <Divider />

        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button variant="outlined" onClick={onEdit}>
            {t('actions.edit-config')}
          </Button>
          <Button variant="outlined" color="error" onClick={onDelete} disabled={deleting}>
            {t('actions.delete-config')}
          </Button>
        </Box>
      </Stack>
    </Paper>
  );
}
