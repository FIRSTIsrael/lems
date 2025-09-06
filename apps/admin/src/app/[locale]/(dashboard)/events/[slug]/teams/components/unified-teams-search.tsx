'use client';

import { TextField, InputAdornment } from '@mui/material';
import { Search } from '@mui/icons-material';
import { useTranslations } from 'next-intl';

interface UnifiedTeamsSearchProps {
  value: string;
  onChange: (value: string) => void;
}

export const UnifiedTeamsSearch: React.FC<UnifiedTeamsSearchProps> = ({ value, onChange }) => {
  const t = useTranslations('pages.events.teams.unified.search');

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
