'use client';

import * as React from 'react';
import { useLocale } from 'next-intl';
import { Typography, Menu, MenuItem, ListItemIcon, ListItemText } from '@mui/material';
import { alpha, lighten, useTheme } from '@mui/material/styles';
import { Language, ChevronLeft, ChevronRight } from '@mui/icons-material';
import { DirectionalIcon, Locale, Locales } from '@lems/localization';
import { useRouter } from '../../../../../../../i18n/navigation';

interface LanguageSwitcherProps {
  onClose?: () => void;
}

export const LanguageSwitcher: React.FC<LanguageSwitcherProps> = ({ onClose }) => {
  const router = useRouter();
  const theme = useTheme();
  const currentLocale = useLocale() as Locale;
  const currentLocaleData = Locales[currentLocale];
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const submenuOpen = Boolean(anchorEl);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLanguageChange = (locale: Locale) => {
    document.cookie = `LEMS_LOCALE=${locale}; path=/; max-age=${60 * 60 * 24 * 365}`;
    router.refresh();
    handleClose();
    onClose?.();
  };

  const direction = Locales[currentLocale].direction;

  return (
    <>
      <MenuItem
        onClick={handleClick}
        sx={{
          p: 0,
          borderRadius: 1,
          bgcolor: alpha(theme.palette.primary.main, 0.1),
          border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
          width: '100%',
          '&:hover': {
            bgcolor: alpha(theme.palette.primary.main, 0.15)
          }
        }}
      >
        <button
          onClick={handleClick}
          style={{
            display: 'flex',
            alignItems: 'center',
            width: '100%',
            background: 'none',
            border: 'none',
            padding: '8px 16px',
            cursor: 'pointer',
            textAlign: 'start',
            color: 'inherit'
          }}
        >
          <ListItemIcon sx={{ minWidth: 32, color: theme.palette.primary.main }}>
            <Language fontSize="small" />
          </ListItemIcon>
          <ListItemText>
            <Typography
              variant="body2"
              component="span"
              sx={{ fontWeight: 500, color: 'text.primary' }}
            >
              {currentLocaleData.displayName}
            </Typography>
          </ListItemText>
          <DirectionalIcon
            ltr={ChevronRight}
            rtl={ChevronLeft}
            fontSize="small"
            sx={{ ml: 1, color: 'text.secondary' }}
          />
        </button>
      </MenuItem>

      <Menu
        id="language-switcher-submenu"
        anchorEl={anchorEl}
        open={submenuOpen}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: direction === 'ltr' ? 'right' : 'left'
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: direction === 'ltr' ? 'right' : 'left'
        }}
        slotProps={{
          paper: {
            elevation: 0,
            sx: {
              overflow: 'visible',
              filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.32))',
              borderRadius: 1,
              minWidth: 150,
              py: 0.5,
              // ...margin,
              mt: -6,
              '& .MuiMenuItem-root': {
                py: 1
              },
              '&::after': {
                content: '""',
                display: 'block',
                position: 'absolute',
                bottom: -5,
                right: 25,
                width: 10,
                height: 10,
                bgcolor: 'background.paper',
                transform: 'rotate(45deg)',
                zIndex: -1
              }
            }
          }
        }}
      >
        {Object.entries(Locales).map(([localeKey, localeData]) => {
          return (
            <MenuItem
              key={localeKey}
              selected={localeKey === currentLocale}
              onClick={() => handleLanguageChange(localeKey as Locale)}
              sx={{
                dir: localeData.direction,
                '&.Mui-selected': { bgcolor: lighten(theme.palette.primary.main, 0.9) }
              }}
            >
              <ListItemText primary={localeData.displayName} />
            </MenuItem>
          );
        })}
      </Menu>
    </>
  );
};
