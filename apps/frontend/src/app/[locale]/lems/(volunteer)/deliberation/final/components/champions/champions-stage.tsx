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
    <Box sx={{ flex: 1, display: 'flex', minHeight: 0, p: 2.5, gap: 2.5 }}>
      {/* Main content area */}
      <Box
        sx={{ flex: '0 1 75%', minHeight: 0, display: 'flex', flexDirection: 'column', gap: 2.5 }}
      >
        {/* DataGrid */}
        <Paper
          sx={{
            flex: '0 0 auto',
            height: '70%',
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
            flex: 1,
            minHeight: 0,
            display: 'flex',
            gap: 2.5,
            overflow: 'hidden'
          }}
        >
          <RoomScoresDistribution teams={teams} roomMetrics={roomMetrics} />
          <CompareTeamsPicker teams={teams} />
        </Box>
      </Box>

      {/* Sidebar: Podium and Controls */}
      <Box
        sx={{
          flex: '0 1 25%',
          minHeight: 0,
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
