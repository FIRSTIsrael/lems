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
import { Metrics } from './metrics';

export const DeliberationGrid: React.FC = () => {
  const router = useRouter();
  const t = useTranslations('pages.deliberations.category');
  const { getCategory } = useJudgingCategoryTranslations();
  const { deliberation } = useCategoryDeliberation();

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
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

      <Box sx={{ flex: 1, display: 'flex', minHeight: 0, p: 2.5, gap: 2.5 }}>
        <Box
          sx={{ flex: '0 1 80%', minHeight: 0, display: 'flex', flexDirection: 'column', gap: 2.5 }}
        >
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

          <Metrics />
        </Box>

        <Box
          sx={{
            flex: '0 1 20%',
            minHeight: 0,
            display: 'flex',
            flexDirection: 'column',
            gap: 2.5
          }}
        >
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
};
