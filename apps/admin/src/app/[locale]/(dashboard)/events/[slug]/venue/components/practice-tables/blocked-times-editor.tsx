'use client';

import { Dayjs } from 'dayjs';
import { Box, Typography, TextField, IconButton, Button, Stack, Grid } from '@mui/material';
import { Add as AddIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { TimePicker } from '@mui/x-date-pickers';
import { useTranslations } from 'next-intl';

export interface BlockedTimeSlot {
  start: Dayjs;
  end: Dayjs;
  reason?: string;
}

interface BlockedTimesEditorProps {
  blockedSlots: BlockedTimeSlot[];
  defaultDate: Dayjs;
  onChange: (slots: BlockedTimeSlot[]) => void;
}

export function BlockedTimesEditor({
  blockedSlots,
  defaultDate,
  onChange
}: BlockedTimesEditorProps) {
  const t = useTranslations('pages.events.practice-tables');

  const addBlockedSlot = () => {
    const start = defaultDate.hour(12).minute(0).second(0);
    onChange([...blockedSlots, { start, end: start.hour(13), reason: '' }]);
  };

  const removeBlockedSlot = (index: number) => {
    onChange(blockedSlots.filter((_, i) => i !== index));
  };

  const updateBlockedSlot = (index: number, updates: Partial<BlockedTimeSlot>) => {
    const updated = [...blockedSlots];
    updated[index] = { ...updated[index], ...updates };
    onChange(updated);
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        {t('blocked-times.title')}
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        {t('blocked-times.description')}
      </Typography>

      <Stack spacing={3}>
        {blockedSlots.map((slot, index) => (
          <Grid key={index} container spacing={2} sx={{ alignItems: 'center' }}>
            <Grid size={{ xs: 12, sm: 3 }}>
              <TimePicker
                label={t('blocked-times.start')}
                value={slot.start}
                onChange={(value: Dayjs | null) => {
                  if (!value) return;
                  updateBlockedSlot(index, { start: value });
                }}
                ampm={false}
                format="HH:mm"
                slotProps={{ textField: { fullWidth: true } }}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 3 }}>
              <TimePicker
                label={t('blocked-times.end')}
                value={slot.end}
                onChange={(value: Dayjs | null) => {
                  if (!value) return;
                  updateBlockedSlot(index, { end: value });
                }}
                ampm={false}
                format="HH:mm"
                minTime={slot.start}
                slotProps={{ textField: { fullWidth: true } }}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 5 }}>
              <TextField
                label={t('blocked-times.reason')}
                value={slot.reason || ''}
                onChange={e => updateBlockedSlot(index, { reason: e.target.value })}
                placeholder={t('blocked-times.reason-placeholder')}
                fullWidth
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 1 }}>
              <IconButton onClick={() => removeBlockedSlot(index)} color="error" size="large">
                <DeleteIcon />
              </IconButton>
            </Grid>
          </Grid>
        ))}

        <Button
          variant="outlined"
          startIcon={<AddIcon />}
          onClick={addBlockedSlot}
          sx={{ alignSelf: 'flex-start' }}
        >
          {t('blocked-times.add')}
        </Button>
      </Stack>
    </Box>
  );
}
