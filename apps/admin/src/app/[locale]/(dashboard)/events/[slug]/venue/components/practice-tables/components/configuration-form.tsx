'use client';

import {
  Box,
  TextField,
  Button,
  Stack,
  CircularProgress,
  Grid,
  InputAdornment
} from '@mui/material';
import { useTranslations } from 'next-intl';
import { BlockedTimesEditor } from './blocked-times-editor';

interface BlockedTimeSlot {
  start: string;
  end: string;
  reason?: string;
}

interface ConfigurationFormProps {
  tableCount: number;
  slotDuration: number;
  startTime: string;
  endTime: string;
  blockedSlots: BlockedTimeSlot[];
  onTableCountChange: (value: number) => void;
  onSlotDurationChange: (value: number) => void;
  onStartTimeChange: (value: string) => void;
  onEndTimeChange: (value: string) => void;
  onBlockedSlotsChange: (slots: BlockedTimeSlot[]) => void;
  onSave: () => void;
  saving?: boolean;
  loading?: boolean;
}

export function ConfigurationForm({
  tableCount,
  slotDuration,
  startTime,
  endTime,
  blockedSlots,
  onTableCountChange,
  onSlotDurationChange,
  onStartTimeChange,
  onEndTimeChange,
  onBlockedSlotsChange,
  onSave,
  saving = false,
  loading = false
}: ConfigurationFormProps) {
  const t = useTranslations('pages.events.practice-tables');

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Stack spacing={3}>
        <Grid container spacing={2}>
          <Grid size={{ xs: 6, sm: 3 }}>
            <TextField
              label={t('fields.table-count')}
              type="number"
              value={tableCount}
              onChange={e => onTableCountChange(parseInt(e.target.value) || 0)}
              fullWidth
              size="small"
            />
          </Grid>
          <Grid size={{ xs: 6, sm: 3 }}>
            <TextField
              label={t('fields.slot-duration')}
              type="number"
              value={slotDuration}
              onChange={e => onSlotDurationChange(parseInt(e.target.value) || 0)}
              fullWidth
              size="small"
              slotProps={{
                input: {
                  endAdornment: (
                    <InputAdornment position="end">{t('fields.minutes')}</InputAdornment>
                  )
                }
              }}
            />
          </Grid>
          <Grid size={{ xs: 6, sm: 3 }}>
            <TextField
              label={t('fields.start-time')}
              type="time"
              value={startTime}
              onChange={e => onStartTimeChange(e.target.value)}
              fullWidth
              size="small"
            />
          </Grid>
          <Grid size={{ xs: 6, sm: 3 }}>
            <TextField
              label={t('fields.end-time')}
              type="time"
              value={endTime}
              onChange={e => onEndTimeChange(e.target.value)}
              fullWidth
              size="small"
            />
          </Grid>
        </Grid>

        <BlockedTimesEditor blockedSlots={blockedSlots} onChange={onBlockedSlotsChange} />

        <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
          <Button variant="contained" onClick={onSave} disabled={saving}>
            {saving ? t('actions.saving') : t('actions.save')}
          </Button>
        </Box>
      </Stack>
    </Box>
  );
}
