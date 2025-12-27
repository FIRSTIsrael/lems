'use client';

import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Grid, Box, Paper, AppBar, Toolbar, IconButton, Typography, Stack } from '@mui/material';
import { ArrowBack } from '@mui/icons-material';
import { DeliberationTable } from './deliberation-table';
import { PicklistPanel } from './picklist-panel';
import { ControlsPanel } from './controls-panel';
import { ScoresChart } from './scores-chart';

export function DeliberationGrid() {
  const router = useRouter();
  const t = useTranslations();

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      {/* Header with Back Button */}
      <AppBar
        position="static"
        elevation={1}
        sx={{
          backgroundColor: 'background.paper',
          borderBottom: theme => `1px solid ${theme.palette.divider}`
        }}
      >
        <Toolbar sx={{ minHeight: 56, gap: 1 }}>
          <IconButton
            edge="start"
            color="inherit"
            onClick={() => router.back()}
            aria-label={t('common.back')}
            sx={{ mr: 1 }}
          >
            <ArrowBack />
          </IconButton>
          <Typography variant="h6" sx={{ flex: 1, color: 'text.primary' }}>
            {t('deliberation.title')}
          </Typography>
        </Toolbar>
      </AppBar>

      {/* Main Content Area - Desktop Only */}
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0, p: 2.5, gap: 2 }}>
        {/* Top Section: Table + Picklist + Controls */}
        <Box sx={{ flex: 1, minHeight: 0, display: 'flex', gap: 2 }}>
          {/* Left: Data Table - Primary Focus (65%) */}
          <Paper
            sx={{
              flex: '0 1 65%',
              minHeight: 0,
              display: 'flex',
              flexDirection: 'column',
              borderRadius: 1.5,
              boxShadow: theme => theme.shadows[1],
              overflow: 'hidden'
            }}
          >
            <DeliberationTable />
          </Paper>

          {/* Right Column: Controls + Picklist Stack (35%) */}
          <Box
            sx={{
              flex: '0 1 35%',
              minHeight: 0,
              display: 'flex',
              flexDirection: 'column',
              gap: 2
            }}
          >
            {/* Controls Panel - Compact Header */}
            <Paper
              sx={{
                flex: '0 1 auto',
                borderRadius: 1.5,
                boxShadow: theme => theme.shadows[1],
                overflow: 'hidden'
              }}
            >
              <ControlsPanel />
            </Paper>

            {/* Picklist Panel - Flexible, Scrollable */}
            <Paper
              sx={{
                flex: '1 1 auto',
                minHeight: 0,
                borderRadius: 1.5,
                boxShadow: theme => theme.shadows[1],
                display: 'flex',
                flexDirection: 'column',
                overflow: 'auto'
              }}
            >
              <PicklistPanel />
            </Paper>
          </Box>
        </Box>

        {/* Bottom Section: Chart & Metrics - Secondary Focus */}
        <Paper
          sx={{
            flex: '0 0 260px',
            borderRadius: 1.5,
            boxShadow: theme => theme.shadows[1],
            p: 2,
            minHeight: 0,
            overflow: 'auto'
          }}
        >
          <ScoresChart />
        </Paper>
      </Box>
    </Box>
  );
}
