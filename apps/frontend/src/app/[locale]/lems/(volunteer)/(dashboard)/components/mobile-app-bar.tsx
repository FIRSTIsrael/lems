'use client';

import * as React from 'react';
import {
  AppBar,
  Drawer,
  IconButton,
  List,
  ListItem,
  Stack,
  Toolbar,
  Typography,
  useMediaQuery
} from '@mui/material';
import { alpha, lighten, useTheme } from '@mui/material/styles';
import { MenuRounded } from '@mui/icons-material';
import { ConnectionIndicator } from '../../components/connection-indicator';

const DRAWER_WIDTH = 300;
const APP_BAR_HEIGHT = 64;

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
            zIndex: theme.zIndex.drawer + 1,
            width: '100%',
            height: `${APP_BAR_HEIGHT}px`
          }}
          elevation={0}
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
              mt: `${APP_BAR_HEIGHT}px`,
              boxSizing: 'border-box',
              backgroundColor: lighten(theme.palette.primary.main, 0.95)
            }
          }}
        >
          <NavigationList items={navigationItems} onItemClick={handleMobileMenuClose} />
        </Drawer>
      )}
    </>
  );
};

const navigationItems = [
  { label: 'Dashboard', href: '#', active: true },
  { label: 'Teams', href: '#' },
  { label: 'Matches', href: '#' },
  { label: 'Rankings', href: '#' }
];

interface NavigationListProps {
  items: Array<{ label: string; href: string; active?: boolean }>;
  onItemClick?: () => void;
}

const NavigationList: React.FC<NavigationListProps> = ({ items, onItemClick }) => {
  const theme = useTheme();

  return (
    <List component={Stack} spacing={1} sx={{ p: 2 }}>
      {items.map(item => (
        <ListItem
          key={item.label}
          sx={{
            cursor: 'pointer',
            bgcolor: item.active ? alpha(theme.palette.primary.main, 0.15) : 'none',
            boxShadow: item.active ? theme.shadows[3] : 'none',
            transition: 'box-shadow 0.15s, background-color 0.15s, transform 0.15s',
            borderRadius: 4,
            py: 1.5,
            '&:hover': {
              transform: 'translateY(-2px)',
              boxShadow: item.active ? theme.shadows[6] : theme.shadows[1],
              bgcolor: alpha(theme.palette.primary.main, 0.2),
              '& .navigation-text': { color: 'text.primary', fontWeight: 700 }
            }
          }}
          onClick={onItemClick}
        >
          <Typography
            className="navigation-text"
            color={item.active ? '' : 'text.secondary'}
            variant="body2"
            fontWeight={item.active ? 700 : 600}
            sx={{ transition: 'color 0.15s, font-weight 0.15s' }}
          >
            {item.label}
          </Typography>
        </ListItem>
      ))}
    </List>
  );
};
