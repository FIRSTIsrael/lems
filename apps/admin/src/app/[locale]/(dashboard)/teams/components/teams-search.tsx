'use client';

import React from 'react';
import { TextField, InputAdornment } from '@mui/material';
import { Search } from '@mui/icons-material';
import { useTranslations } from 'next-intl';

interface TeamsSearchProps {
  value: string;
  onChange: (value: string) => void;
}

export const TeamsSearch: React.FC<TeamsSearchProps> = ({ value, onChange }) => {
  const t = useTranslations('pages.teams.search');

  return (
    <TextField
      fullWidth
      size="small"
      placeholder={t('placeholder')}
      value={value}
      onChange={e => onChange(e.target.value)}
      sx={{ mb: 2 }}
      slotProps={{
        input: {
          startAdornment: (
            <InputAdornment position="start">
              <Search />
            </InputAdornment>
          )
        }
      }}
    />
  );
};
