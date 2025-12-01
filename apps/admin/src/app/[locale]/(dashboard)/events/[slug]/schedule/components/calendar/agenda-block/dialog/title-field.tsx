'use client';

import React from 'react';
import { TextField } from '@mui/material';
import { useTranslations } from 'next-intl';

interface TitleFieldProps {
  value: string;
  onChange: (value: string) => void;
  onKeyDown: (e: React.KeyboardEvent) => void;
}

export const TitleField: React.FC<TitleFieldProps> = ({ value, onChange, onKeyDown }) => {
  const t = useTranslations(`pages.events.schedule.calendar.agenda`);

  return (
    <TextField
      fullWidth
      label={t('event-title')}
      value={value}
      onChange={e => onChange(e.target.value)}
      onKeyDown={onKeyDown}
      variant="outlined"
      size="small"
      placeholder={t('default-event-title')}
      inputProps={{ maxLength: 100 }}
      sx={{ mt: 1 }}
    />
  );
};
