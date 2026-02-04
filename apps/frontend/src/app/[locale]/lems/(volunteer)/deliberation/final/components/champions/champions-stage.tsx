'use client';

import { Box, Paper } from '@mui/material';
import { useFinalDeliberation } from '../../final-deliberation-context';
import { RoomScoresDistribution } from '../../../components/room-metrics';
import { CompareTeamsPicker } from '../../../components/compare-picker';
import { ChampionsDataGrid } from './champions-data-grid';
import { ChampionsPodium } from './champions-podium';
import { ChampionsControlsPanel } from './champions-controls-panel';

export const ChampionsStage: React.FC = () => {
  const { teams, roomMetrics } = useFinalDeliberation();

  return (
    <Box sx={{ flex: 1, display: 'flex', p: 2.5, gap: 2.5, overflow: 'auto' }}>
      {/* Main content area */}
      <Box
        sx={{
          flex: '1 1 auto',
          minWidth: 0,
          maxWidth: '75%',
          display: 'flex',
          flexDirection: 'column',
          gap: 2.5
        }}
      >
        {/* DataGrid */}
        <Paper
          sx={{
            flex: 1,
            minHeight: 600,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            borderRadius: 1.5
          }}
        >
          <ChampionsDataGrid />
        </Paper>

        {/* Metrics and Compare Section */}
        <Box
          sx={{
            flex: '0 0 auto',
            display: 'flex',
            gap: 2.5,
            minHeight: 300
          }}
        >
          <RoomScoresDistribution teams={teams} roomMetrics={roomMetrics} />
          <CompareTeamsPicker teams={teams} />
        </Box>
      </Box>

      {/* Sidebar: Podium and Controls */}
      <Box
        sx={{
          flex: '0 0 auto',
          width: 350,
          minWidth: 300,
          display: 'flex',
          flexDirection: 'column',
          gap: 2.5
        }}
      >
        <ChampionsPodium />
        <ChampionsControlsPanel />
      </Box>
    </Box>
  );
};
