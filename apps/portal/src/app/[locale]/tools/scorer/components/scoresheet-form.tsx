'use client';

import { Typography, Stack } from '@mui/material';
import { scoresheet } from '@lems/shared/scoresheet';
import { useLocaleScoresheetError } from '@lems/localization';
import ScoresheetMission from './scoresheet-mission';
import { useScoresheetValidator } from './mission-context';

export const ScoresheetForm: React.FC = () => {
  const getErrorDescription = useLocaleScoresheetError();
  const { errors } = useScoresheetValidator();

  return (
    <Stack spacing={4} mt={4} mb={16}>
      {scoresheet.missions.map((mission, index) => (
        <ScoresheetMission
          key={mission.id}
          missionIndex={index}
          src={`/assets/scoresheet/missions/${mission.id}.webp`}
          mission={mission}
        />
      ))}
      {errors.map((error, index) => (
        <Typography key={index} color="error" fontWeight={600}>
          {getErrorDescription(error.id)}
        </Typography>
      ))}
    </Stack>
  );
};
