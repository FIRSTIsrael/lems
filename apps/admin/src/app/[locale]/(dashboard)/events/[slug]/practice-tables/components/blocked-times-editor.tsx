'use client';

import { Box, Typography, Paper, TextField, IconButton, Button, Stack, Grid } from '@mui/material';
import { Add as AddIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { useTranslations } from 'next-intl';

interface BlockedTimeSlot {
  start: string;
  end: string;
  reason?: string;
}

interface BlockedTimesEditorProps {
  blockedSlots: BlockedTimeSlot[];
  onChange: (slots: BlockedTimeSlot[]) => void;
}

export function BlockedTimesEditor({ blockedSlots, onChange }: BlockedTimesEditorProps) {
  const t = useTranslations('pages.events.practice-tables');

  const addBlockedSlot = () => {
    onChange([...blockedSlots, { start: '12:00', end: '13:00', reason: '' }]);
  };

  const removeBlockedSlot = (index: number) => {
    onChange(blockedSlots.filter((_, i) => i !== index));
  };

  const updateBlockedSlot = (index: number, field: keyof BlockedTimeSlot, value: string) => {
    const updated = [...blockedSlots];
    updated[index] = { ...updated[index], [field]: value };
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
          <Paper key={index} variant="outlined" sx={{ p: 3 }}>
            <Grid container spacing={2} sx={{ alignItems: 'center' }}>
              <Grid size={{ xs: 12, sm: 3 }}>
                <TextField
                  label={t('blocked-times.start')}
                  type="time"
                  value={slot.start}
                  onChange={e => updateBlockedSlot(index, 'start', e.target.value)}
                  fullWidth
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 3 }}>
                <TextField
                  label={t('blocked-times.end')}
                  type="time"
                  value={slot.end}
                  onChange={e => updateBlockedSlot(index, 'end', e.target.value)}
                  fullWidth
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 5 }}>
                <TextField
                  label={t('blocked-times.reason')}
                  value={slot.reason || ''}
                  onChange={e => updateBlockedSlot(index, 'reason', e.target.value)}
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
          </Paper>
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
