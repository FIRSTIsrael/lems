'use client';

import { Drawer, Divider, Typography, Stack, Box, useTheme } from '@mui/material';
import { LogoutButton } from '../logout-button';
import { ConnectionIndicator } from '../../../components/connection-indicator';
import { LanguageSwitcher } from './language-switcher';
import { UserInfoSection } from './user-info-section';
import { NavigationList } from './navigation-list';

export const DRAWER_WIDTH = 180;

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
          <NavigationList />
        </Box>

        <Divider />

        <Stack
          spacing={2}
          alignItems="center"
          justifyContent="center"
          sx={{ p: 2, display: 'flex', justifyContent: 'center', mb: 1 }}
        >
          <LanguageSwitcher />

          <LogoutButton variant="button" />
        </Stack>
      </Drawer>
    </>
  );
};
