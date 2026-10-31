'use client';

import { Stack } from '@mui/material';
import { DEFAULT_SCORESHEET_SEASON } from '@lems/shared/scoresheet';
import { EditionToggle } from '../../components/edition-toggle';
import { useToolSeason } from '../hooks/use-tool-scoresheet';
import { SeasonSelect } from './season-select';

export const ScorerOptions: React.FC = () => {
  const season = useToolSeason();

  return (
    <Stack direction="row" spacing={2} sx={{ alignItems: 'center', flexWrap: 'wrap', mt: 2 }}>
      <SeasonSelect />
      {season === DEFAULT_SCORESHEET_SEASON && <EditionToggle />}
    </Stack>
  );
};
