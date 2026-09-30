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
import { Dayjs } from 'dayjs';
import { useTranslations } from 'next-intl';
import { LocalizationProvider, TimePicker } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { BlockedTimesEditor, BlockedTimeSlot } from './blocked-times-editor';

export interface PracticeTablesConfig {
  tableCount: number;
  slotDuration: number;
  startTime: Dayjs;
  endTime: Dayjs;
  blockedSlots: BlockedTimeSlot[];
}

interface ConfigurationFormProps {
  config: PracticeTablesConfig;
  onChange: (config: PracticeTablesConfig) => void;
  onSave: () => void;
  saving?: boolean;
  loading?: boolean;
}

export function ConfigurationForm({
  config,
  onChange,
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

  const updateConfig = (updates: Partial<PracticeTablesConfig>) => {
    onChange({ ...config, ...updates });
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Stack spacing={3}>
        <Grid container spacing={2}>
          <Grid size={{ xs: 6, sm: 3 }}>
            <TextField
              label={t('fields.table-count')}
              type="number"
              value={config.tableCount}
              onChange={e => updateConfig({ tableCount: parseInt(e.target.value) || 0 })}
              fullWidth
              size="small"
            />
          </Grid>
          <Grid size={{ xs: 6, sm: 3 }}>
            <TextField
              label={t('fields.slot-duration')}
              type="number"
              value={config.slotDuration}
              onChange={e => updateConfig({ slotDuration: parseInt(e.target.value) || 0 })}
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
            <TimePicker
              label={t('fields.start-time')}
              value={config.startTime}
              onChange={(value: Dayjs | null) => {
                if (!value) return;
                updateConfig({ startTime: value });
              }}
              ampm={false}
              format="HH:mm"
              slotProps={{ textField: { size: 'small', fullWidth: true } }}
            />
          </Grid>
          <Grid size={{ xs: 6, sm: 3 }}>
            <TimePicker
              label={t('fields.end-time')}
              value={config.endTime}
              onChange={(value: Dayjs | null) => {
                if (!value) return;
                updateConfig({ endTime: value });
              }}
              ampm={false}
              format="HH:mm"
              minTime={config.startTime}
              slotProps={{ textField: { size: 'small', fullWidth: true } }}
            />
          </Grid>
        </Grid>

        <BlockedTimesEditor
          blockedSlots={config.blockedSlots}
          defaultDate={config.startTime}
          onChange={blockedSlots => updateConfig({ blockedSlots })}
        />

        <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
          <Button variant="contained" onClick={onSave} disabled={saving}>
            {saving ? t('actions.saving') : t('actions.save')}
          </Button>
        </Box>
      </Stack>
    </LocalizationProvider>
  );
}
