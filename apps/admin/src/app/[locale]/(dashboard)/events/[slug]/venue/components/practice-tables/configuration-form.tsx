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

export interface PracticeTablesConfig {
  tableCount: number;
  slotDuration: number;
  startTime: string;
  endTime: string;
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
    <Box>
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
            <TextField
              label={t('fields.start-time')}
              type="time"
              value={config.startTime}
              onChange={e => updateConfig({ startTime: e.target.value })}
              fullWidth
              size="small"
            />
          </Grid>
          <Grid size={{ xs: 6, sm: 3 }}>
            <TextField
              label={t('fields.end-time')}
              type="time"
              value={config.endTime}
              onChange={e => updateConfig({ endTime: e.target.value })}
              fullWidth
              size="small"
            />
          </Grid>
        </Grid>

        <BlockedTimesEditor
          blockedSlots={config.blockedSlots}
          onChange={blockedSlots => updateConfig({ blockedSlots })}
        />

        <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
          <Button variant="contained" onClick={onSave} disabled={saving}>
            {saving ? t('actions.saving') : t('actions.save')}
          </Button>
        </Box>
      </Stack>
    </Box>
  );
}
