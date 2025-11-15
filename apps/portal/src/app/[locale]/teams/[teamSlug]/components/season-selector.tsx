'use client';

import { Box, FormControl, Select, MenuItem } from '@mui/material';
import { useRouter, useSearchParams } from 'next/navigation';
import useSWR from 'swr';
import { Season } from '@lems/types/api/portal';
import { useTeam } from './team-context';

interface SeasonSelectorProps {
  currentSeason: string;
}

export const SeasonSelector: React.FC<SeasonSelectorProps> = ({ currentSeason }) => {
  const team = useTeam();
  const router = useRouter();
  const searchParams = useSearchParams();

  const { data: seasons } = useSWR<Season[]>(() => `/portal/teams/${team.slug}/seasons`, {
    suspense: true,
    fallbackData: []
  });

  if (!seasons || seasons.length === 0) {
    return null;
  }

  const handleSeasonChange = (seasonSlug: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('season', seasonSlug);
    router.push(`?${params.toString()}`);
  };

  return (
    <Box p={2}>
      <FormControl size="small" fullWidth>
        <Select
          value={currentSeason === 'latest' ? seasons[0].slug : currentSeason}
          onChange={e => handleSeasonChange(e.target.value)}
          displayEmpty
        >
          {seasons.map(season => (
            <MenuItem key={season.slug} value={season.slug}>
              {season.name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </Box>
  );
};
