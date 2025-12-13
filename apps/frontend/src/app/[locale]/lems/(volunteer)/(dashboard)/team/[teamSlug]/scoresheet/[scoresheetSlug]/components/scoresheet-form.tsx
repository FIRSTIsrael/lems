'use client';

import { Stack } from '@mui/material';
import { scoresheet } from '@lems/shared/scoresheet';
import ScoresheetMission from './scoresheet-mission';

export const ScoresheetForm: React.FC = () => {
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
    </Stack>
  );
};
