'use client';

import React from 'react';
import { TextField, InputAdornment } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
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
      variant="outlined"
      placeholder={t('placeholder')}
      value={value}
      onChange={e => onChange(e.target.value)}
      slotProps={{
        input: {
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon />
            </InputAdornment>
          )
        }
      }}
      sx={{ mb: 2 }}
    />
  );
};
