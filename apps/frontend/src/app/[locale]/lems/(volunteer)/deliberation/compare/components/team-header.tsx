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
    <Stack spacing={2} sx={{ containerType: 'inline-size' }}>
      <Box
        sx={{
          position: 'relative',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'flex-start',
          gap: 2,
          direction: 'ltr',
          '& > .MuiAvatar-root': { ml: 'auto' }
        }}
      >
        <TeamInfo team={team} />

        <Box
          sx={{
            flex: 1,
            minWidth: 0,
            order: 2,
            '@container (max-width: 640px)': { order: 4, flexBasis: '100%' }
          }}
        >
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
