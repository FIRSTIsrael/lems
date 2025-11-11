'use client';

import * as React from 'react';
import { AppBar, Divider, Drawer, IconButton, Toolbar, useMediaQuery } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { MenuRounded } from '@mui/icons-material';
import { ConnectionIndicator } from '../../components/connection-indicator';

const DRAWER_WIDTH = 180;

export const MobileAppBar = () => {
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up('lg'));
  const [menuOpen, setMenuOpen] = React.useState(isDesktop);

  const handleMenuToggle = () => {
    setMenuOpen(!menuOpen);
  };

  const handleMobileMenuClose = () => {
    setMenuOpen(false);
  };

  return (
    <>
      {!isDesktop && (
        <AppBar
          sx={{
            backgroundColor: 'white',
            color: 'text.primary',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.12), 0 1px 2px rgba(0, 0, 0, 0.24)',
            zIndex: theme.zIndex.drawer + 1,
            width: '100%'
          }}
        >
          <Toolbar disableGutters sx={{ px: 2, justifyContent: 'space-between' }}>
            <IconButton
              edge="start"
              color="inherit"
              aria-label="menu"
              onClick={handleMenuToggle}
              sx={{ mr: 2 }}
            >
              <MenuRounded />
            </IconButton>

            <ConnectionIndicator compact={!isDesktop} />
          </Toolbar>
        </AppBar>
      )}

      {/* Mobile Sidebar Drawer */}
      {!isDesktop && (
        <Drawer
          anchor="left"
          open={menuOpen}
          onClose={handleMobileMenuClose}
          sx={{
            '& .MuiDrawer-paper': {
              width: DRAWER_WIDTH,
              boxSizing: 'border-box',
              backgroundColor: '#f5f5f5'
            }
          }}
        >
          <Divider />
          {/* <NavigationList items={navigationItems} onItemClick={handleMobileMenuClose} /> */}
        </Drawer>
      )}
    </>
  );
};
