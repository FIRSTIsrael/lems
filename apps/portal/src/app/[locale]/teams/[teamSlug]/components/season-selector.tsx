'use client';

import { Box, FormControl, Select, MenuItem } from '@mui/material';
import { useRouter, useSearchParams } from 'next/navigation';
import useSWR from 'swr';
import { Season } from '@lems/types/api/portal';

interface SeasonSelectorProps {
  currentSeason: string;
}

export const SeasonSelector: React.FC<SeasonSelectorProps> = ({ currentSeason }) => {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Fetch all seasons, not just the ones the team competed in
  const { data: seasons } = useSWR<Season[]>('/portal/seasons', {
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

  // Use currentSeason if it exists, otherwise default to the first season
  const selectedSeason = currentSeason ?? seasons[0]?.slug ?? '';

  return (
    <Box
      sx={{
        p: 2
      }}
    >
      <FormControl size="small" fullWidth>
        <Select
          value={selectedSeason}
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
