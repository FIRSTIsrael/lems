'use client';

import { Box, Stack } from '@mui/material';
import type { Team } from '../graphql/types';
import { useCompareContext } from '../compare-context';
import { TeamInfo, TeamLogo } from './team-info';
import { CategoryRadarChart, AllCategoriesRadarChart } from './radar-charts';

interface TeamHeaderProps {
  team: Team;
}

export function TeamHeader({ team }: TeamHeaderProps) {
  const { category } = useCompareContext();

  return (
    <Stack spacing={2}>
      <Box
        sx={{
          position: 'relative',
          display: 'flex',
          alignItems: 'flex-start',
          gap: 2,
          direction: 'ltr'
        }}
      >
        <TeamInfo team={team} />

        <Box sx={{ flex: 1, minWidth: 0, order: 2 }}>
          {category ? (
            <CategoryRadarChart team={team} category={category} />
          ) : (
            <AllCategoriesRadarChart team={team} />
          )}
        </Box>

        <TeamLogo team={team} />
      </Box>
    </Stack>
  );
}
