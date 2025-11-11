'use client';

import { ReactNode } from 'react';
import { Drawer, Divider, alpha, Typography, Stack, Box, useTheme } from '@mui/material';
import { Search } from '@mui/icons-material';
import { ConnectionIndicator } from '../../components/connection-indicator';

const DRAWER_WIDTH = 180;

export const DesktopAppBar = () => {
  return (
    <>
      <Drawer
        open
        variant="permanent"
        sx={{
          width: DRAWER_WIDTH,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: DRAWER_WIDTH,
            boxSizing: 'border-box',
            borderRight: '1px solid #e0e0e0'
          }
        }}
      >
        <Stack spacing={2} alignItems="center" justifyContent="center" sx={{ p: 2 }}>
          <Typography variant="h4" gutterBottom>
            LEMS
          </Typography>

          <ConnectionIndicator />
        </Stack>
        <Divider />
        <NavigationList items={navigationItems} />
      </Drawer>
    </>
  );
};

const navigationItems = [
  { label: 'Dashboard', href: '#', icon: <Search /> },
  { label: 'Teams', href: '#', icon: <Search /> },
  { label: 'Matches', href: '#', icon: <Search /> },
  { label: 'Rankings', href: '#', icon: <Search /> }
];

interface NavigationListProps {
  items: Array<{ label: string; href: string; icon: ReactNode; active?: boolean }>;
  onItemClick?: () => void;
}

const NavigationList: React.FC<NavigationListProps> = ({ items, onItemClick }) => {
  const theme = useTheme();

  return (
    <Stack mt={2} spacing={4} alignItems="center">
      {items.map(item => (
        <Box
          key={item.label}
          sx={{
            cursor: 'pointer',
            '&:hover': {
              '& .navigation-icon': {
                bgcolor: alpha(theme.palette.primary.main, 0.2),
                color: 'text.primary'
              },
              '& .navigation-text': { color: 'text.primary', fontWeight: 700 }
            }
          }}
          onClick={onItemClick}
        >
          <Box
            className="navigation-icon"
            borderRadius={8}
            p={2}
            bgcolor={item.active ? alpha(theme.palette.primary.main, 0.15) : 'none'}
            width={70}
            height={40}
            key={item.label}
            display="flex"
            alignItems="center"
            justifyContent="center"
            color={item.active ? '' : 'text.secondary'}
            sx={{ transition: 'background-color 0.25s, color 0.15s' }}
          >
            {item.icon}
          </Box>
          <Typography
            className="navigation-text"
            color={item.active ? '' : 'text.secondary'}
            mt={1}
            variant="body2"
            fontWeight={item.active ? 700 : 600}
            sx={{ transition: 'color 0.15s, font-weight 0.15s' }}
          >
            Description
          </Typography>
        </Box>
      ))}
    </Stack>
  );
};
