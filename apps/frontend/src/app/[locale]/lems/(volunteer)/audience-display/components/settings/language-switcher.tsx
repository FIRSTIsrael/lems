'use client';

import { useCallback } from 'react';
import { useLocale } from 'next-intl';
import { FormControl, InputLabel, Select, MenuItem, InputAdornment, useTheme } from '@mui/material';
import { Language } from '@mui/icons-material';
import { Locale, Locales } from '@lems/localization';

interface SettingsLanguageSwitcherProps {
  onLanguageChange?: () => void;
}

export const SettingsLanguageSwitcher: React.FC<SettingsLanguageSwitcherProps> = ({
  onLanguageChange
}) => {
  const theme = useTheme();
  const currentLocale = useLocale() as Locale;

  const handleLanguageChange = useCallback(
    (locale: string) => {
      document.cookie = `LEMS_LOCALE=${locale}; path=/; max-age=${60 * 60 * 24 * 365}`;
      window.location.reload();
      onLanguageChange?.();
    },
    [onLanguageChange]
  );

  return (
    <FormControl fullWidth size="small" variant="outlined">
      <InputLabel id="language-select-label">Language</InputLabel>
      <Select
        labelId="language-select-label"
        id="language-select"
        value={currentLocale}
        onChange={e => handleLanguageChange(e.target.value)}
        label="Language"
        startAdornment={
          <InputAdornment position="start">
            <Language />
          </InputAdornment>
        }
        sx={{
          '& .MuiOutlinedInput-notchedOutline': {
            borderColor: theme.palette.divider
          },
          '&:hover .MuiOutlinedInput-notchedOutline': {
            borderColor: theme.palette.primary.main
          },
          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
            borderColor: theme.palette.primary.main
          }
        }}
      >
        {Object.entries(Locales).map(([localeKey, localeData]) => (
          <MenuItem key={localeKey} value={localeKey}>
            {localeData.displayName}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
};
