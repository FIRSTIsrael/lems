'use client';

import { Box, Paper, Typography, Stack, Divider, Button, Grid } from '@mui/material';
import { useTranslations } from 'next-intl';
import { PracticeTablesConfig } from './configuration-form';

interface ConfigurationSummaryProps {
  config: PracticeTablesConfig;
  onEdit: () => void;
  onDelete: () => void;
  deleting?: boolean;
}

export function ConfigurationSummary({
  config,
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
            <Typography variant="h5">{config.tableCount}</Typography>
          </Grid>

          <Grid size={{ xs: 12, sm: 4 }}>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              {t('fields.slot-duration')}
            </Typography>
            <Typography variant="h5">
              {config.slotDuration} {t('fields.minutes')}
            </Typography>
          </Grid>

          <Grid size={{ xs: 12, sm: 4 }}>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              {t('blocked-times.title')}
            </Typography>
            <Typography variant="h5">{config.blockedSlots.length}</Typography>
          </Grid>
        </Grid>

        {config.blockedSlots.length > 0 && (
          <Box>
            <Typography variant="subtitle2" gutterBottom>
              {t('blocked-times.details')}
            </Typography>
            <Stack spacing={1}>
              {config.blockedSlots.map((slot, index) => (
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
