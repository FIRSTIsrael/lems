'use client';

import { Box, Paper } from '@mui/material';
import { useFinalDeliberation } from '../../final-deliberation-context';
import { RoomScoresDistribution } from '../../../components/room-metrics';
import { CompareTeamsPicker } from '../../../components/compare-picker';
import { CoreAwardsDataGrid } from './core-awards-data-grid';
import { CoreAwardsAwardLists } from './core-awards-award-lists';
import { CoreAwardsControlsPanel } from './core-awards-controls-panel';

export const CoreAwardsStage: React.FC = () => {
  const { teams, roomMetrics } = useFinalDeliberation();

  return (
    <>
      <Box sx={{ flex: 1, display: 'flex', p: 2.5, gap: 2.5, overflow: 'auto' }}>
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
            <CoreAwardsDataGrid />
          </Paper>

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
          <Paper
            sx={{
              flex: 1,
              minHeight: 400,
              p: 2,
              borderRadius: 1.5,
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden'
            }}
          >
            <CoreAwardsAwardLists />
          </Paper>
          <CoreAwardsControlsPanel />
        </Box>
      </Box>
    </>
  );
};
