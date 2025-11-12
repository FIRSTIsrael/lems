'use client';

import { ReactNode } from 'react';
import { Drawer, Divider, lighten, Typography, Stack, Box, useTheme } from '@mui/material';
import { Search } from '@mui/icons-material';
import { ConnectionIndicator } from '../../components/connection-indicator';
import { LanguageSwitcher } from './language-switcher';
import { UserInfoSection } from './user-info-section';

const DRAWER_WIDTH = 180;

export const DesktopAppBar = () => {
  const theme = useTheme();

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
            borderRight: '1px solid #e0e0e0',
            display: 'flex',
            flexDirection: 'column'
          }
        }}
      >
        <Stack
          spacing={2}
          alignItems="center"
          justifyContent="center"
          sx={{
            p: 2,
            background:
              theme.palette.mode === 'dark'
                ? `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${theme.palette.primary.main} 100%)`
                : `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
            color: 'white'
          }}
        >
          <Typography variant="h4">LEMS</Typography>
          <ConnectionIndicator />
        </Stack>
        <Divider />

        <Box sx={{ px: 1.5, py: 2 }}>
          <UserInfoSection />
        </Box>

        <Divider />

        <Box sx={{ flexGrow: 1 }}>
          <NavigationList items={navigationItems} />
        </Box>

        <Divider />
        <Box sx={{ p: 2, display: 'flex', justifyContent: 'center', mb: 1 }}>
          <LanguageSwitcher />
        </Box>
      </Drawer>
    </>
  );
};

const navigationItems = [
  { label: 'Dashboard', href: '#', icon: <Search />, active: true },
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
                bgcolor: lighten(theme.palette.primary.main, 0.7),
                color: 'text.primary',
                transform: 'translateY(-4px)',
                boxShadow: item.active ? theme.shadows[6] : theme.shadows[1]
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
            bgcolor={item.active ? lighten(theme.palette.primary.main, 0.8) : 'none'}
            width={70}
            height={40}
            key={item.label}
            display="flex"
            alignItems="center"
            justifyContent="center"
            color={item.active ? '' : 'text.secondary'}
            sx={{
              transition: 'background-color 0.25s, color 0.15s, box-shadow 0.15s, transform 0.15s',
              boxShadow: item.active ? theme.shadows[3] : 'none',
              transform: 'translateY(0)'
            }}
          >
            {item.icon}
          </Box>
          <Typography
            className="navigation-text"
            color={item.active ? theme.palette.primary.main : 'text.secondary'}
            mt={1}
            align="center"
            variant="body2"
            fontWeight={item.active ? 700 : 600}
            sx={{ transition: 'color 0.15s, font-weight 0.15s' }}
          >
            {item.label}
          </Typography>
        </Box>
      ))}
    </Stack>
  );
};
