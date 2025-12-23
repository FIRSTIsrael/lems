'use client';

import React, { useCallback, useState } from 'react';
import { useLocale } from 'next-intl';
import {
  MenuItem,
  Menu,
  ListItemIcon,
  ListItemText,
  Typography,
  lighten,
  alpha,
  useTheme
} from '@mui/material';
import { Language, ChevronLeft, ChevronRight } from '@mui/icons-material';
import { DirectionalIcon, Locale, Locales } from '@lems/localization';

interface LanguageSubmenuProps {
  anchorEl: HTMLButtonElement | null;
  onClose: () => void;
  onChangeLocale: (locale: Locale) => void;
}

const LanguageSubmenu: React.FC<LanguageSubmenuProps> = ({ anchorEl, onClose, onChangeLocale }) => {
  const theme = useTheme();
  const currentLocale = useLocale() as Locale;
  const open = !!anchorEl;
  const direction = Locales[currentLocale].direction;
  const margin = direction === 'ltr' ? { marginLeft: '10px' } : { marginRight: '10px' };

  return (
    <Menu
      id="language-switcher-submenu"
      anchorEl={anchorEl}
      open={open}
      onClose={onClose}
      disableScrollLock
      anchorOrigin={{
        vertical: 'top',
        horizontal: direction === 'ltr' ? 'right' : 'left'
      }}
      transformOrigin={{
        vertical: 60,
        horizontal: direction === 'ltr' ? 'left' : 'right'
      }}
      slotProps={{
        list: {
          'aria-labelledby': 'language-switcher',
          sx: { minWidth: 150 },
          onClick: (e: React.MouseEvent) => e.stopPropagation()
        },
        paper: {
          elevation: 0,
          sx: {
            overflow: 'visible',
            filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.32))',
            borderRadius: 1,
            minWidth: 180,
            py: 0.5,
            ...margin,
            '& .MuiMenuItem-root': {
              py: 1
            },
            '&::after': {
              content: '""',
              display: 'block',
              position: 'absolute',
              bottom: 16,
              left: -5,
              width: 10,
              height: 10,
              bgcolor: 'background.paper',
              transform: 'translateY(-50%) rotate(45deg)',
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
            onClick={() => onChangeLocale(localeKey as Locale)}
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
  );
};

interface LanguageSwitcherProps {
  onClose?: () => void;
}

export const LanguageSwitcher: React.FC<LanguageSwitcherProps> = ({ onClose }) => {
  const theme = useTheme();
  const currentLocale = useLocale() as Locale;
  const currentLocaleData = Locales[currentLocale];

  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);
  const [submenuOpen, setSubmenuOpen] = useState(false);

  const handleToggleSubmenu = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    setSubmenuOpen(open => !open);
  };

  const handleCloseSubmenu = () => {
    setSubmenuOpen(false);
  };

  const handleLanguageChange = useCallback(
    (locale: Locale) => {
      document.cookie = `LEMS_LOCALE=${locale}; path=/; max-age=${60 * 60 * 24 * 365}`;
      window.location.reload(); // Reload using window to fix GQL issue

      setSubmenuOpen(false);
      onClose?.();
    },
    [onClose]
  );

  return (
    <>
      <MenuItem
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
          ref={setAnchorEl}
          onClick={handleToggleSubmenu}
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
          aria-haspopup="true"
          aria-controls={submenuOpen ? 'language-switcher-submenu' : undefined}
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

      <LanguageSubmenu
        anchorEl={submenuOpen ? anchorEl : null}
        onClose={handleCloseSubmenu}
        onChangeLocale={handleLanguageChange}
      />
    </>
  );
};
