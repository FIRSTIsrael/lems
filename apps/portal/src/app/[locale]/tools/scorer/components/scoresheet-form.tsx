'use client';

import { Typography, Stack } from '@mui/material';
import { getScoresheet } from '@lems/shared/scoresheet';
import { useScoresheetTranslations } from '@lems/localization';
import { useToolEdition } from '../../hooks/use-tool-edition';
import ScoresheetMission from './scoresheet-mission';
import { useScoresheetValidator } from './mission-context';

export const ScoresheetForm: React.FC = () => {
  const scoresheet = getScoresheet(useToolEdition());
  const { getError } = useScoresheetTranslations();
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
          src={`/assets/scoresheet/missions/${mission.id}.webp`}
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
