'use client';

import { Grid, Box, Paper } from '@mui/material';
import { DeliberationTable } from './deliberation-table';
import { PicklistPanel } from './picklist-panel';
import { ControlsPanel } from './controls-panel';
import { ScoresChart } from './scores-chart';

export function DeliberationGrid() {
  return (
    <Box sx={{ p: 2, height: '100vh', display: 'flex', flexDirection: 'column', gap: 2 }}>
      {/* Main content grid */}
      <Grid container spacing={2} sx={{ flex: 1, minHeight: 0 }}>
        {/* Left column - Data Table */}
        <Grid size={{ xs: 12, md: 8 }} sx={{ minHeight: 0 }}>
          <Paper
            sx={{
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              borderRadius: 2,
              boxShadow: theme => theme.shadows[2]
            }}
          >
            <DeliberationTable />
          </Paper>
        </Grid>

        {/* Right columns - Controls and Picklist */}
        <Grid
          size={{ xs: 12, md: 4 }}
          sx={{ minHeight: 0, display: 'flex', flexDirection: 'column', gap: 2 }}
        >
          {/* Controls Panel - Top */}
          <Paper
            sx={{
              flex: 1,
              borderRadius: 2,
              boxShadow: theme => theme.shadows[2],
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden'
            }}
          >
            <ControlsPanel />
          </Paper>

          {/* Picklist Panel - Bottom */}
          <Paper
            sx={{
              flex: 1,
              borderRadius: 2,
              boxShadow: theme => theme.shadows[2],
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden'
            }}
          >
            <PicklistPanel />
          </Paper>
        </Grid>
      </Grid>

      {/* Bottom - Chart */}
      <Paper
        sx={{
          height: '350px',
          borderRadius: 2,
          boxShadow: theme => theme.shadows[2],
          p: 2
        }}
      >
        <ScoresChart />
      </Paper>
    </Box>
  );
}
