'use client';

import React, { useState } from 'react';
import { useLocale } from 'next-intl';
import { Button, Menu, MenuItem, ListItemText, Typography, Box } from '@mui/material';
import { ExpandMore as ExpandMoreIcon, Language } from '@mui/icons-material';
import { Locale, Locales } from '@lems/localization';
import { useRouter, usePathname } from '../../../i18n/navigation';

export const LanguageSwitcher: React.FC = () => {
  const router = useRouter();
  const pathname = usePathname();
  const currentLocale = useLocale() as Locale;
  const currentLocaleData = Locales[currentLocale];

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = !!anchorEl;

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLanguageChange = (locale: Locale) => {
    // Set the locale cookie
    document.cookie = `LEMS_LOCALE=${locale}; path=/; max-age=${60 * 60 * 24 * 365}`;

    // Refresh the page to apply the new locale
    router.refresh();

    handleClose();
  };

  // Get available locales excluding current one
  const availableLocales = Object.entries(Locales).filter(([key]) => key !== currentLocale) as [
    Locale,
    (typeof Locales)[Locale]
  ][];

  return (
    <Box>
      <Button
        id="language-switcher-button"
        aria-controls={open ? 'language-switcher-menu' : undefined}
        aria-haspopup="true"
        aria-expanded={open ? 'true' : undefined}
        onClick={handleClick}
        startIcon={<Language />}
        endIcon={<ExpandMoreIcon />}
        color="inherit"
        sx={{
          minWidth: 'auto',
          textTransform: 'none',
          '& .MuiButton-endIcon': {
            marginLeft: 0.5,
            transition: 'transform 0.2s',
            transform: open ? 'rotate(180deg)' : 'rotate(0deg)'
          }
        }}
      >
        <Typography variant="body2" component="span" dir={currentLocaleData.direction}>
          {currentLocaleData.displayName}
        </Typography>
      </Button>
      <Menu
        id="language-switcher-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        slotProps={{
          list: {
            'aria-labelledby': 'language-switcher-button',
            sx: { maxHeight: 200, overflow: 'auto' } // Limit height for scrolling
          }
        }}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right'
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right'
        }}
      >
        {availableLocales.map(([localeKey, localeData]) => (
          <MenuItem
            key={localeKey}
            onClick={() => handleLanguageChange(localeKey)}
            sx={{ minWidth: 120, dir: localeData.direction }}
          >
            <ListItemText primary={localeData.displayName} />
          </MenuItem>
        ))}
      </Menu>
    </Box>
  );
};
