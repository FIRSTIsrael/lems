'use client';

import { Typography, Stack } from '@mui/material';
import { useScoresheetTranslations } from '@lems/localization';
import { useToolScoresheet } from '../hooks/use-tool-scoresheet';
import ScoresheetMission from './scoresheet-mission';
import { useScoresheetValidator } from './mission-context';

export const ScoresheetForm: React.FC = () => {
  const scoresheet = useToolScoresheet();
  const { getError } = useScoresheetTranslations(scoresheet.season);
  const { errors } = useScoresheetValidator();

  return (
    <Stack
      spacing={4}
      sx={{
        mt: 4,
        mb: 16
      }}
    >
      {scoresheet.missions.map((mission, index) => (
        <ScoresheetMission
          key={mission.id}
          missionIndex={index}
          season={scoresheet.season}
          src={`/assets/scoresheet/missions/${scoresheet.season}/${mission.id}.webp`}
          mission={mission}
        />
      ))}
      {errors.map((error, index) => (
        <Typography
          key={index}
          color="error"
          sx={{
            fontWeight: 600
          }}
        >
          {getError(error.id)}
        </Typography>
      ))}
    </Stack>
  );
};
