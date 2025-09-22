'use client';

import { Typography, Stack } from '@mui/material';
import { SEASON_SCORESHEET } from '@lems/season';
import ScoresheetMission from './scoresheet-mission';
import { useScoresheetValidator } from './mission-context';

export const ScoresheetForm: React.FC = () => {
  const { errors } = useScoresheetValidator();

  return (
    <Stack spacing={4} mt={4} mb={16}>
      {SEASON_SCORESHEET.missions.map((mission, index) => (
        <ScoresheetMission
          key={mission.id}
          missionIndex={index}
          src={`/assets/scoresheet/missions/${mission.id}.webp`}
          mission={mission}
        />
      ))}
      {errors.map((error, index) => (
        <Typography key={index} color="error" fontWeight={600}>
          {error.description}
        </Typography>
      ))}
    </Stack>
  );
};
