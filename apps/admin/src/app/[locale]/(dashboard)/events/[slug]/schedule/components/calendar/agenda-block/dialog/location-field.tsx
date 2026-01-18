'use client';

import React from 'react';
import { TextField } from '@mui/material';
import { useTranslations } from 'next-intl';

interface LocationFieldProps {
  value: string | null;
  onChange: (value: string | null) => void;
  onKeyDown: (e: React.KeyboardEvent) => void;
}

export const LocationField: React.FC<LocationFieldProps> = ({ value, onChange, onKeyDown }) => {
  const t = useTranslations(`pages.events.schedule.calendar.agenda`);

  return (
    <TextField
      fullWidth
      label={t('event-location')}
      value={value || ''}
      onChange={e => onChange(e.target.value || null)}
      onKeyDown={onKeyDown}
      variant="outlined"
      size="small"
      placeholder={t('default-event-location')}
      slotProps={{ htmlInput: { maxLength: 100 } }}
      sx={{ mt: 1 }}
    />
  );
};
