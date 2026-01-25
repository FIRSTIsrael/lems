'use client';

import { Stack, Alert, Typography } from '@mui/material';
import { scoresheet } from '@lems/shared/scoresheet';
import { useScoresheetTranslations } from '@lems/localization';
import { useScoresheet } from '../scoresheet-context';
import ScoresheetMission from './scoresheet-mission';
import { ScoresheetIncompleteAlert } from './scoresheet-alert';
import { ScoreFloater } from './score-floater';
import { ScoresheetSubmission } from './scoresheet-submission';

interface ScoresheetFormProps {
  disabled?: boolean;
}

export const ScoresheetForm: React.FC<ScoresheetFormProps> = ({ disabled = false }) => {
  const { validation } = useScoresheet();
  const { getError } = useScoresheetTranslations();

  return (
    <Stack spacing={4} mt={4} mb={16}>
      {scoresheet.missions.map((mission, index) => (
        <ScoresheetMission
          key={mission.id}
          missionIndex={index}
          src={`/assets/scoresheet/missions/${mission.id}.webp`}
          mission={mission}
          missionErrors={validation.missionErrors.get(mission.id)?.errors}
          disabled={disabled}
        />
      ))}

      {validation.validatorErrors.length > 0 && (
        <Stack spacing={2}>
          {validation.validatorErrors.map(errorId => (
            <Alert key={errorId} severity="error">
              <Typography fontSize="0.875rem">{getError(errorId)}</Typography>
            </Alert>
          ))}
        </Stack>
      )}

      <ScoresheetIncompleteAlert validation={validation} />

      <ScoresheetSubmission />

      <ScoreFloater score={validation.score} />
    </Stack>
  );
};
