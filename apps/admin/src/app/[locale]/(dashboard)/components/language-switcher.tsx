'use client';

import React, { useRef, useState } from 'react';
import { useLocale } from 'next-intl';
import { MenuItem, Menu, ListItemIcon, ListItemText, Typography } from '@mui/material';
import { Language } from '@mui/icons-material';
import { ChevronEndIcon, Locale, Locales } from '@lems/localization';
import { useRouter, usePathname } from '../../../../i18n/navigation';

interface LanguageSubmenuProps {
  anchorEl: HTMLButtonElement | null;
  onClose: () => void;
  onChangeLocale: (locale: Locale) => void;
}

const LanguageSubmenu: React.FC<LanguageSubmenuProps> = ({ anchorEl, onClose, onChangeLocale }) => {
  const currentLocale = useLocale() as Locale;
  const open = !!anchorEl;
  const direction = Locales[currentLocale].direction;
  const margin = direction === 'ltr' ? { marginLeft: '10px' } : { marginRight: '-10px' };

  return (
    <Menu
      id="language-switcher-submenu"
      anchorEl={anchorEl}
      open={open}
      onClose={onClose}
      anchorOrigin={{
        vertical: 'top',
        horizontal: direction === 'ltr' ? 'right' : 'left'
      }}
      transformOrigin={{
        vertical: 12,
        horizontal: direction === 'ltr' ? 'left' : 'right'
      }}
      slotProps={{
        list: {
          'aria-labelledby': 'language-switcher',
          sx: { minWidth: 150 },
          onClick: (e: React.MouseEvent) => e.stopPropagation() // Prevent closing parent menu
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
            // Tooltip arrow
            '&::after': {
              content: '""',
              display: 'block',
              position: 'absolute',
              top: 20,
              left: -5,
              width: 10,
              height: 10,
              bgcolor: 'background.paper',
              transform: 'translateY(50%) rotate(45deg)',
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
            sx={{ dir: localeData.direction }}
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
  const router = useRouter();
  const pathname = usePathname();
  const currentLocale = useLocale() as Locale;
  const currentLocaleData = Locales[currentLocale];

  const anchorRef = useRef<HTMLButtonElement>(null);
  const [submenuOpen, setSubmenuOpen] = useState(false);

  const handleToggleSubmenu = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    setSubmenuOpen(open => !open);
  };

  const handleCloseSubmenu = () => {
    setSubmenuOpen(false);
  };

  const handleLanguageChange = (locale: Locale) => {
    router.replace(pathname, { locale });
    setSubmenuOpen(false);
    onClose?.();
  };

  return (
    <>
      <MenuItem sx={{ p: 0 }}>
        <button
          ref={anchorRef}
          onClick={handleToggleSubmenu}
          style={{
            display: 'flex',
            alignItems: 'center',
            width: '100%',
            background: 'none',
            border: 'none',
            padding: '8px 16px',
            cursor: 'pointer',
            textAlign: 'start'
          }}
          aria-haspopup="true"
          aria-controls={submenuOpen ? 'language-switcher-submenu' : undefined}
        >
          <ListItemIcon>
            <Language fontSize="small" />
          </ListItemIcon>
          <ListItemText>
            <Typography variant="body2" component="span">
              {currentLocaleData.displayName}
            </Typography>
          </ListItemText>
          <ChevronEndIcon fontSize="small" sx={{ ml: 1 }} />
        </button>
      </MenuItem>

      <LanguageSubmenu
        anchorEl={submenuOpen ? anchorRef.current : null}
        onClose={handleCloseSubmenu}
        onChangeLocale={handleLanguageChange}
      />
    </>
  );
};
