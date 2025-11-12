'use client';

import { AppBar, Drawer, IconButton, Toolbar, Box, Divider } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { Close, Menu as MenuIcon } from '@mui/icons-material';
import { useState } from 'react';
import { ConnectionIndicator } from '../../../components/connection-indicator';
import { NavigationList } from './navigation-list';
import { LanguageSwitcher } from './language-switcher';
import { UserInfoSection } from './user-info-section';

const DRAWER_WIDTH = 300;
const APP_BAR_HEIGHT = 64;

export const MobileAppBar = () => {
  const theme = useTheme();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <>
      <AppBar
        sx={{
          background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
          color: 'white',
          zIndex: theme.zIndex.drawer + 1,
          width: '100%',
          height: `${APP_BAR_HEIGHT}px`,
          boxShadow: theme.shadows[4]
        }}
        elevation={0}
      >
        <Toolbar disableGutters sx={{ px: 2, justifyContent: 'space-between', height: '100%' }}>
          <IconButton
            edge="start"
            color="inherit"
            aria-label="menu"
            onClick={() => setMenuOpen(prev => !prev)}
          >
            {menuOpen ? <Close /> : <MenuIcon />}
          </IconButton>

          <UserInfoSection />

          <ConnectionIndicator compact={true} />
        </Toolbar>
      </AppBar>

      <Drawer
        anchor="left"
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
        sx={{
          '& .MuiDrawer-paper': {
            width: DRAWER_WIDTH,
            mt: `${APP_BAR_HEIGHT}px`,
            boxSizing: 'border-box',
            background: 'white',
            color: 'text.primary',
            display: 'flex',
            flexDirection: 'column',
            height: `calc(100% - ${APP_BAR_HEIGHT}px)`
          }
        }}
      >
        <NavigationList onItemClick={() => setMenuOpen(false)} />

        <Divider sx={{ my: 1 }} />

        <Box sx={{ px: 2, py: 1.5 }}>
          <LanguageSwitcher onClose={() => setMenuOpen(false)} />
        </Box>
      </Drawer>
    </>
  );
};
