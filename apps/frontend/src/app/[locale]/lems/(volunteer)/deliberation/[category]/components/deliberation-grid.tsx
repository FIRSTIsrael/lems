'use client';

import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Box, Paper, AppBar, Toolbar, IconButton, Typography } from '@mui/material';
import { ArrowBack } from '@mui/icons-material';
import { useJudgingCategoryTranslations } from '@lems/localization';
import { underscoresToHyphens } from '@lems/shared/utils';
import { useCategoryDeliberation } from '../deliberation-context';
import { DeliberationTable } from './deliberation-table';
import { PicklistPanel } from './picklist-panel';
import { ControlsPanel } from './controls-panel';
import { ScoresChart } from './scores-chart';

export function DeliberationGrid() {
  const router = useRouter();
  const t = useTranslations('pages.deliberations.category');
  const { getCategory } = useJudgingCategoryTranslations();
  const { deliberation } = useCategoryDeliberation();

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
          <IconButton edge="start" color="inherit" onClick={() => router.back()} sx={{ mr: 1 }}>
            <ArrowBack />
          </IconButton>
          <Typography variant="h6" sx={{ flex: 1, color: 'text.primary' }}>
            {t('title', {
              category: getCategory(underscoresToHyphens(deliberation?.category as string))
            })}
          </Typography>
        </Toolbar>
      </AppBar>

      {/* Main Content Area - Desktop Only */}
      <Box sx={{ flex: 1, display: 'flex', minHeight: 0, p: 2.5, gap: 2.5 }}>
        {/* Left Column: Table (top) + Chart (bottom) */}
        <Box
          sx={{ flex: '0 1 80%', minHeight: 0, display: 'flex', flexDirection: 'column', gap: 2.5 }}
        >
          {/* Data Table - Primary Focus */}
          <Paper
            sx={{
              flex: 1,
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

          <ScoresChart />
        </Box>

        {/* Right Column: Controls (top) + Picklist (bottom, fills remaining space) */}
        <Box
          sx={{
            flex: '0 1 20%',
            minHeight: 0,
            display: 'flex',
            flexDirection: 'column',
            gap: 2.5
          }}
        >
          {/* Controls Panel */}
          <Paper
            sx={{
              flex: '0 0 auto',
              borderRadius: 1.5,
              boxShadow: theme => theme.shadows[1],
              overflow: 'auto'
            }}
          >
            <ControlsPanel />
          </Paper>

          {/* Picklist Panel - Takes all remaining vertical space */}
          <Paper
            sx={{
              flex: 1,
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
    </Box>
  );
}
