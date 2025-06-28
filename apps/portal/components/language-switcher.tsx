import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { Button, Menu, MenuItem, ListItemText, Typography, Box } from '@mui/material';
import { ExpandMore as ExpandMoreIcon } from '@mui/icons-material';
import PortalLocales, { Locales } from '../locale/locales';

const LanguageSwitcher: React.FC = () => {
  const router = useRouter();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = !!anchorEl;

  const currentLocale = (router.locale ?? 'he') as Locales;
  const currentLocaleData = PortalLocales[currentLocale];

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLanguageChange = (locale: Locales) => {
    router.push(router.asPath, router.asPath, { locale });
    handleClose();
  };

  // Get available locales excluding current one
  const availableLocales = Object.entries(PortalLocales).filter(
    ([key]) => key !== currentLocale
  ) as [Locales, (typeof PortalLocales)[Locales]][];

  return (
    <Box>
      <Button
        id="language-switcher-button"
        aria-controls={open ? 'language-switcher-menu' : undefined}
        aria-haspopup="true"
        aria-expanded={open ? 'true' : undefined}
        onClick={handleClick}
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

export default LanguageSwitcher;
